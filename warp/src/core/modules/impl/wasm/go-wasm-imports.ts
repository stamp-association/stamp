// Copyright 2018 The Go Authors. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.
//
// This file has been modified for use by the TinyGo compiler.

// note: this file has been further modified to be used
// with Warp SDK.
/* tslint:disable */
/* eslint-disable */
/* YOLO */
import { LoggerFactory, SmartWeaveGlobal } from '@warp';

const encoder = new TextEncoder();
const decoder = new TextDecoder('utf-8');
let logLine = [];

let globalJsModule;

// crying while committing...
(function (global) {
  globalJsModule = global;
  globalJsModule.redstone = {
    go: {}
  };
}.call(
  this,
  typeof global !== 'undefined'
    ? global
    : typeof self !== 'undefined'
    ? self
    : typeof window !== 'undefined'
    ? window
    : {}
));

export class Go {
  private _callbackTimeouts: Map<any, any>;
  private _nextCallbackTimeoutID: number;
  private _inst: any;
  private _values: any;
  private _ids: any;
  private _idPool: any;
  private _goRefCounts: any;
  importObject: any;
  private exited: boolean;
  private _resolveCallbackPromise: () => void;
  private _pendingEvent: any;
  private _id: string;
  public exports: any;

  constructor(swGlobal: SmartWeaveGlobal) {
    this._callbackTimeouts = new Map();
    this._nextCallbackTimeoutID = 1;

    const wasmLogger = LoggerFactory.INST.create('WASM:Go');

    let go = this;
    // it is safe to redeclare this for each new module in the global scope
    // - this function is called only during module initialization.
    globalJsModule.redstone.go = {
      WasmModule: {
        registerWasmModule: function (moduleId) {
          go._id = moduleId;
          go.exports = globalJsModule[moduleId];
          delete globalJsModule[moduleId];

          globalJsModule.redstone.go[moduleId] = {};
          globalJsModule.redstone.go[moduleId].imports = {
            console: {
              log: function (...args) {
                wasmLogger.debug(args[0], ...args.slice(1));
              }
            },
            Transaction: {
              id: function () {
                return swGlobal.transaction.id;
              },
              owner: function () {
                return swGlobal.transaction.owner;
              },
              target: function () {
                return swGlobal.transaction.target;
              }
            },
            Block: {
              indep_hash: function () {
                return swGlobal.block.indep_hash;
              },
              height: function () {
                return swGlobal.block.height;
              },
              timestamp: function () {
                return swGlobal.block.timestamp;
              }
            },
            Contract: {
              id: function () {
                return swGlobal.contract.id;
              },
              owner: function () {
                return swGlobal.contract.owner;
              }
            },
            SmartWeave: {
              readContractState: async function (contractTxId) {
                return await swGlobal.contracts.readContractState(contractTxId);
              }
            }
          };
        }
      }
    };

    const mem = () => {
      // The buffer may change when requesting more memory.
      return new DataView(this._inst.exports.memory.buffer);
    };

    const setInt64 = (addr, v) => {
      mem().setUint32(addr + 0, v, true);
      mem().setUint32(addr + 4, Math.floor(v / 4294967296), true);
    };

    const getInt64 = (addr) => {
      const low = mem().getUint32(addr + 0, true);
      const high = mem().getInt32(addr + 4, true);
      return low + high * 4294967296;
    };

    const loadValue = (addr) => {
      const f = mem().getFloat64(addr, true);
      if (f === 0) {
        return undefined;
      }
      if (!isNaN(f)) {
        return f;
      }

      const id = mem().getUint32(addr, true);
      return this._values[id];
    };

    const storeValue = (addr, v) => {
      const nanHead = 0x7ff80000;

      if (typeof v === 'number') {
        if (isNaN(v)) {
          mem().setUint32(addr + 4, nanHead, true);
          mem().setUint32(addr, 0, true);
          return;
        }
        if (v === 0) {
          mem().setUint32(addr + 4, nanHead, true);
          mem().setUint32(addr, 1, true);
          return;
        }
        mem().setFloat64(addr, v, true);
        return;
      }

      switch (v) {
        case undefined:
          mem().setFloat64(addr, 0, true);
          return;
        case null:
          mem().setUint32(addr + 4, nanHead, true);
          mem().setUint32(addr, 2, true);
          return;
        case true:
          mem().setUint32(addr + 4, nanHead, true);
          mem().setUint32(addr, 3, true);
          return;
        case false:
          mem().setUint32(addr + 4, nanHead, true);
          mem().setUint32(addr, 4, true);
          return;
      }

      let id = this._ids.get(v);
      if (id === undefined) {
        id = this._idPool.pop();
        if (id === undefined) {
          id = this._values.length;
        }
        this._values[id] = v;
        this._goRefCounts[id] = 0;
        this._ids.set(v, id);
      }
      this._goRefCounts[id]++;
      let typeFlag = 1;
      switch (typeof v) {
        case 'string':
          typeFlag = 2;
          break;
        case 'symbol':
          typeFlag = 3;
          break;
        case 'function':
          typeFlag = 4;
          break;
      }
      mem().setUint32(addr + 4, nanHead | typeFlag, true);
      mem().setUint32(addr, id, true);
    };

    const loadSlice = (array, len, cap = null) => {
      return new Uint8Array(this._inst.exports.memory.buffer, array, len);
    };

    const loadSliceOfValues = (array, len, cap) => {
      const a = new Array(len);
      for (let i = 0; i < len; i++) {
        a[i] = loadValue(array + i * 8);
      }
      return a;
    };

    const loadString = (ptr, len) => {
      return decoder.decode(new DataView(this._inst.exports.memory.buffer, ptr, len));
    };

    const timeOrigin = Date.now() - performance.now();
    this.importObject = {
      wasi_snapshot_preview1: {
        // https://github.com/WebAssembly/WASI/blob/main/phases/snapshot/docs.md#fd_write
        fd_write: function (fd, iovs_ptr, iovs_len, nwritten_ptr) {
          let nwritten = 0;
          if (fd == 1) {
            for (let iovs_i = 0; iovs_i < iovs_len; iovs_i++) {
              let iov_ptr = iovs_ptr + iovs_i * 8; // assuming wasm32
              let ptr = mem().getUint32(iov_ptr + 0, true);
              let len = mem().getUint32(iov_ptr + 4, true);
              nwritten += len;
              for (let i = 0; i < len; i++) {
                let c = mem().getUint8(ptr + i);
                if (c == 13) {
                  // CR
                  // ignore
                } else if (c == 10) {
                  // LF
                  // write line
                  let line = decoder.decode(new Uint8Array(logLine));
                  logLine = [];
                  console.log(line);
                } else {
                  logLine.push(c);
                }
              }
            }
          } else {
            console.error('invalid file descriptor:', fd);
          }
          mem().setUint32(nwritten_ptr, nwritten, true);
          return 0;
        },
        fd_close: () => 0, // dummy
        fd_fdstat_get: () => 0, // dummy
        fd_seek: () => 0, // dummy
        proc_exit: (code) => {
          // @ts-ignore
          if (global.process) {
            // Node.js
            process.exit(code);
          } else {
            // Can't exit in a browser.
            throw 'trying to exit with code ' + code;
          }
        },
        random_get: (bufPtr, bufLen) => {
          crypto.getRandomValues(loadSlice(bufPtr, bufLen, null));
          return 0;
        }
      },
      env: {
        // func ticks() float64
        'runtime.ticks': () => {
          return timeOrigin + performance.now();
        },

        // func sleepTicks(timeout float64)
        'runtime.sleepTicks': (timeout) => {
          // Do not sleep, only reactivate scheduler after the given timeout.
          setTimeout(this._inst.exports.go_scheduler, timeout);
        },

        // func finalizeRef(v ref)
        // https://github.com/tinygo-org/tinygo/issues/1140#issuecomment-718145455
        'syscall/js.finalizeRef': (v_addr) => {
          // Note: TinyGo does not support finalizers so this is only called
          // for one specific case, by js.go:jsString.
          const id = mem().getUint32(v_addr, true);
          this._goRefCounts[id]--;
          if (this._goRefCounts[id] === 0) {
            const v = this._values[id];
            this._values[id] = null;
            this._ids.delete(v);
            this._idPool.push(id);
          }
        },

        // func stringVal(value string) ref
        'syscall/js.stringVal': (ret_ptr, value_ptr, value_len) => {
          const s = loadString(value_ptr, value_len);
          storeValue(ret_ptr, s);
        },

        // func valueGet(v ref, p string) ref
        'syscall/js.valueGet': (retval, v_addr, p_ptr, p_len) => {
          let prop = loadString(p_ptr, p_len);
          let value = loadValue(v_addr);
          let result = Reflect.get(value, prop);
          storeValue(retval, result);
        },

        // func valueSet(v ref, p string, x ref)
        'syscall/js.valueSet': (v_addr, p_ptr, p_len, x_addr) => {
          const v = loadValue(v_addr);
          const p = loadString(p_ptr, p_len);
          const x = loadValue(x_addr);
          Reflect.set(v, p, x);
        },

        // func valueDelete(v ref, p string)
        'syscall/js.valueDelete': (v_addr, p_ptr, p_len) => {
          const v = loadValue(v_addr);
          const p = loadString(p_ptr, p_len);
          Reflect.deleteProperty(v, p);
        },

        // func valueIndex(v ref, i int) ref
        'syscall/js.valueIndex': (ret_addr, v_addr, i) => {
          storeValue(ret_addr, Reflect.get(loadValue(v_addr), i));
        },

        // valueSetIndex(v ref, i int, x ref)
        'syscall/js.valueSetIndex': (v_addr, i, x_addr) => {
          Reflect.set(loadValue(v_addr), i, loadValue(x_addr));
        },

        // func valueCall(v ref, m string, args []ref) (ref, bool)
        'syscall/js.valueCall': (ret_addr, v_addr, m_ptr, m_len, args_ptr, args_len, args_cap) => {
          const v = loadValue(v_addr);
          const name = loadString(m_ptr, m_len);
          const args = loadSliceOfValues(args_ptr, args_len, args_cap);
          try {
            const m = Reflect.get(v, name);
            storeValue(ret_addr, Reflect.apply(m, v, args));
            mem().setUint8(ret_addr + 8, 1);
          } catch (err) {
            storeValue(ret_addr, err);
            mem().setUint8(ret_addr + 8, 0);
          }
        },

        // func valueInvoke(v ref, args []ref) (ref, bool)
        'syscall/js.valueInvoke': (ret_addr, v_addr, args_ptr, args_len, args_cap) => {
          try {
            const v = loadValue(v_addr);
            const args = loadSliceOfValues(args_ptr, args_len, args_cap);
            storeValue(ret_addr, Reflect.apply(v, undefined, args));
            mem().setUint8(ret_addr + 8, 1);
          } catch (err) {
            storeValue(ret_addr, err);
            mem().setUint8(ret_addr + 8, 0);
          }
        },

        // func valueNew(v ref, args []ref) (ref, bool)
        'syscall/js.valueNew': (ret_addr, v_addr, args_ptr, args_len, args_cap) => {
          const v = loadValue(v_addr);
          const args = loadSliceOfValues(args_ptr, args_len, args_cap);
          try {
            storeValue(ret_addr, Reflect.construct(v, args));
            mem().setUint8(ret_addr + 8, 1);
          } catch (err) {
            storeValue(ret_addr, err);
            mem().setUint8(ret_addr + 8, 0);
          }
        },

        // func valueLength(v ref) int
        'syscall/js.valueLength': (v_addr) => {
          return loadValue(v_addr).length;
        },

        // valuePrepareString(v ref) (ref, int)
        'syscall/js.valuePrepareString': (ret_addr, v_addr) => {
          const s = String(loadValue(v_addr));
          const str = encoder.encode(s);
          storeValue(ret_addr, str);
          setInt64(ret_addr + 8, str.length);
        },

        // valueLoadString(v ref, b []byte)
        'syscall/js.valueLoadString': (v_addr, slice_ptr, slice_len, slice_cap) => {
          const str = loadValue(v_addr);
          loadSlice(slice_ptr, slice_len, slice_cap).set(str);
        },

        // func valueInstanceOf(v ref, t ref) bool
        'syscall/js.valueInstanceOf': (v_addr, t_addr) => {
          return loadValue(v_addr) instanceof loadValue(t_addr);
        },

        // func copyBytesToGo(dst []byte, src ref) (int, bool)
        'syscall/js.copyBytesToGo': (ret_addr, dest_addr, dest_len, dest_cap, source_addr) => {
          let num_bytes_copied_addr = ret_addr;
          let returned_status_addr = ret_addr + 4; // Address of returned boolean status variable

          const dst = loadSlice(dest_addr, dest_len);
          const src = loadValue(source_addr);
          if (!(src instanceof Uint8Array)) {
            mem().setUint8(returned_status_addr, 0); // Return "not ok" status
            return;
          }
          const toCopy = src.subarray(0, dst.length);
          dst.set(toCopy);
          setInt64(num_bytes_copied_addr, toCopy.length);
          mem().setUint8(returned_status_addr, 1); // Return "ok" status
        },

        // copyBytesToJS(dst ref, src []byte) (int, bool)
        // Originally copied from upstream Go project, then modified:
        //   https://github.com/golang/go/blob/3f995c3f3b43033013013e6c7ccc93a9b1411ca9/misc/wasm/wasm_exec.js#L404-L416
        'syscall/js.copyBytesToJS': (ret_addr, dest_addr, source_addr, source_len, source_cap) => {
          let num_bytes_copied_addr = ret_addr;
          let returned_status_addr = ret_addr + 4; // Address of returned boolean status variable

          const dst = loadValue(dest_addr);
          const src = loadSlice(source_addr, source_len);
          if (!(dst instanceof Uint8Array)) {
            mem().setUint8(returned_status_addr, 0); // Return "not ok" status
            return;
          }
          const toCopy = src.subarray(0, dst.length);
          dst.set(toCopy);
          setInt64(num_bytes_copied_addr, toCopy.length);
          mem().setUint8(returned_status_addr, 1); // Return "ok" status
        }
      }
    };
  }

  async run(instance) {
    this._inst = instance;
    this._values = [
      // JS values that Go currently has references to, indexed by reference id
      NaN,
      0,
      null,
      true,
      false,
      global,
      this
    ];
    this._goRefCounts = []; // number of references that Go has to a JS value, indexed by reference id
    this._ids = new Map(); // mapping from JS values to reference ids
    this._idPool = []; // unused ids that have been garbage collected
    this.exited = false; // whether the Go program has exited

    const mem = new DataView(this._inst.exports.memory.buffer);

    while (true) {
      const callbackPromise = new Promise((resolve) => {
        this._resolveCallbackPromise = () => {
          if (this.exited) {
            throw new Error('bad callback: Go program has already exited');
          }
          setTimeout(resolve, 0); // make sure it is asynchronous
        };
      });
      this._inst.exports._start();
      if (this.exited) {
        break;
      }
      await callbackPromise;
    }
  }

  _resume() {
    if (this.exited) {
      throw new Error('Go program has already exited');
    }
    this._inst.exports.resume();
    if (this.exited) {
      this._resolveExitPromise();
    }
  }

  _makeFuncWrapper(id) {
    const go = this;
    return function () {
      const event = { id: id, this: this, args: arguments };
      go._pendingEvent = event;
      go._resume();
      // @ts-ignore
      return event.result;
    };
  }

  private _resolveExitPromise() {}
}
