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

type Const<R,A> = Functor<A> & { getConst: R }

function constant<R,A>(val: R): Const<R,A> {
  var self = {
    getConst: val,
    map<B>(f: (_: any) => B): Const<typeof val,B> { return self },
  }
  return self
}

type Identity<A> = Functor<A> & { getIdentity: A }

function identity<A>(val: A): Identity<A> {
  return {
    getIdentity: val,
    map<B>(f: (a: typeof val) => B): Identity<B> {
      return identity(f(val))
    },
  }
}

// Ordinary function composition
function compose<A,B,C>(f: (_: B) => C, g: (_: A) => B): (_: A) => C {
  return x => f(g(x))
}

function get<S,A>(getter: Getting<A,S,A>, obj: S): A {
  return getter(constant)(obj).getConst
}

function set<S,T,A,B>(setter: Setter<S,T,A,B>, val: B, obj: S): T {
  return setter(_ => identity(val))(obj).getIdentity
}

function map<S,T,A,B>(setter: Setter<S,T,A,B>, f: (val: A) => B, obj: S): T {
  return setter(a => identity(f(a)))(obj).getIdentity
}
