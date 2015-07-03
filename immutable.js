/* @flow */

import { lens } from './lens'

import type { IndexedCollection, List } from 'immutable'
import type { Lens } from './lens'

export {
  index,
}

function index<A,B>(idx: number): Lens<List<A>,List<B>,A,B> {
  return lens(
    list => list.get(idx),
    (list, val) => list.set(idx, val)
  )
}
