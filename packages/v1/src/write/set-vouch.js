import { of } from '../lib/either.js'

export function setVouch(state, action) {
  return of({ state, action })
    .chain(isOwner)
    .map(update)

}