/* @flow */

export {
  compose,
  foldMapOf,
  get,
  lens,
  over,
  set,
  getMaybe,
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

export type Fold<M,S,A> =
  <MM: Monoid<M>>
  (f: (pure: Pure_, val: A) => Const<MM,A>) => ((pure: Pure_, obj: S) => Const<MM,S>)


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

var constant: Pure = val => (new Const(val): any)
var identity: Pure = val => (new Identity(val): any)

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

function foldMapOf<R,S,A>(l: Getting<R,S,A>, f: (val: A) => R): (pure: Pure, obj: S) => R {
  var wrapConst = (pure, val) => constant(f(val))
  return (pure, obj) => l(wrapConst)(pure, obj).value
}

function traverseOf<S,T,A,B, FB: Apply<B>, FT: Apply<T>>
  (pure: Pure, l: Traversal<S,T,A,B>, f: (p: Pure, _: A) => FB, obj: S): FT {
  return l(f)(pure, obj)
}

// Early iteration of Monoid / Semigroup concatenation
function concat<A, MA: ?A | Semigroup<A>>(x: MA, y: MA): MA {
  if (x && y) {
    if (typeof x.concat == 'function') {
      return (x: any).concat(y)
    }
    else {
      return x
    }
  }
  else {
    return typeof x === 'undefined' ? y : x
  }
}

function empty<A>(x: ?A | Monoid<A>): void | Monoid<A> {
  if (x && typeof x.empty === 'function') {
    return x.empty()
  }
  else {
    return undefined
  }
}

function getMaybe<S,A>(l: Getting<?A,S,A>, obj: S): ?A {
  return foldMapOf(l, id, obj)(id, obj)
}

function id<A>(val: A): A { return val }
