/* @flow */

import { foldrOf, lens } from './lens'
import { Just, Nothing, just, nothing } from './src/Maybe'
import { ap } from './src/Applicative'
import { Iterable, List, Set, Seq } from 'immutable'

import type { Getting, Lens_, Traversal_ } from './lens'
import type { Maybe } from './src/Maybe'

export {
  contains,
  index,
  toListOf,
  traverse,
}

/*
 * You can use the `traverse` function to get a `Traversal` from any
 * `Traversable` value.
 *
 * A `Traversal` is a specialized lens: it can act as a setter,
 * not as a getter.
 *
 * For example:
 *
 *     var xs = List([1,2,3])
 *
 *     over(traverse, x => x * 2, xs)
 *
 *     assert(is( xs, List([2,4,6]))
 *
 * You can use `traverseOf` with a `Traversal` to get values out of a structure
 * if the results are wrapped in an `Apply` type, such as `Maybe`.
 * For example, using `index`, which is a traversal:
 *
 *     import { just } from 'lens/src/Maybe'
 *
 *     var x = traverseOf(just, index(1), just, xs)
 *
 *     assert( x instanceof Just )
 *     assert( x.value === 2 )
 *
 */
export type Traversable<T> = Maybe<T> | Iterable<any,T>

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

function traverse<A,B, TB: Traversable<B>, FTB: Apply<TB>>(
  pure: Pure,
  f: <FB: Apply<B>>(_: A) => FB
): (obj: Traversable<A>) => FTB {
  return obj => {
    if (obj instanceof Just || obj instanceof Nothing) {
      return traverseMaybe(pure, f)(obj)
    }
    else if (obj instanceof Iterable.Keyed) {
      return traverseKeyedIterable(pure, f)(obj)
    }
    else if (obj instanceof Iterable){
      return traverseIterable(pure, f)(obj)
    }
    else {
      throw new TypeError("No `traverse` implementation for "+ nameOfType(obj))
    }
  }
}

function traverseMaybe<A,B, FTB: Apply<Maybe<B>>>(
  pure: Pure,
  f: <FB: Apply<B>>(_: A) => FB
): (obj: Maybe<A>) => FTB {
  return obj => {
    if (obj instanceof Just) {
      return f(obj.value).map(just)
    }
    else {
      return pure(nothing)
    }
  }
}

type UnkeyedIterable<T> = Seq.Indexed<T> | Seq.Set<T> | Iterable.Indexed<T> | Iterable.Set<T>

function traverseIterable<A,B, TB: UnkeyedIterable<B>, FTB: Apply<TB>>(
  pure: Pure,
  f: <FB: Apply<B>>(_: A) => FB
): (obj: UnkeyedIterable<A>) => FTB {
  return obj => {
    var push = pure(coll => x => coll.concat(x))
    var emptyColl = obj.take(0)
    return obj.reduce((ys, x) => ap(ap(push, ys), f(x)), pure(emptyColl))
  }
}

function traverseKeyedIterable<A,B, TB: Iterable.Keyed<B>, FTB: Apply<TB>>(
  pure: Pure,
  f: <FB: Apply<B>>(_: A) => FB
): (obj: Iterable.Keyed<A>) => FTB {
  return obj => {
    var push = pure(coll => x => key => coll.concat([[key,x]]))
    var emptyColl = obj.take(0)
    return obj.reduce((ys, x, key) => ap(ap(ap(push, ys), f(x)), pure(key)), pure(emptyColl))
  }
}

function nameOfType(obj: Object) {
  return obj && obj.constructor && obj.constructor.name ? obj.constructor.name : String(obj)
}
