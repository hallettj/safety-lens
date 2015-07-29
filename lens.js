/* @flow */

import { Just, just, nothing } from './src/Maybe'

import type { Maybe } from './src/Maybe'

export {
  compose,
  foldMapOf,
  get,
  getter,
  lens,
  lookup,
  over,
  set,
  traverseOf,
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

export type Fold<R,S,A> =
  (f: (pure: Pure, val: A) => ApplyConst<R,A>) => ((pure: Pure, obj: S) => ApplyConst<R,S>)


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
    return (new Const(this.value): any)
  }
  contramap<B, FB: Const<R,B>>(f: (_: B) => A): FB {
    return (new Const(this.value): any)
  }
}

class ApplyConst<R:Monoid,A> extends Const<R,A> {
  ap<T,U, FU: ApplyConst<R,U>>(x: ApplyConst<R,T>): FU {
    return (new ApplyConst(this.value.concat(x.value)): any)
  }
  map<B, FB: ApplyConst<R,B>>(f: (_: A) => B): FB {
    return (new ApplyConst(this.value): any)
  }
  contramap<B, FB: ApplyConst<R,B>>(f: (_: B) => A): FB {
    return (new ApplyConst(this.value): any)
  }
}

class Identity<A> {
  value: A;
  constructor(value: A) {
    this.value = value
  }
  map<B, FB: Identity<B>>(f: (_: A) => B): FB {
    return (new Identity(f(this.value)): any)
  }
  ap<T,U, FU: Identity<U>>(x: Identity<T>): FU {
    var f: any = this.value
    return (new Identity(f(x.value)): any)
  }
  sequence<TA: Traversable<A>, FA: Identity<TA>>(pure: Pure): FA {
    return pure(this)
  }
}

function constant<T, FT: Const<T>>(val: T): FT { return (new Const(val): any) }
function applyConstant<T: Monoid, FT: ApplyConst<T>>(val: T): FT {
  return (new ApplyConst(val): any)
}
function identity<T, FT: Identity<T>>(val: T): FT {
  return (new Identity(val): any)
}

// Ordinary function composition - also works to compose lenses
function compose<A,B,C>(f: (_: B) => C, g: (_: A) => B): (_: A) => C {
  return x => f(g(x))
}

/* lenses */

/*
 * Creates a lens from a getter and setter function.
 */
function lens<S,T,A,B>(
  getter: (obj: S) => A,
  setter: (obj: S, val: B) => T
): Lens<S,T,A,B> {
  return f => (pure, obj) => (
    f(pure, getter(obj)).map(val => setter(obj, val))
  )
}


/* getting */

/*
 * Turns an ordinary function into a getter
 */
function getter<S,A>(getter: (obj: S) => A): Getter<S,A> {
  return f => (pure, obj) => (
    f(pure, getter(obj)).map(val => obj)
  )
}

/*
 * Given a getter (which is a specialized lens), and data structure, gets
 * a value out of the data structure.
 */
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

class First<A> {
  value: Maybe<A>;
  constructor(value: Maybe<A>) { this.value = value }
  concat<M: First<A>>(other: Monoid): M {
    return ((this.value instanceof Just ? this : other): any)
  }
  empty<M: First<A>>(): M {
    return (new First(nothing): any)
  }
  static empty<T>(): First<T> {
    return new First(nothing)
  }
}
function first<A>(val: Maybe<A>): First<A> { return new First(val) }

function foldMapOf<R:Monoid,S,A>(l: Fold<R,S,A>, f: (val: A) => R, mempty: R, obj: S): R {
  var wrapConst = (pure, val) => applyConstant(f(val))
  return l(wrapConst)(_ => applyConstant(mempty), obj).value
}

function traverseOf<S,T,A,B, FB: Apply<B>, FT: Apply<T>>
  (pure: Pure, l: Traversal<S,T,A,B>, f: (p: Pure, _: A) => FB, obj: S): FT {
  return l(f)(pure, obj)
}

/*
 * `lookup` is like `get`, except that the result might be `undefined`.
 *
 * `get` cannot be used with `Traversal` or `Fold` lenses.
 * In these cases, use `lookup` instead.
 *
 */
function lookup<S,A>(l: Fold<First<A>,S,A>, obj: S): ?A {
  function toMonoid<T>(val: T): First<T> { return first(just(val)) }
  return foldMapOf(l, toMonoid, first(nothing), obj).value.value
}

function id<A>(val: A): A { return val }
