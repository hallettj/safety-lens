/* @flow */

import { foldrOf, lens } from './lens'
import { Iterable, List, Set } from 'immutable'

import type { Getting, Lens_, Traversal_ } from './lens'

export {
  contains,
  index,
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

function contains<V>(val: V): Lens_<Set<V>, boolean> {
  return lens(
    obj => obj.has(val),
    (obj, b) => b ? obj.add(val) : obj.remove(val)
  )
}

function index<K,V, S:Iterable<K,V>>(idx: K): Traversal_<S,V> {
  return f => (pure, obj) => {
    if (obj.has(idx)) {
      return f(pure, obj.get(idx)).map(updatedValue => {
        // Optimize update for certain types
        if (typeof obj.set === 'function') {
          return obj.set(idx, updatedValue)
        }
        else {
          // This works for any Iterable, but might not give the most efficient update.
          return obj.map((v, k) => k === idx ? updatedValue : v)
        }
      })
    }
    else {
      return pure(obj)
    }
  }
}
