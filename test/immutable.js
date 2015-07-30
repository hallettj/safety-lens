
import { expect } from 'chai'
import { bool, integer, pair } from 'jsverify'
import { List, fromJS, is } from 'immutable'
import { compose, foldrOf, get, lookup, over, set, sumOf } from '../lens'
import { contains, index, traverse } from '../immutable'
import * as laws from './laws'
import * as arbitrary from './immutable/arbitrary'

var lensLaws = laws.lensLaws.bind(null, is)

describe('immutable', () => {

  describe('contains', lensLaws({
    dataAndLens: pair(
      arbitrary.set(integer),
      arbitrary.fmap(x => contains(x), integer)
    ),
    value: bool,
  }))

  var aList = List([1,2,3,4])
  var aNestedList = fromJS([[1, 2], [3, 4]])

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

  // it('gets nested indexes via composition', () => {
  //   var lens = compose(index(0), index(1))
  //   expect(get(lens, aNestedList)).to.equal(2)
  // })

  it('sets an index with `index`', () => {
    expect(
      is( set(index(1), 5, aList), List([1,5,3,4]) )
    )
    .to.be.true
  })

  it('sets nested indexes via composition', () => {
    var lens = compose(index(0), index(1))
    expect(
      is( set(lens, 5, aNestedList), fromJS([[1, 5], [3, 4]]) )
    )
    .to.be.true
  })

  it('modifies an index with a function with `index`', () => {
    expect(
      is( over(index(2), x => x * 2, aList), List([1,2,6,4]) )
    )
    .to.be.true
  })

  it('modifies nested indexes via composition', () => {
    var lens = compose(index(1), index(0))
    expect(
      is( over(lens, x => x * 2, aNestedList), fromJS([[1, 2], [6, 4]]) )
    )
    .to.be.true
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

})
