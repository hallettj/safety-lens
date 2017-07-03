/* @flow */

import type { Functor } from 'flow-static-land/lib/Functor'

import * as Identity from 'flow-static-land/lib/Identity'

/* A specialization of `Lens` that sets or updates properties */
export type Setting<S, T, A, B> = <Instance: Functor<*>>(
  f: (functor: Instance, val: A) => Identity.Identity<B>
) => (functor: Instance, obj: S) => Identity.Identity<T>

export function set<S, T, A, B> (
  setter: Setting<S, T, A, B>,
  val: B,
  obj: S
): T {
  const resultIdentity = setter((_, __) => Identity.of(val))(Identity, obj)
  return Identity.extract(resultIdentity)
}

export function over<S, T, A, B> (
  setter: Setting<S, T, A, B>,
  f: (val: A) => B,
  obj: S
): T {
  const resultIdentity = setter((_, a) => Identity.of(f(a)))(Identity, obj)
  return Identity.extract(resultIdentity)
}
