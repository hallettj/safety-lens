/*
 * Algebraic interfaces
 *
 * For information on algebraic interfaces (e.g., `Functor`), see
 * https://github.com/fantasyland/fantasy-land
 *
 * @flow
 */

export type Functor<A> = {
  map<B>(f: (val: A) => B): Functor<B>
}

export type Apply<F> = Functor<F> & {
  ap<A,B>(x: $Subtype<Apply<A>>): $Subtype<Apply<B>>
}

export function ap<A,B,C>(f: $Subtype<Apply<(_: A) => B>>, x: $Subtype<Apply<A>>): $Subtype<Apply<B>> {
  return f.ap(x)
}

export type Applicative<F> = {
  ap<A,B>(x: $Subtype<Apply<A>>): $Subtype<Apply<B>>,
  of<T>(val: T): $Subtype<Applicative<T>>,
}

export type Foldable<A> = {
  reduce<B>(f: (acc: B, val: A) => B, init: B): B
}

export type Traversable<A> = Functor<A> & {
  sequence(pure: <T>(_: T) => $Subtype<Applicative<T>>): $Subtype<Applicative<Traversable<A>>>
}

export function sequence<A>(
  pure: <T>(_: T) => Applicative<T>,
  t: $Subtype<Traversable<Applicative<A>>>
): $Subtype<Applicative<Traversable<A>>> {
  return t.sequence(pure)
}

export function traverse<A,B>(
  pure: <T>(_: T) => $Subtype<Applicative<T>>,
  f: (_: A) => $Subtype<Applicative<B>>,
  t: $Subtype<Traversable<A>>
): $Subtype<Applicative<Traversable<B>>> {
  return sequence(pure, t.map(f))
}
