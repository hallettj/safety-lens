/* @flow */

export {
  compose,
  get,
}

export type Lens<S,T,A,B> =
  (f: (val: A) => Functor<B>) => ((obj: S) => Functor<T>)

export type Getting<R,S,A> =
  (f: (val: A) => Const<R,A>) => ((obj: S) => Const<R,S>)

// export type Lens_<S,A> = Lens<S,S,A,A>

export type Functor<A> = {
  map<B>(f: (val: A) => B): Functor<B>
}

type Const<A,B> = Functor<B> & { getConst: A }

function constant<A,B>(val: A): Const<A,B> {
  var self = {
    getConst: val,
    map: function<B>(_: any): Functor<B> { return self },
  }
  return self
}

// Ordinary function composition
function compose<A,B,C>(f: (_: B) => C, g: (_: A) => B): (_: A) => C {
  return x => f(g(x))
}

function get<S,A>(obj: S, getter: Getting<A,S,A>): A {
  return getter(constant)(obj).getConst
}
