lens.js
=======

Type-safe, functional lens library - still in early stages of development.
This is basically a port of some of the concepts from the Haskell [lens][] library.

[lens]: https://hackage.haskell.org/package/lens

Lenses are functions that provide reusable views into data structures.
Lenses are bidirectional: they can be used to retrieve from or set data within
a possibly deeply-nested, immutable structure.
For example:

```js
import { fromJS } from 'immutable'

var data = fromJS([[1, 2], [3, 4]])
```

To get the second element from the first sub-list,
you could use this lens:

```js
import { compose, get, lookup, set, over } from 'lens'
import { index } from 'lens/immutable'

var lens = compose(index(0), index(1))
assert( lookup(lens, data) === 2 )
```

And to update the same position, use the same lens:

```js
import { is } from 'immutable'

var updated = set(lens, 5, data)
assert( is(updated, fromJS([[1, 5], [3, 4]])) )
```

You can also modify nested data with a function,
again using the same lens:

```js
var updated_ = over(lens, x => x * 2, data)
assert( is(updated_, fromJS([[1, 6], [3, 4]])) )
```

Until documentation materializes, take a look at the [tests][] to see how this
library works.

[tests]: https://github.com/hallettj/lens.js/tree/master/test/immutable.js
