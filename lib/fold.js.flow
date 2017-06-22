/* @flow */

import * as Const from 'flow-static-land/lib/Const'
import * as Maybe from 'flow-static-land/lib/Maybe'
import * as Endo from './instances/Endo'

import type { Applicative } from 'flow-static-land/lib/Applicative'
import type { Monoid } from 'flow-static-land/lib/Monoid'
import type { Getting } from './getter'
import type { Fold } from './types'

type GettingFold<R, S, A> = <Instance: Applicative<*>>(
  f: (functor: Instance, val: A) => Const.Const<R, A>
) => (functor: Instance, obj: S) => Const.Const<R, S>

export function foldMapOf<R, S, A> (
  monoid: Monoid<R>,
  lens: GettingFold<R, S, A>,
  f: (val: A) => R,
  obj: S
): R {
  const wrapConst = (instance, val) => Const.inj(f(val))
  const resultConst = lens(wrapConst)(Const.getApplicative(monoid), obj)
  return Const.prj(resultConst)
}

export function foldOf<S, A> (lens: Getting<A, S, A>, obj: S): A {
  const wrapConst = (instance, val) => Const.inj(val)
  const resultConst = lens(wrapConst)(Const, obj)
  return Const.prj(resultConst)
}

export function foldrOf<R, S, A> (
  lens: GettingFold<Endo.Endo<R>, S, A>,
  f: (val: A, accum: R) => R,
  init: R,
  obj: S
): R {
  return foldMapOf(Endo, lens, a => accum => f(a, accum), obj)(init)
}

export function sumOf<S> (
  lens: GettingFold<Endo.Endo<number>, S, number>,
  obj: S
): number {
  return foldrOf(lens, (x, y) => x + y, 0, obj)
}

/*
 * `lookup` is like `get`, except that the result might be `undefined`.
 *
 * `get` cannot be used with `Traversal` or `Fold` lenses.
 * In these cases, use `lookup` instead.
 *
 */
export function lookup<S, A> (lens: Getting<Maybe.Maybe<A>, S, A>, obj: S): ?A {
  const resultMaybe = foldMapOf(Maybe.first, lens, Maybe.of, obj)
  return Maybe.prj(resultMaybe)
}
