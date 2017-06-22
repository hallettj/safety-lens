/* @noflow */

import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
import {
  bool,
  constant,
  dict,
  integer,
  oneof,
  pair,
  record,
  string
} from 'jsverify'
import deepEqual from 'deep-equal'
import {
  compose,
  filtering,
  foldrOf,
  get,
  lookup,
  id,
  over,
  set,
  sumOf
} from '../lib'
import {
  _1,
  _2,
  prop,
  success,
  failure,
  toArrayOf,
  traverseArray
} from '../native'
import * as laws from './laws'

chai.use(chaiAsPromised)
const expect = chai.expect
declare var describe
declare var it

const lensLaws = laws.lensLaws.bind(null, deepEqual)

type Obj = {
  foo: number,
  bar: string,
  baz?: string
}

const obj: Obj = { foo: 1, bar: 'two' }

describe('native', function () {
  describe(
    'prop',
    lensLaws({
      dataAndLens: dict(integer).smap(o => {
        const p = Object.keys(o)[0]
        return [o, p ? prop(p) : id]
      }, ([o, _]) => o),
      value: integer
    })
  )

  describe(
    'prop, when property does not exist in input object',
    lensLaws({
      dataAndLens: pair(
        record({ foo: integer, bar: string }),
        constant(prop('baz'))
      ),
      value: string
    })
  )

  describe(
    '_1',
    lensLaws({
      dataAndLens: pair(
        pair(oneof(integer, string, bool), oneof(integer, string, bool)),
        constant(_1)
      ),
      value: oneof(integer, string, bool)
    })
  )

  describe(
    '_2',
    lensLaws({
      dataAndLens: pair(
        pair(oneof(integer, string, bool), oneof(integer, string, bool)),
        constant(_2)
      ),
      value: oneof(integer, string, bool)
    })
  )

  describe('traverseArray', () => {
    const xs = Object.freeze([1, 2, 3, 4])
    const nestedXs = Object.freeze([[1, 2], [3, 4]])
    const multiplyBy2 = x => x * 2
    const even = x => x % 2 == 0

    it('modifies all members of an array', () => {
      expect(over(traverseArray, multiplyBy2, xs)).to.deep.equal([2, 4, 6, 8])
    })

    it('gets nothing out of an empty array', () => {
      expect(lookup(traverseArray, [])).to.not.exist
    })

    it('computes a fold of an array', () => {
      expect(foldrOf(traverseArray, (x, y) => x + y, 0, xs)).to.equal(10)
    })

    it('computes the sum of an array', () => {
      expect(sumOf(traverseArray, xs)).to.equal(10)
    })

    it('computes the sum of nested arrays', () => {
      expect(sumOf(compose(traverseArray, traverseArray), nestedXs)).to.equal(
        10
      )
    })

    it('filters an array', () => {
      expect(sumOf(compose(traverseArray, filtering(even)), xs)).to.equal(6)
    })

    it('updates positions of an array according to a filter', () => {
      expect(
        over(compose(traverseArray, filtering(even)), multiplyBy2, xs)
      ).to.deep.equal([1, 4, 3, 8])
    })

    it('filters items in nested arrays', () => {
      expect(
        sumOf(compose(traverseArray, traverseArray, filtering(even)), nestedXs)
      ).to.equal(6)
    })

    it('produces an array from a traversal', () => {
      expect(
        toArrayOf(
          compose(traverseArray, traverseArray, filtering(even)),
          nestedXs
        )
      ).to.deep.equal([2, 4])
    })
  })

  it('gets property value from an object', function () {
    const value = get(prop('foo'), obj)
    expect(value).to.equal(1)
  })

  it('sets property value on an object', function () {
    const obj_ = set(prop('foo'), 4, obj)
    expect(obj_.foo).to.equal(4)
  })

  it('preserves other property values when setting', function () {
    const obj_ = set(prop('foo'), 4, obj)
    expect(obj_.bar).to.equal('two')
  })

  it('sets properties that did not previously exist', function () {
    const obj_ = set(prop('baz'), 'present', obj)
    expect(obj_).to.have.property('baz')
    expect(obj_.baz).to.equal('present')
  })

  it('returns `undefined` when getting a property that does not exist', function () {
    const value = get(prop('baz'), obj)
    expect(value).to.be.undefined
  })

  it('modifies a value', function () {
    const obj_ = over(prop('foo'), x => x + 2, obj)
    expect(obj_.foo).to.equal(3)
  })

  it('gets the first value in a pair', function () {
    const pair = ['foo', true]
    expect(get(_1, pair)).to.equal('foo')
  })

  it('sets the first value in a pair', function () {
    const pair = ['foo', true]
    const pair_ = set(_1, 'bar', pair)
    expect(pair_[0]).to.equal('bar')
  })

  it('gets the second value in a pair', function () {
    const pair = ['foo', true]
    expect(get(_2, pair)).to.equal(true)
  })

  it('sets the second value in a pair', function () {
    const pair = ['foo', true]
    const pair_ = set(_2, 1, pair)
    expect(pair_[1]).to.equal(1)
  })

  describe('promise', function () {
    it('sets the result of a promise', function () {
      const promise = Promise.resolve(1)
      const promise_ = set(success, 2, promise)
      return expect(promise_).to.eventually.equal(2)
    })

    it('sets the failure outcome of a promise', function () {
      const promise = Promise.reject(1)
      const promise_ = set(failure, 2, promise)
      return expect(promise_).to.be.rejectedWith(2)
    })

    it('maps the result of a promise', function () {
      const promise = Promise.resolve(1)
      const promise_ = over(success, x => x * 2, promise)
      return expect(promise_).to.eventually.equal(2)
    })
  })
})
