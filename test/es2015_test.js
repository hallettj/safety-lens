/* @flow */

import chai from 'chai'
import { get, set } from '../lens'
import { prop } from '../es2015'

const expect = chai.expect
declare var describe;
declare var it;

type Obj = {
  foo: number,
  bar: string,
  baz?: string,
}

const obj: Obj = { foo: 1, bar: 'two' }

describe('es2015', function() {

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
