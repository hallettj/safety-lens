declare module 'safety-lens/lib/Maybe' {
  declare type Maybe<A> = Just<A> | Nothing

  declare class Just<A> {
    value: A;
    constructor(value: A): void;
    map<B>(f: (val: A) => B): Just<B>;
    ap<T,U>(x: Maybe<T>): Maybe<U>;
  }

  declare class Nothing {
    value: void;
    map<B>(f: (_: any) => B): Nothing;
  }

  declare var just: Pure;
  declare var nothing: Nothing;

  declare function traverseMaybe<A,B, FTB: Apply<Maybe<B>>>(
    f: <FB: Apply<B>>(pure: Pure, _: A) => FB
  ): (pure: Pure, obj: Maybe<A>) => FTB;
}
