/* @flow */

import type { IndexedCollection, List } from 'immutable'
import type { Lens } from './lens'

export {
  index,
}

function index<A,B>(idx: number): Lens<List<A>,List<B>,A,B> {
  return f => (pure, list) => {
    if (list.has(idx)) {
      return f(pure, list.get(idx)).map(v => list.set(idx, v))
    }
    else {
      return pure(list)
    }
  }
}
