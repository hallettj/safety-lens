/* @flow */

import { foldrOf, lens } from './lens'
import { ap } from './src/Applicative'
import { Collection, Iterable, List, Record, Set, Seq, Stack } from 'immutable'

import type { Endo, Fold, Lens_, Traversal_ } from './lens'

export {
  contains,
  field,
  index,
  toListOf,
  toStackOf,
  traverse,
}

/* lenses */

function field<S:Object,A>(name: $Enum<S>): Lens_<Record<S>,A> {
  return lens(
    obj => obj.get(name),
    (obj, val) => obj.set(name, val)
  )
}

function contains<V>(val: V): Lens_<Set<V>, boolean> {
  return lens(
    obj => obj.has(val),
    (obj, b) => b ? obj.add(val) : obj.remove(val)
  )
}


/* traversals */

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

/*
 * You can use the `traverse` function to get a `Traversal` from any
 * `Traversable` value.
 *
 * A `Traversal` is a specialized lens: it can act as a setter,
 * but cannot be used as a getter with the `get` function.
 *
 * For example:
 *
 *     var xs = List([1,2,3])
 *
 *     over(traverse, x => x * 2, xs)
 *
 *     assert(is( xs, List([2,4,6]))
 *
 * You can use `lookup` with a `Traversal` to get values out of a structure
 * wrapped in a `Maybe` result.
 * For example, using `index`, which is a traversal:
 *
 *     import { Just, Nothing } from 'lens/src/Maybe'
 *
 *     var x = lookup(index(1), xs)
 *
 *     assert( x instanceof Just )
 *     assert( x.value === 2 )
 *
 *     var y = lookup(index(9), xs)
 *
 *     assert( y instanceof Nothing )
 *     assert( y.value === undefined )
 *
 */

function traverse<A,K,B, TB: Iterable<K,B>, FTB: Apply<TB>>(
  f: <FB: Apply<B>>(pure: Pure, _: A) => FB
): (pure: Pure, obj: Iterable<K,A>) => FTB {
  return (pure, obj) => {
    if (obj instanceof Iterable.Keyed || obj instanceof Collection.Keyed) {
      return traverseKeyedIterable(f)(pure, obj)
    }
    else if (obj instanceof Iterable){
      return traverseIterable(f)(pure, obj)
    }
    else {
      throw new TypeError("No `traverse` implementation for "+ nameOfType(obj))
    }
  }
}

type UnkeyedIterable<T> = Seq.Indexed<T> | Seq.Set<T> | Iterable.Indexed<T> | Iterable.Set<T>

function traverseIterable<A,B, TB: UnkeyedIterable<B>, FTB: Apply<TB>>(
  f: <FB: Apply<B>>(pure: Pure, _: A) => FB
): (pure: Pure, obj: UnkeyedIterable<A>) => FTB {
  return (pure, obj) => {
    var cons = consImpl(obj)
    var emptyColl = obj.take(0)
    return obj.reduceRight((ys, x) => f(pure, x).map(cons).ap(ys), pure(emptyColl))
  }
}

function traverseKeyedIterable<A,B, TB: Iterable.Keyed<B>, FTB: Apply<TB>>(
  f: <FB: Apply<B>>(pure: Pure, _: A) => FB
): (pure: Pure, obj: Iterable.Keyed<A>) => FTB {
  return (pure, obj) => {
    var cons = consKeyedImpl(obj)
    var emptyColl = obj.take(0)
    return obj.reduceRight(
      (ys, x, key) => f(pure, x).map(cons).ap(pure(key)).ap(ys),
      pure(emptyColl)
    )
  }
}

function consImpl<A,S: UnkeyedIterable<A>>(coll: S): (val: A) => (coll: S) => S {
  if (coll instanceof List || coll instanceof Stack) {
    return val => coll => coll.unshift(val)
  }
  else if (coll instanceof Set) {
    return val => coll => coll.add(val)
  }
  else {
    var emptyColl = coll.take(0)
    return val => coll => emptyColl.concat(val).concat(coll)
  }
}

function consKeyedImpl<A,K,S: Iterable.Keyed<K,A>>(coll: S):
  (val: A) => (key: K) => (coll: S) => S {
  if (coll instanceof Map) {
    return val => key => coll => coll.set(key, val)
  }
  else {
    var emptyColl = coll.take(0)
    return val => key => coll => emptyColl.concat([[key,val]]).concat(coll)
  }
}

function nameOfType(obj: Object) {
  return obj && obj.constructor && obj.constructor.name ? obj.constructor.name : String(obj)
}


/* traversing */

function toListOf<S,A>(l: Fold<Endo<List<A>>,S,A>, obj: S): List<A> {
  return foldrOf(l, (x, xs) => xs.unshift(x), List(), obj)
}

/*
 * Constructing a stack using foldr might be more efficient than constructing
 * a list, since Immutable's Stack is implemented as a linked list, while List
 * is implemented as a tree-backed vector.
 */
function toStackOf<S,A>(l: Fold<Endo<Stack<A>>,S,A>, obj: S): Stack<A> {
  return foldrOf(l, (x, xs) => xs.unshift(x), Stack(), obj)
}
