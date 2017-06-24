/* @flow */

import { compose } from 'flow-static-land/lib/Fun'
import { id } from 'flow-static-land/lib/Identity'

import type { HKT } from 'flow-static-land/lib/HKT'
import type { Monoid } from 'flow-static-land/lib/Monoid'

export type Endo<A> = A => A

export function concat<A> (x: Endo<A>, y: Endo<A>): Endo<A> {
  return compose(x, y)
}

export function empty<A> (): Endo<A> {
  return id
}

if (false) {
  ;({
    concat,
    empty
  }: Monoid<Endo<*>>)
}
