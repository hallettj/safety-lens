/* @flow */

export {
  map,
}

function map<A,B, FB: Functor<B>>(f: (_: A) => B, o: Functor<A>): FB {
  return o.map(f)
}
