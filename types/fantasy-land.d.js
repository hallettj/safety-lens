
interface Monoid {
  concat<M: Monoid>(other: Monoid): M,
  empty<M: Monoid>(): M,
}

interface Functor<A> {
  map<B, FB: Functor<B>>(f: (val: A) => B): FB
}

type Pure = <T, FT: Apply<T>>(_: T) => FT

interface Apply<F> extends Functor<F> {
  ap<A,B, FB: Apply<B>>(x: $Subtype<Apply<A>>): FB
}

interface Foldable<A> {
  reduce<B>(f: (acc: B, val: A) => B, init: B): B
}

interface Traversable<A> extends Functor<A> {
  sequence<TA: Traversable<A>, FA: Apply<TA>>(pure: Pure): FA
}
