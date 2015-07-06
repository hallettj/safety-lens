/* @flow */

import type { Applicative, Functor } from './src/fantasy-land'

export {
  compose,
  get,
  lens,
  over,
  set,
}

/* Types */

export type Lens<S,T,A,B> =
  (f: (pure: Pure_, val: A) => $Subtype<Functor<B>>) => ((pure: Pure_, obj: S) => $Subtype<Functor<T>>)

export type Lens_<S,A> = Lens<S,S,A,A>

export type Getting<R,S,A> =
  (f: (pure: Pure_, val: A) => Const<R,A>) => ((pure: Pure_, obj: S) => Const<R,S>)

export type Setting<S,T,A,B> =
  (f: (pure: Pure_, val: A) => Identity<B>) => ((pure: Pure_, obj: S) => Identity<T>)

export type Getter<S,A> = Getting<A,S,A>
export type Setter<S,T,A,B> = Setting<S,T,A,B>

export type Setter_<S,A> = Setter<S,S,A,A>

export type Traversal<S,T,A,B> =
  (f: (pure: Pure, val: A) => $Subtype<Applicative<B>>) => ((pure: Pure, obj: S) => $Subtype<Applicative<T>>)

export type Traversal_<S,A> = Traversal<S,S,A,A>


/*
 * Supporting interfaces
 */

// `Pure_` is "pure" for functors - will not be invoked unless further
// constrained to `Pure`
type Pure_ = Function
type Pure = <T>(_: T) => $Subtype<Applicative<T>>


/*
 * Algebraic implementations
 */

class Const<R,A> {
  value: R;
  static of<X,T>(val: X): Const<X,T> {
    return new Const(val)
  }
  constructor(value: R) {
    this.value = value
  }
  map<B>(f: (_: A) => B): Const<R,B> {
    return new Const(this.value)
  }
}

class Identity<A> {
  value: A;
  static of<T>(val: T): Identity<T> {
    return new Identity(val)
  }
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


/* lenses */

function lens<S,T,A,B>(
  getter: (obj: S) => A,
  setter: (obj: S, val: B) => T
): Lens<S,T,A,B> {
  return f => (pure, obj) => (
    f(pure, getter(obj)).map(val => setter(obj, val))
  )
}


/* getting */

function to<S,A>(getter: (obj: S) => A): Getter<S,A> {
  return f => (pure, obj) => (
    f(pure, getter(obj)).map(val => obj)
  )
}

function get<S,A>(getter: Getting<A,S,A>, obj: S): A {
  return getter((_, val) => Const.of(val))(Const.of, obj).value
}


/* setting */

function set<S,T,A,B>(setter: Setter<S,T,A,B>, val: B, obj: S): T {
  return setter((_, __) => Identity.of(val))(Identity.of, obj).value
}

function over<S,T,A,B>(setter: Setting<S,T,A,B>, f: (val: A) => B, obj: S): T {
  return setter((_, a) => Identity.of(f(a)))(Identity.of, obj).value
}
