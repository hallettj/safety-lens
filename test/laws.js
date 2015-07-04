
import { pair, property } from 'jsverify'
import { get, set } from '../lens'

import type { Arbitrary } from 'jsverify'
import type { SimpleLens } from '../lens'

export {
  lensLaws,
}

type Opts<S,A> = {
  dataAndLens: Arbitrary<[S, Lens<S,A>]>,
  value: Arbitrary<A>,
}

function lensLaws<S,A>(eq: (x: S, y: S) => boolean, { dataAndLens, value }: Opts<S,A>) {
  return () => {

    property("if you set something, you can get it back out", dataAndLens, value, ([obj, lens], val) => (
      eq( get(lens, set(lens, val, obj)), val )
    ))

    property("getting and then setting doesn't change the answer", dataAndLens, ([obj, lens]) => (
      eq( set(lens, get(lens, obj), obj), obj )
    ))

    property("putting twice is the same as putting once - the second put wins",
             dataAndLens, value, value, ([obj, lens], val1, val2) => (
      eq( set(lens, val1, set(lens, val2, obj)), set(lens, val1, obj) )
    ))

  }
}
