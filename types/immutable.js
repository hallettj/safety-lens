declare module "lens/immutable" {
  declare function field<S:Object,A>(name: $Enum<S>): Lens_<Record<S>,A>;
  declare function contains<V>(val: V): Lens_<Set<V>, boolean>;
  declare function index<K,V, S:Iterable<K,V>>(idx: K): Traversal_<S,V>;
  declare function traverse<A,K,B, TB: Iterable<K,B>, FTB: Apply<TB>>(
    f: <FB: Apply<B>>(pure: Pure, _: A) => FB
  ): (pure: Pure, obj: Iterable<K,A>) => FTB;
  declare function toListOf<S,A>(l: Fold<Endo<List<A>>,S,A>, obj: S): List<A>;
  declare function toStackOf<S,A>(l: Fold<Endo<Stack<A>>,S,A>, obj: S): Stack<A>;
}
