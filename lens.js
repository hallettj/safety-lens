/* @flow */

import type { IndexedCollection, List } from 'immutable'

// export type Getter<S,A> = {
//   to(obj: S): A
// }

// export type Setter<S,T,A,B> = {
//   sets(f: (a: A) => B): (obj: S) => T
// }

// export type Lens<S,T,A,B> = Getter<S,A> & Setter<S,T,A,B>

export type Lens<S,T,A,B> =
  (f: (pure: Pure, val: A) => Functor<B>) => ((pure: Pure, obj: S) => Functor<T>)

// export type Lens_<S,A> = Lens<S,S,A,A>

export type Pure = <A>(val: A) => Functor<A>

export type Functor<A> = {
  map<B>(f: (val: A) => B): Functor<B>
}

// type Lens' s t a b = forall f. Functor f => (a -> f b) -> s -> f t

// function compose(x: LensLike, y: LensLike): LensLike
