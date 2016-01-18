/* @noflow */

import chai from 'chai'
import { constant, dict, integer, pair, record, string } from 'jsverify'
import deepEqual from 'deep-equal'
import { get, over, set } from '../lens'
import { prop } from '../es2015'
import * as laws from './laws'

const expect = chai.expect
declare var describe;
declare var it;

const lensLaws = laws.lensLaws.bind(null, deepEqual)

type Obj = {
  foo: number,
  bar: string,
  baz?: string,
}

const obj: Obj = { foo: 1, bar: 'two' }

describe('es2015', function() {

  describe('prop', lensLaws({
    dataAndLens: dict(integer).smap(
      o => {
        const p = Object.keys(o)[0]
        return [o, prop(p)]
      },
      ([o, _]) => o
    ),
    value: integer,
  }))

  describe('prop, when property does not exist in input object', lensLaws({
    dataAndLens: pair(
      record({ foo: integer, bar: string }),
      constant(prop('baz'))
    ),
    value: string,
  }))

  it('gets property value from an object', function() {
    const value = get(prop('foo'), obj)
    expect(value).to.equal(1)
  })

  it('sets property value on an object', function() {
    const obj_ = set(prop('foo'), 4, obj)
    expect(obj_.foo).to.equal(4)
  })

  it('preserves other property values when setting', function() {
    const obj_ = set(prop('foo'), 4, obj)
    expect(obj_.bar).to.equal('two')
  })

  it('sets properties that did not previously exist', function() {
    const obj_ = set(prop('baz'), 'present', obj)
    expect(obj_).to.have.property('baz')
    expect(obj_.baz).to.equal('present')
  })

  it('returns `undefined` when getting a property that does not exist', function() {
    const value = get(prop('baz'), obj)
    expect(value).to.be.undefined
  })

  it('modifies a value', function() {
    const obj_ = over(prop('foo'), x => x + 2, obj)
    expect(obj_.foo).to.equal(3)
  })

})
