
import { array, bless, dict, generator, integer, nearray, show, shrink, suchthat } from 'jsverify'
import { List, Set, fromJS, is } from 'immutable'
import { index } from '../../immutable'

import type { Arbitrary, Generator } from 'jsverify'

export {
  dependent,
  fmap,
  list,
  nelist,
  map,
  nemap,
  set,
  neset,
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

// TODO: arbKey is ignored for now
function map<K,V>(arbKey: Arbitrary<K>, arbVal: Arbitrary<V>): Arbitrary<Map<K,V>> {
  return dict(arbVal).smap(
    obj => fromJS(obj),
    m => m.toObject()
  )
}

function nemap<K,V>(arbKey: Arbitrary<K>, arbVal: Arbitrary<V>): Arbitrary<Map<K,V>> {
  return suchthat(map(arbKey, arbVal), m => !m.isEmpty())
}

function set<A>(arb: Arbitrary<A>): Arbitrary<Set<A>> {
  return array(arb).smap(
    xs => Set(xs),
    xs => xs.toArray()
  )
}

function neset<A>(arb: Arbitrary<A>): Arbitrary<Set<A>> {
  return nearray(arb).smap(
    xs => Set(xs),
    xs => xs.toArray()
  )
}
