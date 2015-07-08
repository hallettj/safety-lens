/* @flow */

import { foldrOf, lens } from './lens'
import { List, Map } from 'immutable'

import type { Getting, Lens_, Traversal_ } from './lens'

export {
  index,
  key,
  toListOf,
}

/*
 * Lens laws (pretend that `a == b` means `is(a,b)`):
 *
 * First, that if you put something, you can get it back out
 *
 *     get(lens, set(lens, val, obj)) == val
 *
 * Second that getting and then setting doesn't change the answer
 *
 *     set(lens, get(lens, obj), obj) == obj
 *
 * And third, putting twice is the same as putting once, or rather, that the second put wins.
 *
 *     set(lens, val1, set(lens, val2, obj)) == set(lens, val1, obj)
 */


function toListOf<S,A>(l: Getting<(_: List<A>) => List<A>,S,A>, obj: S): List<A> {
  return foldrOf(l, a => as => as.unshift(a), List(), obj)
}

/* List */

function index<A>(idx: number): Lens_<List<A>,A> {
  return lens(
    list => list.get(idx),
    (list, val) => list.set(idx, val)
  )
}


/* Map */

function key<K,V>(k: K): Lens_<Map<K,V>,V> {
  return lens(
    map => map.get(k),
    (map, val) => map.set(k, val)
  )
}
