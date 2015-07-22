/* @flow */

import { lens } from './lens'
import { ap } from './src/Applicative'
import { Iterable, List, Set, Seq } from 'immutable'

import type { Getting, Lens_, Traversal_ } from './lens'

export {
  contains,
  index,
  traverse,
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
 * You can use `getMaybe` with a `Traversal` to get values out of a structure
 * wrapped in a `Maybe` result.
 * For example, using `index`, which is a traversal:
 *
 *     import { Just, Nothing } from 'lens/src/Maybe'
 *
 *     var x = getMaybe(index(1), xs)
 *
 *     assert( x instanceof Just )
 *     assert( x.value === 2 )
 *
 *     var y = getMaybe(index(9), xs)
 *
 *     assert( y instanceof Nothing )
 *     assert( y.value === undefined )
 *
 */

function traverse<A,K,B, TB: Iterable<K,B>, FTB: Apply<TB>>(
  f: <FB: Apply<B>>(pure: Pure, _: A) => FB
): (pure: Pure, obj: Iterable<K,A>) => FTB {
  return (pure, obj) => {
    if (obj instanceof Iterable.Keyed) {
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
    var push = x => coll => coll.concat(x)
    var emptyColl = obj.take(0)
    return obj.reduce((ys, x) => f(pure, x).map(push).ap(ys), pure(emptyColl))
  }
}

function traverseKeyedIterable<A,B, TB: Iterable.Keyed<B>, FTB: Apply<TB>>(
  f: <FB: Apply<B>>(pure: Pure, _: A) => FB
): (pure: Pure, obj: Iterable.Keyed<A>) => FTB {
  return (pure, obj) => {
    var push = x => key => coll => coll.concat([[key,x]])
    var emptyColl = obj.take(0)
    return obj.reduce(
      (ys, x, key) => f(pure, x).map(push).ap(pure(key)).ap(ys),
      pure(emptyColl)
    )
  }
}

function nameOfType(obj: Object) {
  return obj && obj.constructor && obj.constructor.name ? obj.constructor.name : String(obj)
}
