declare module "safety-lens" {
  declare type Lens<S,T,A,B> =
    <FB: Functor<B>, FT: Functor<T>>
    (f: (pure: Pure_, val: A) => FB) => ((pure: Pure_, obj: S) => FT);

  declare type Lens_<S,A> = Lens<S,S,A,A>;

  declare type Getting<R,S,A> =
    <FA: Const<R,A>, FS: Const<R,S>>
    (f: (pure: Pure_, val: A) => FA) => ((pure: Pure_, obj: S) => FS);

  declare type Setting<S,T,A,B> =
    (f: (pure: Pure_, val: A) => Identity<B>) => ((pure: Pure_, obj: S) => Identity<T>);

  declare type Getter<S,A> =
    <FA: Contravariant<A> & Functor<A>, FS: Contravariant<S> & Functor<S>>
    (f: (pure: Pure_, val: A) => FA) => ((pure: Pure_, obj: S) => FS);

  declare type Setter<S,T,A,B> =
    <FB: Settable<B>, FT: Settable<T>>
    (f: (pure: Pure_, val: A) => FB) => ((pure: Pure_, obj: S) => FT);

  declare type Setter_<S,A> = Setter<S,S,A,A>;

  declare type Traversal<S,T,A,B> =
    <FB: Apply<B>, FT: Apply<T>>
    (f: (pure: Pure, val: A) => FB) => ((pure: Pure, obj: S) => FT);

  declare type Traversal_<S,A> = Traversal<S,S,A,A>;

  declare type Fold<R,S,A> =
    (f: (pure: Pure, val: A) => ApplyConst<R,A>) => ((pure: Pure, obj: S) => ApplyConst<R,S>);


  /*
   * Supporting interfaces
   */

  // `Pure_` is "pure" for functors - will not be invoked unless further
  // constrained to `Pure`
  declare type Pure_ = Function

  declare type Contravariant<A> = {
    contramap<B, FB: Contravariant<B>>(f: (_: B) => A): FB
  }

  declare type Settable<A> = Apply<A> & Traversable<A>


  /*
   * Algebraic implementations
   */

  declare class Const<R,A> {
    value: R;
    constructor(value: R): void;
    map<B, FB: Const<R,B>>(f: (_: A) => B): FB;
    contramap<B, FB: Const<R,B>>(f: (_: B) => A): FB;
  }

  declare class ApplyConst<R:Monoid,A> extends Const<R,A> {
    ap<T,U, FU: ApplyConst<R,U>>(x: ApplyConst<R,T>): FU;
    map<B, FB: ApplyConst<R,B>>(f: (_: A) => B): FB;
    contramap<B, FB: ApplyConst<R,B>>(f: (_: B) => A): FB;
  }

  declare class Identity<A> {
    value: A;
    constructor(value: A): void;
    map<B, FB: Identity<B>>(f: (_: A) => B): FB;
    ap<T,U, FU: Identity<U>>(x: Identity<T>): FU;
    sequence<TA: Traversable<A>, FA: Identity<TA>>(pure: Pure): FA;
  }


  declare function constant<T, FT: Const<T>>(val: T): FT;
  declare function applyConstant<T: Monoid, FT: ApplyConst<T>>(val: T): FT;
  declare function identity<T, FT: Identity<T>>(val: T): FT;

  // Ordinary function composition - also works to compose lenses
  declare function compose<A,B,C>(f: (_: B) => C, g: (_: A) => B): (_: A) => C;

  /* lenses */

  /*
   * Creates a lens from a getter and setter function.
   */
  declare function lens<S,T,A,B>(
    getter: (obj: S) => A,
    setter: (obj: S, val: B) => T
  ): Lens<S,T,A,B>;


  /* getting */

  /*
   * Turns an ordinary function into a getter
   */
  declare function getter<S,A>(getter: (obj: S) => A): Getter<S,A>;

  /*
   * Given a getter (which is a specialized lens), and data structure, gets
   * a value out of the data structure.
   */
  declare function get<S,A>(getter: Getting<A,S,A>, obj: S): A;


  /* setting */

  declare function set<S,T,A,B>(setter: Setting<S,T,A,B>, val: B, obj: S): T;

  declare function over<S,T,A,B>(setter: Setting<S,T,A,B>, f: (val: A) => B, obj: S): T;


  /* traversing */

  declare function traverseOf<S,T,A,B, FB: Apply<B>, FT: Apply<T>>
    (pure: Pure, l: Traversal<S,T,A,B>, f: (p: Pure, _: A) => FB, obj: S): FT;

  declare function filtering<S>(predicate: (val: S) => boolean): Traversal_<S,S>;


  /* folding */

  // `First` is one possible Monoid implementation for `Maybe`
  declare class First<A> {
    value: Maybe<A>;
    constructor(value: Maybe<A>): void;
    concat<M: First<A>>(other: Monoid): M;
    empty<M: First<A>>(): M;
  }
  declare function first<A>(val: Maybe<A>): First<A>;

  declare function foldMapOf<R:Monoid,S,A>(l: Fold<R,S,A>, f: (val: A) => R, mempty: R, obj: S): R;

  // `Endo` turns a function into a Monoid
  declare class Endo<A> {
    f: (_: A) => A;
    constructor(f: (_: A) => A): void;
    concat<M: Endo<A>>(other: Monoid): M;
    empty<M: Endo<A>>(): M;
  }
  declare function endo<A>(f: (_: A) => A): Endo<A>;

  declare function foldrOf<R,S,A>(
    l: Fold<Endo<R>,S,A>, f: (val: A, accum: R) => R, init: R, obj: S
  ): R;

  declare function sumOf<S>(l: Fold<Endo<number>,S,number>, obj: S): number;

  /*
   * `lookup` is like `get`, except that the result might be `undefined`.
   *
   * `get` cannot be used with `Traversal` or `Fold` lenses.
   * In these cases, use `lookup` instead.
   *
   */
  declare function lookup<S,A>(l: Fold<First<A>,S,A>, obj: S): ?A;
}
