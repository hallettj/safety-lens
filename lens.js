/* @flow */

import { rmap } from './src/Profunctor'

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
  <FB: Functor<B>, FT: Functor<T>>
  (f: (pure: Pure_, val: A) => FB) => ((pure: Pure_, obj: S) => FT)

export type Lens_<S,A> = Lens<S,S,A,A>

export type Getting<R,S,A> =
  (f: (pure: Pure_, val: A) => Const<R,A>) => ((pure: Pure_, obj: S) => Const<R,S>)

export type Setting<S,T,A,B> =
  (f: (pure: Pure_, val: A) => Identity<B>) => ((pure: Pure_, obj: S) => Identity<T>)

export type Getter<S,A> =
  <FA: Contravariant<A> & Functor<A>, FS: Contravariant<S> & Functor<S>>
  (f: (pure: Pure_, val: A) => FA) => ((pure: Pure_, obj: S) => FS)

export type Setter<S,T,A,B> =
  <FB: Settable<B>, FT: Settable<T>>
  (f: (pure: Pure_, val: A) => FB) => ((pure: Pure_, obj: S) => FT)

export type Setter_<S,A> = Setter<S,S,A,A>

export type Traversal<S,T,A,B> =
  <FB: Apply<B>, FT: Apply<T>>
  (f: (pure: Pure, val: A) => FB) => ((pure: Pure, obj: S) => FT)

export type Traversal_<S,A> = Traversal<S,S,A,A>


/*
 * Supporting interfaces
 */

// `Pure_` is "pure" for functors - will not be invoked unless further
// constrained to `Pure`
type Pure_ = Function

type Contravariant<A> = {
  contramap<B, FB: Contravariant<B>>(f: (_: B) => A): FB
}

type Settable<A> = Apply<A> & Traversable<A>



/*
 * Algebraic implementations
 */

class Const<R,A> {
  value: R;
  constructor(value: R) {
    this.value = value
  }
  map<B, FB: Const<R,B>>(f: (_: A) => B): FB {
    return (new Const(this.value): $Subtype<Const<*,*>>)
  }
  contramap<B, FB: Const<R,B>>(f: (_: B) => A): FB {
    return (new Const(this.value): $Subtype<Const<*,*>>)
  }
}

class Identity<A> {
  value: A;
  constructor(value: A) {
    this.value = value
  }
  map<B, FB: Identity<B>>(f: (_: A) => B): FB {
    return (new Identity(f(this.value)): $Subtype<Identity<*>>)
  }
  ap<T,U, FU: Identity<U>>(x: Identity<T>): FU {
    var f: any = this.value
    return (new Identity(f(x.value)): $Subtype<Identity<*>>)
  }
  sequence<TA: Traversable<A>, FA: Identity<TA>>(pure: Pure): FA {
    return pure(this)
  }
}

var constant: Pure = val => (new Const(val): $Subtype<Const<*,*>>)
var identity: Pure = val => (new Identity(val): $Subtype<Identity<*>>)

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
  return getter((_, val) => new Const(val))(constant, obj).value
}


/* setting */

function set<S,T,A,B>(setter: Setting<S,T,A,B>, val: B, obj: S): T {
  return setter((_, __) => new Identity(val))(identity, obj).value
}

function over<S,T,A,B>(setter: Setting<S,T,A,B>, f: (val: A) => B, obj: S): T {
  return setter((_, a) => new Identity(f(a)))(identity, obj).value
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
  return rmap(c => c.value, l(rmap(constant, f)))
}

// foldrOf :: Profunctor p => Accessing p (Endo r) s a -> p a (r -> r) -> r -> s -> r
// foldrOf l f z = flip appEndo z `rmap` foldMapOf l (Endo #. f)

function foldrOf<R,S,A>(l: AccessingProfunctor<Endo<R>,S,A>, f: Profunctor<A, (_: R) => R>, z: R, obj: S): R {
  return rmap(f_ => f_(z), foldMapOf.bind(null, l, f))(obj)

  // return rmap(x => x.appEndo(z), foldMapOf(l, rmap(x => new Endo(x), f)))
}

function traverseOf<S,T,A,B, FB: Apply<B>, FT: Apply<T>>
  (pure: Pure, l: Traversal<S,T,A,B>, f: (p: Pure, _: A) => FB, obj: S): FT {
  return l(f)(pure, obj)
}
