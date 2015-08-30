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
import { compose, get, lookup, set, over } from 'safety-lens'
import { index } from 'safety-lens/immutable'

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


## Install

```
npm install --save safety-lens
```


## Consuming types

To include type information with this library, create a `.flowconfig` file in
your project root with a reference to the interface file directory in this
module.
For example:

```
[libs]
node_modules/safety-lens/types/
```
