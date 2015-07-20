
import { expect } from 'chai'
import { bool, integer, pair } from 'jsverify'
import { List, fromJS, is } from 'immutable'
import { compose, get, over, set } from '../lens'
import { contains, index } from '../immutable'
import * as laws from './laws'
import { dependent } from './immutable/arbitrary'
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

  // it('gets an index with `index`', () => {
  //   expect(
  //     get(index(1), aList)
  //   )
  //   .to.equal(2)
  // })

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

})
