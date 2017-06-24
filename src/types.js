/* @flow */

import type { Applicative } from 'flow-static-land/lib/Applicative'
import type { Contravariant } from 'flow-static-land/lib/Contravariant'
import type { Functor } from 'flow-static-land/lib/Functor'
import type { HKT } from 'flow-static-land/lib/HKT'
import type { Traversable } from 'flow-static-land/lib/Traversable'

export type Lens<S, T, A, B> = <F, Instance: Functor<F>>(
  f: (instance: Instance, val: A) => HKT<F, B>
) => (instance: Instance, obj: S) => HKT<F, T>

export type Lens_<S, A> = Lens<S, S, A, A>

export type Getter<S, A> = <F, Instance: ContravariantFunctor<F>>(
  f: (instance: Instance, val: A) => HKT<F, A>
) => (instance: Instance, obj: S) => HKT<F, S>

export type Setter<S, T, A, B> = <F, Instance: ApplicativeTraversable<F>>(
  f: (instance: Instance, val: A) => HKT<F, B>
) => (instance: Instance, obj: S) => HKT<F, T>

export type Setter_<S, A> = Setter<S, S, A, A>

export type Traversal<S, T, A, B> = <F, Instance: Applicative<F>>(
  f: (instance: Instance, val: A) => HKT<F, B>
) => (instance: Instance, obj: S) => HKT<F, T>

export type Traversal_<S, A> = Traversal<S, S, A, A>

export type Fold<S, A> = <F, Instance: ApplicativeContravariant<F>>(
  f: (instance: Instance, val: A) => HKT<F, A>
) => (instance: Instance, obj: S) => HKT<F, A>

/*
 * Supporting interfaces
 */

export interface ApplicativeContravariant<F>
  extends Applicative<F>, Contravariant<F> {}
export interface ContravariantFunctor<F> extends Contravariant<F>, Functor<F> {}
export interface ApplicativeTraversable<F>
  extends Applicative<F>, Traversable<F> {}
