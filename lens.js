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
  (f: (val: A) => Functor<B>) => ((obj: S) => Functor<T>)

export type Getting<R,S,A> =
  (f: (val: A) => Const<R,A>) => ((obj: S) => Const<R,S>)

// export type Lens_<S,A> = Lens<S,S,A,A>

export type Functor<A> = {
  map<B>(f: (val: A) => B): Functor<B>
}

type Const<A,B> = Functor<B> & { getConst: A }

export {
  get,
}

function constant<A,B>(val: A): Const<A,B> {
  var self = {
    getConst: val,
    map: function<B>(_: any): Functor<B> { return self },
  }
  return self
}


// type Lens' s t a b = forall f. Functor f => (a -> f b) -> s -> f t

// function compose(x: LensLike, y: LensLike): LensLike

function get<S,A>(obj: S, getter: Getting<A,S,A>): A {
  return getter(constant)(obj).getConst
}
