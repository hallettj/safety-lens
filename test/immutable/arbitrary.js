
import { array, bless, generator, integer, nearray, show, shrink } from 'jsverify'
import { List, fromJS, is } from 'immutable'
import { index } from '../../immutable'

import type { Arbitrary, Generator } from 'jsverify'

export {
  dependent,
  fmap,
  list,
  nelist,
}

function dependent(arb: Arbitrary<A>, f: (a: A) => Generator<B>): Arbitrary<[A,B]> {
  return bless({
    generator: arb.generator.flatmap(val1 => (
      generator.pair(generator.constant(val1), f(val1))
    )),
    shrink: shrink.pair(arb.shrink, _ => []),
    show: show.pair(arb.show, val => val.toString()),
  })
}

function fmap<A>(f: (_: A) => B, arb: Arbitrary<A>): Arbitrary<B> {
  return bless({
    generator: arb.generator.map(f),
    shrink: _ => [],
    show: val => val.toString(),
  })
}

function list<A>(arb: Arbitrary<A>): Arbitrary<List<A>> {
  return array(arb).smap(
    xs => fromJS(xs),
    xs => xs.toArray()
  )
}

function nelist<A>(arb: Arbitrary<A>): Arbitrary<List<A>> {
  return nearray(arb).smap(
    xs => fromJS(xs),
    xs => xs.toArray()
  )
}


// function nestedLest<A>(arb: Arbitrary<A>): Arbitrary<List<List<A>>> {
//   return nearray(nearray(arb)).smap(
//     xs => fromJS(xs),
//     xs => xs.toJS()
//   )
// }

// function arbitraryLens<S,T,A,B,X>(arb: Arbitrary<X>, f: (_: X) => Lens<S,T,A,B>): Arbitrary<Lens<S,T,A,B>> {
//   return bless({
//     generator: arb.generator.map(f),
//     shrink: lens => [],
//     show: lens => "a lens",
//   })
// }
