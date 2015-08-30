declare module "safety-lens/es2015" {
  declare function index<A>(idx: number): Traversal_<A[],A>;
  declare function prop<S:Object,A>(key: $Enum<S>): Lens_<S,A>;
  declare function _1<A,B,C>(): Lens<[A,B],[C,B],A,C>;
  declare function _2<A,B,C>(): Lens<[A,B],[A,C],B,C>;
}
