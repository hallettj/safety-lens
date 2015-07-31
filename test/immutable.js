
import chai from 'chai'
import chaiImmutable from 'chai-immutable'
import { bool, integer, pair } from 'jsverify'
import { List, Record, Stack, fromJS, is } from 'immutable'
import { compose, filtering, foldrOf, get, lookup, over, set, sumOf, to } from '../lens'
import { contains, field, index, toListOf, toStackOf, traverse } from '../immutable'
import * as laws from './laws'
import * as arbitrary from './immutable/arbitrary'

var expect = chai.expect
chai.use(chaiImmutable)

var lensLaws = laws.lensLaws.bind(null, is)

describe('immutable', () => {

  describe('contains', lensLaws({
    dataAndLens: pair(
      arbitrary.set(integer),
      arbitrary.fmap(x => contains(x), integer)
    ),
    value: bool,
  }))

  type Foo = { foo: number, bar: number, baz: number }
  var FooRecord = Record({ foo: 1, bar: 2, baz: 3 })
  var foo: Record<Foo> = new FooRecord()

  var aList = List([1,2,3,4])
  var aNestedList = fromJS([[1, 2], [3, 4]])

  it('gets a value from a record', () => {
    expect(
      get(field('foo'), foo)
    )
    .to.equal(1)
  })

  it('sets a value on a record', () => {
    expect(
      set(field('bar'), 7, foo)
    )
    .to.equal(
      new FooRecord({ bar: 7 })
    )
  })

  it('maps a value on get', () => {
    var lens = compose(field('bar'), to(x => x*2))
    expect(
      get(lens, foo)
    )
    .to.equal(4)
  })

  it('gets an index with `index`', () => {
    expect(
      lookup(index(1), aList)
    )
    .to.equal(2)
  })

  it('gets an undefined value from an out-of-range index', () => {
    expect(
      lookup(index(9), aList)
    )
    .to.be.undefined
  })

  it('gets nested indexes via composition', () => {
    var lens = compose(index(0), index(1))
    expect(lookup(lens, aNestedList)).to.equal(2)
  })

  it('sets an index with `index`', () => {
    expect(
      set(index(1), 5, aList)
    )
    .to.equal(
      List([1,5,3,4])
    )
  })

  it('sets nested indexes via composition', () => {
    var lens = compose(index(0), index(1))
    expect(
      set(lens, 5, aNestedList)
    )
    .to.equal(
      fromJS([[1, 5], [3, 4]])
    )
  })

  it('modifies an index with a function with `index`', () => {
    expect(
      over(index(2), x => x * 2, aList)
    )
    .to.equal(
      List([1,2,6,4])
    )
  })

  it('modifies nested indexes via composition', () => {
    var lens = compose(index(1), index(0))
    expect(
      over(lens, x => x * 2, aNestedList)
    )
    .to.equal(
      fromJS([[1, 2], [6, 4]])
    )
  })

  it('modifies all members of a list', () => {
    expect(
      is( over(traverse, x => x * 2, aList), List([2,4,6,8]) )
    )
  })

  it('gets nothing out of an empty list', () => {
    expect(
      lookup(traverse, List())
    ).to.be.undefined
  })

  it('modifies all members of a map', () => {
    var aMap = fromJS({ foo: 1, bar: 2, nao: 3 })
    expect(
      is( over(traverse, x => x * 2, aMap), fromJS({ foo: 2, bar: 4, nao: 6 }) )
    )
  })

  it('computes a fold of a list', () => {
    expect(
      foldrOf(traverse, (x,y) => x+y, 0, aList)
    )
    .to.equal(10)
  })

  it('computes the sum of a list', () => {
    expect(
      sumOf(traverse, aList)
    )
    .to.equal(10)
  })

  it('computes the sum of nested lists', () => {
    expect(
      sumOf(compose(traverse, traverse), aNestedList)
    )
    .to.equal(10)
  })

  it('filters a list', () => {
    var even = x => x % 2 == 0
    expect(
      sumOf(compose(traverse, filtering(even)), aList)
    )
    .to.equal(6)
  })

  it('updates positions of a list according to a filter', () => {
    var even = x => x % 2 == 0
    var aList = fromJS([1,2,3,4])
    expect(
      over(compose(traverse, filtering(even)), x => x*2, aList)
    )
    .to.equal(
      fromJS([1,4,3,8])
    )
  })

  it('filters items in nested lists', () => {
    var even = x => x % 2 == 0
    expect(
      sumOf(compose(traverse, compose(traverse, filtering(even))), aNestedList)
    )
    .to.equal(6)
  })

  it('maps items on lookup', () => {
    expect(
      lookup(compose(index(1), to(x => x*2)), aList)
    )
    .to.equal(4)
  })

  it('produces a list from a traversal', () => {
    var even = x => x % 2 == 0
    var lens = compose(traverse, compose(traverse, filtering(even)))
    expect(
      toListOf(lens, aNestedList)
    )
    .to.equal(
      fromJS([2,4])
    )
  })

  it('produces a stack from a traversal', () => {
    var even = x => x % 2 == 0
    var lens = compose(traverse, compose(traverse, filtering(even)))
    expect(
      toStackOf(lens, aNestedList)
    )
    .to.equal(
      Stack([2,4])
    )
  })

})
