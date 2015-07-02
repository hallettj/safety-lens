
import { expect } from 'chai'
import { List  } from 'immutable'
import { get } from '../lens'
import * as immutable from '../immutable'

describe('immutable', () => {

  var list = List([1,2,3,4])

  it('gets an index with `index`', () => {
    expect(
      get(list, immutable.index(1))
    )
    .to.equal(2)
  })

})
