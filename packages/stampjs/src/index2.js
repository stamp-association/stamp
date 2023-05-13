import svcs from './svcs/index.js'
import { register } from './lib/register.js'
import { stamp } from './lib/stamp.js'
import { count } from './lib/count.js'
import { counts } from './lib/counts.js'


export default {
  init: {
    register: (tx) => register(tx).fold(handleError, handleSuccess),
    stamp: (tx, qty, tags) => stamp(tx, qty, tags).toPromise(),
    count: (txID) => count(txID).toPromise(),
    counts: (txIDs) => counts(txIDs).toPromise(),
    hasStamped: (tx) => hasStamped(tx).toPromise()
  }
}