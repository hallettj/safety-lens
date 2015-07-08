/* @flow */

// A Profunctor may be a function, or an object that implements a `dimap`
// method.
export type Profunctor<B,C> = ((_: B) => C) | {
  dimap<A,D>(l: (_: A) => B, r: (_: C) => D): $Subtype<Profunctor<A,D>>,
}

export {
  dimap,
  lmap,
  rmap,
}

function dimap<A,B,C,D>(ab: (_: A) => B, cd: (_: C) => D, bc: Profunctor<B,C>): $Subtype<Profunctor<A,D>> {
  if (typeof bc === 'function') {
    return compose(compose(cd, bc), ab)
  }
  else {
    return bc.dimap(ab, cd)
  }
}

function lmap<A,B,C>(f: (_: A) => B, p: Profunctor<B,C>): $Subtype<Profunctor<A,C>> {
  return dimap(f, id, p)
}

function rmap<A,B,C>(f: (_: B) => C, p: Profunctor<A,B>): $Subtype<Profunctor<A,C>> {
  return dimap(id, f, p)
}

function compose<A,B,C>(f: (_: B) => C, g: (_: A) => B): (_: A) => C {
  return x => f(g(x))
}

function id<A>(x: A): A { return x }
