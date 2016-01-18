/* @noflow */

import { pair, property } from 'jsverify'
import { get, set } from '../lens'
import { map } from '../lib/Functor'

import type { Arbitrary } from 'jsverify'
import type { Lens_, Traversal_ } from '../lens'

export {
  lensLaws,
  traversalLaws,
}

type LensOpts<S,A> = {
  dataAndLens: Arbitrary<[S, Lens_<S,A>]>,
  value: Arbitrary<A>,
}

function lensLaws<S,A>(eq: (x: S, y: S) => boolean, { dataAndLens, value }: LensOpts<S,A>) {
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

type TraversalOpts<S,A> = {
  pure: Pure,
  dataAndTraversal: Arbitrary<[S, Traversal_<S,A>]>,
}

function traversalLaws<S,A, FS: Apply<S>>(eq: (x: FS, y: FS) => boolean, { pure, dataAndTraversal }: TraversalOpts<S,A>) {
  return () => {

    property("t pure ≡ pure", ([x, t]) => (
      eq( t((_, v) => pure(v))(pure, x), pure(x) )
    ))

    property("fmap (t f) . t g ≡ getCompose . t (Compose . fmap f . g)", dataAndTraversal, ([x, t]) => {
      var left = compose(map.bind(null, t(f)), t(g))
      var right = t(compose(compose(Compose, map.bind(null, f)), g))
      return eq( left(x), right(x) )
    })

  }

  function Compose(f) {
    return g => a => f(g(a))
  }
}
