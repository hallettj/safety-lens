import { expect } from 'chai'
import { List, fromJS, is } from 'immutable'
import { compose, get, set } from '../lens'
import { index } from '../immutable'

describe('immutable', () => {

  var list = List([1,2,3,4])
  var nestedList = fromJS([[1, 2], [3, 4]])

  it('gets an index with `index`', () => {
    expect(
      get(index(1), list)
    )
    .to.equal(2)
  })

  it('gets nested indexes via composition', () => {
    var lens = compose(index(0), index(1))
    expect(get(lens, nestedList)).to.equal(2)
  })

  it('sets an index with `index`', () => {
    expect(
      is( set(index(1), 5, list), List([1,5,3,4]) )
    )
    .to.be.true
  })

  it('sets nested indexes via composition', () => {
    var lens = compose(index(0), index(1))
    expect(
      is( set(lens, 5, nestedList), fromJS([[1, 5], [3, 4]]) )
    )
    .to.be.true
  })

})
