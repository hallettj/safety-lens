/* @flow */

export {
  compose,
  get,
  map,
  set,
}

export type Lens<S,T,A,B> =
  (f: (val: A) => Functor<B>) => ((obj: S) => Functor<T>)

export type Getting<R,S,A> =
  (f: (val: A) => Const<R,A>) => ((obj: S) => Const<R,S>)

export type Setter<S,T,A,B> =
  (f: (val: A) => Identity<B>) => ((obj: S) => Identity<T>)

// export type Lens_<S,A> = Lens<S,S,A,A>

export type Functor<A> = {
  map<B>(f: (val: A) => B): Functor<B>
}

class Const<R,A> {
  value: R;
  constructor(value: R) {
    this.value = value
  }
  map<B>(f: (_: A) => B): Const<R,B> {
    return new Const(this.value)
  }
}

class Identity<A> {
  value: A;
  constructor(value: A) {
    this.value = value
  }
  map<B>(f: (_: A) => B): Identity<B> {
    return new Identity(f(this.value))
  }
}

// Ordinary function composition
function compose<A,B,C>(f: (_: B) => C, g: (_: A) => B): (_: A) => C {
  return x => f(g(x))
}

function get<S,A>(getter: Getting<A,S,A>, obj: S): A {
  return getter(v => new Const(v))(obj).value
}

function set<S,T,A,B>(setter: Setter<S,T,A,B>, val: B, obj: S): T {
  return setter(_ => new Identity(val))(obj).value
}

function map<S,T,A,B>(setter: Setter<S,T,A,B>, f: (val: A) => B, obj: S): T {
  return setter(a => new Identity(f(a)))(obj).value
}
