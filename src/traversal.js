/* @flow */

import type { Applicative } from 'flow-static-land/lib/Applicative'
import type { HKT } from 'flow-static-land/lib/HKT'
import type { Traversable } from 'flow-static-land/lib/Traversable'
import type { Traversal, Traversal_ } from './types'

// Given a `Traversable` instance for a type, produces a `Traversal` suitable for that type.
export function traverse<T, A, B, F, Instance: Applicative<F>> (
  traversable: Traversable<T>,
  f: (instance: Instance, val: A) => HKT<F, B>
): (instance: Instance, obj: HKT<T, A>) => HKT<F, HKT<T, B>> {
  return (instance, obj) => {
    const f_ = f.bind(null, instance)
    return traversable.traverse(instance, f_, obj)
  }
}

export function traverseOf<S, T, A, B, F, Instance: Applicative<F>> (
  applicative: Instance,
  l: Traversal<S, T, A, B>,
  f: (i: Instance, val: A) => HKT<F, B>,
  obj: S
): HKT<F, T> {
  return l(f)(applicative.of, obj)
}

export function filtering<S> (predicate: (val: S) => boolean): Traversal_<S, S> {
  return function<F, Instance: Applicative<F>> (
    f: (instance: Instance, val: S) => HKT<F, S>
  ): (instance: Instance, obj: S) => HKT<F, S> {
    return (instance, obj) =>
      predicate(obj) ? f(instance, obj) : instance.of(obj)
  }
}
