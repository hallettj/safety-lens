/* @flow */

import type { Functor } from 'flow-static-land/lib/Functor'
import type { HKT } from 'flow-static-land/lib/HKT'
import type { Lens } from './types'

/*
 * Creates a lens from a getter and setter function.
 */
export function lens<S, T, A, B> (
  getter: (obj: S) => A,
  setter: (obj: S, val: B) => T
): Lens<S, T, A, B> {
  return function<F, Instance: Functor<F>> (
    f: (instance: Instance, val: A) => HKT<F, B>
  ): (instance: Instance, obj: S) => HKT<F, T> {
    return (instance, obj) =>
      instance.map(val => setter(obj, val), f(instance, getter(obj)))
  }
}
