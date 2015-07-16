/* @flow */

// A Profunctor may be a function, or an object that implements a `dimap`
// method.
export type Profunctor<B,C> = ((_: B) => C) | {
  dimap<A,D, FAD: Profunctor<A,D>>(l: (_: A) => B, r: (_: C) => D): FAD,
}

export {
  dimap,
  lmap,
  rmap,
}

function dimap
  <A,B,C,D, FAD: Profunctor<A,D>>
  (ab: (_: A) => B, cd: (_: C) => D, bc: Profunctor<B,C>): FAD {
  if (typeof bc === 'function') {
    return (dimapFunction(ab, cd, bc): any)
  }
  else {
    return bc.dimap(ab, cd)
  }
}

function dimapFunction<A,B,C,D>
  (ab: (_: A) => B, cd: (_: C) => D, bc: (_: B) => C): Profunctor<A,D> {
  return compose(cd, compose(bc, ab))
}

function lmap<A,B,C, FAC: Profunctor<A,C>>(f: (_: A) => B, p: Profunctor<B,C>): FAC {
  return dimap(f, id, p)
}

function rmap<A,B,C, FAC: Profunctor<A,C>>(f: (_: B) => C, p: Profunctor<A,B>): FAC {
  return dimap(id, f, p)
}

function compose<A,B,C>(f: (_: B) => C, g: (_: A) => B): (_: A) => C {
  return x => f(g(x))
}

function id<A>(x: A): A { return x }
