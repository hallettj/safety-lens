/* @flow */

import { rmap } from './src/Profunctor'

import type { Applicative, Functor, Traversable } from './src/fantasy-land'
import type { Profunctor } from './src/Profunctor'

export {
  compose,
  foldMapOf,
  foldrOf,
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

export type Getter<S,A> =
  (f: (pure: Pure_, val: A) => ($Subtype<Contravariant<A> & Functor<A>>)) =>
      ((pure: Pure_, obj: S) => ($Subtype<Contravariant<S> & Functor<S>>))

export type Setter<S,T,A,B> =
  (f: (pure: Pure_, val: A) => $Subtype<Settable<B>>) => ((pure: Pure_, obj: S) => $Subtype<Settable<T>>)


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

type Contravariant<A> = {
  contramap<B>(f: (_: B) => A): Contravariant<B>
}

type Settable<A> = Applicative<A> & Distributive<A> & Traversable<A> & {
  untainted(): A,
}

type Distributive<A> = Functor<A> & {
  // TODO:
  // distribute()
}



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
  contramap<B>(f: (_: B) => A): Const<R,B> {
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
  untainted(): A {
    return this.value
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

/* folding */

// foldMapOf :: Profunctor p => Accessing p r s a -> p a r -> s -> r
// foldMapOf l f = getConst #. l (Const #. f)

// type AccessingProfunctor<M,S,A> =
//   (_: Profunctor<A,Const<M,A>>) => ((pure: Pure_, _: S) => Const<M,S>)
type AccessingProfunctor<M,S,A> = Getting<M,S,A>

// class Endo<A> {
//   appEndo: (_:A) => A;
//   constructor(f: (_:A) => A) {
//     this.appEndo = f
//   }
// }
type Endo<A> = (_: A) => A

function foldMapOf<R,S,A>(l: AccessingProfunctor<R,S,A>, f: Profunctor<A,R>, obj: S): R {
  return rmap(c => c.value, l(rmap(Const.of, f)))
}

// foldrOf :: Profunctor p => Accessing p (Endo r) s a -> p a (r -> r) -> r -> s -> r
// foldrOf l f z = flip appEndo z `rmap` foldMapOf l (Endo #. f)

function foldrOf<R,S,A>(l: AccessingProfunctor<Endo<R>,S,A>, f: Profunctor<A, (_: R) => R>, z: R, obj: S): R {
  return rmap(f_ => f_(z), foldMapOf.bind(null, l, f))(obj)

  // return rmap(x => x.appEndo(z), foldMapOf(l, rmap(x => new Endo(x), f)))
}
