import { expect } from 'chai'
import { List, is } from 'immutable'
import { compose, get } from '../lens'
import { index } from '../immutable'

describe('immutable', () => {

  var list = List([1,2,3,4])
  var nestedList = List([List([1,2]), List([3,4])])

  it('gets an index with `index`', () => {
    expect(
      get(list, index(1))
    )
    .to.equal(2)
  })

  it('gets nested indexes via composition', () => {
    var lens = compose(index(0), index(1))
    expect(get(nestedList, lens)).to.equal(2)
  })

})
