import fs from 'node:fs'
import os from 'node:os'
import url from 'node:url'
import path from 'node:path'

import chalk from 'chalk'

let __dirname = url.fileURLToPath(new URL('.', import.meta.url))
if (os.platform() === 'win32') __dirname = __dirname.replace(/\\/g, '/').replace(/^[A-Za-z]:\//, '/')

/**
 * HACK to ensure modules are bundled in the correct order
 * such that dependent modules are loaded after their dependencies
 */
let LOAD_ORDER = {
  [path.resolve('')]: [
    ['current-balances.lua'],
    ['current-stamp-history.lua'],
    ['current-stamps-by-address.lua'],
    ['current-stamps-by-asset.lua'],
    ['stamps-v2.lua'],
    ['stamp-utils.lua'],
    ['stamp-fns.lua'],
    ['stamp-tests.lua'],
    ['stamp-handlers.lua'],
    ['stamp-graphql-server.lua', Infinity]
  ],
}
LOAD_ORDER = Object.keys(LOAD_ORDER)
  .reduce(
    (acc, cur) => {
      acc[cur] = LOAD_ORDER[cur]
        .map(([f, ...rest]) => [path.resolve(cur, f), ...rest])
      return acc
    },
    {}
  )

function findLoadOrder ({ dir, files }) {
  if (!LOAD_ORDER[dir]) return files

  const order = LOAD_ORDER[dir]

  function findLoadIndex (file) {
    const [, idx] = order
      .map(([f, explicit], implicit) => [f, explicit || implicit])
      /**
       * sufficiently large number to represent "somewhere in the middle"
       * but not the absolute last (Infinity)
       *
       * This allows shimming files
       * before (at most 9999 files before) or after this file
       */
      .find(([f]) => file === f) || [file, 10000]

    return idx
  }

  return files.sort((a, b) => findLoadIndex(a) - findLoadIndex(b))
}

// eslint-disable-next-line
const tap = (fn) => (arg) => {
  try { fn(arg) } catch {}
  return arg
}

function printUsage () {
  console.log(`
Bundle Usage:

  node bundler.js [name] [dir]

  node bundler.js @tilla/graphql packages/runtime/graphql
`)
}

function mapArgs (args) {
  const [name, dir] = args

  if (!name) {
    console.error('name not provided')
    printUsage()
  }

  if (!dir) {
    console.error('dir not provided')
    printUsage()
  }

  return { name, dir: path.resolve(__dirname, dir) }
}

function findFiles ({ dir, extension, ignore }) {
  let files = []

  fs.readdirSync(dir).forEach((file) => {
    const filePath = path.join(dir, file)
    const stat = fs.statSync(filePath)

    if (stat.isDirectory()) files = files.concat(findFiles({ dir: path.resolve(dir, file), extension, ignore }))
    else if (stat.isFile() && file.endsWith(extension) && !ignore.includes(file)) files.push(filePath)
  })

  files = findLoadOrder({ dir, files })

  return files
}

function fileToModule ({ dir, file }) {
  const code = fs.readFileSync(file, 'utf-8')

  return {
    mod: file
      .replace(`${dir}/`, '')
      .replace(/\.lua$/, '')
      .replace(/\//g, '.')
      .replace(/-/g, '_'),
    code
  }
}

function moduleToLoadedModule ({ name, mod, code }) {
  mod = mod
    .replace(/-/g, '_')

  const isEntry = mod === 'init'
  const fn = `load_${mod.replace(/\./g, '_')}`

  return `
local function ${fn}()
  ${code}
end
_G.package.loaded["${name}.${mod}"] = ${fn}()
${isEntry ? `_G.package.loaded["${name}"] = _G.package.loaded["${name}.${mod}"]` : ''}
`
}

function toBundle ({ dir, loadedModules }) {
  const bundle = loadedModules.join('\n\n')
  const dest = path.resolve(dir, 'bundle.lua')
  fs.writeFileSync(dest, bundle)
  return dest
}

function main (args) {
  return Promise.resolve(args)
    .then(mapArgs)
    .then(({ name, dir }) =>
      Promise.resolve(findFiles({ dir, extension: '.lua', ignore: ['bundle.lua'] }))
        // .then(files => { console.log(files); return files })
        .then((files) => files.map((file) => fileToModule({ dir, file })))
        .then((mods) => mods.map((mod) => moduleToLoadedModule({ name, mod: mod.mod, code: mod.code })))
        .then((loadedModules) => toBundle({ dir, loadedModules }))
        .then((bundle) => console.log(chalk.green(`Created bundle for ${name}: ${bundle}`)))
    )
}

main(process.argv.slice(2))