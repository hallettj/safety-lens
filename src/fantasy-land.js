/*
 * Algebraic interfaces
 *
 * For information on algebraic interfaces (e.g., `Functor`), see
 * https://github.com/fantasyland/fantasy-land
 *
 * @flow
 */

export {
  sequence,
  traverse,
}

function sequence<A, FA: Apply<Traversable<A>>>(
  pure: <T, FT: Apply<T>>(_: T) => FT,
  t: Traversable<Apply<A>>
): FA {
  return t.sequence(pure)
}

function traverse<A,B, FTB: Apply<Traversable<B>>>(
  pure: <T, FT: Apply<T>>(_: T) => FT,
  f: <FB: Apply<B>>(_: A) => FB,
  t: Traversable<A>
): FTB {
  return sequence(pure, t.map(f))
}
