/*
 * Algebraic interfaces
 *
 * For information on algebraic interfaces (e.g., `Functor`), see
 * https://github.com/fantasyland/fantasy-land
 *
 * @flow
 */

export type Functor<A> = {
  map<B, FB: Functor<B>>(f: (val: A) => B): FB
}

export type Apply<F> = Functor<F> & {
  ap<A,B, FB: Apply<B>>(x: Apply<A>): FB
}

export function ap<A,B,C, FB: Apply<B>>(f: Apply<(_: A) => B>, x: Apply<A>): FB {
  return f.ap(x)
}

export type Applicative<F> = {
  ap<A,B, FB: Apply<B>>(x: Apply<A>): FB,
  of<T, FT: Applicative<T>>(val: T): FT,
}

export type Foldable<A> = {
  reduce<B>(f: (acc: B, val: A) => B, init: B): B
}

export type Traversable<A> = Functor<A> & {
  sequence<FA: Apply<Traversable<A>>>(pure: <T,FT:Apply<T>>(_: T) => FT): FA
}

export function sequence<A, FA: Apply<Traversable<A>>>(
  pure: <T, FT: Apply<T>>(_: T) => FT,
  t: Traversable<Apply<A>>
): FA {
  return t.sequence(pure)
}

export function traverse<A,B, FTB: Apply<Traversable<B>>>(
  pure: <T, FT: Apply<T>>(_: T) => FT,
  f: <FB: Apply<B>>(_: A) => FB,
  t: Traversable<A>
): FTB {
  return sequence(pure, t.map(f))
}
