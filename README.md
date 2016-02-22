safety-lens
===========

Type-safe, functional lens library in JavaScript.
This is basically a port of some of the concepts from the Haskell [lens][] library.
Safety-lens goes best with [Flow][], and pairs well with [Immutable][].

[lens]: https://hackage.haskell.org/package/lens
[Flow]: http://flowtype.org/

A lens is used to focus in on a specific piece of a data structure.
Using a lens, that piece can be read or updated.
For example:

```js
import { get, set } from 'safety-lens'
import { prop } from 'safety-lens/es2015'

let obj = { foo: 1, bar: 2 }

// Get a value
assert( get(prop('bar'), obj) === 2 )

obj = set(prop('bar'), 3, obj)

// Set a value
assert( get(prop('bar'), obj) === 3 )
```

The function call `prop('bar')` creates a lens that focuses on the `bar`
property of any object.

`get` takes a lens and an object, and returns a reference to the focused piece
of the object.
So `get(prop('bar'), obj)` returns `2`.

`set` takes a lens, a new value, and an object, and replaces the focused piece
of the object with the new value.
Or to be more precise, `set` creates a copy of the object in which the focused
piece has been replaced with the new value.
In the example above, `set(prop('bar'), 3, obj)` creates a new object that sets
the `bar` property to `3`, and keeps the `foo` property set to `1`.

This is obviously more complicated than writing the equivalent expressions
`obj.bar` or `obj.bar = 3`.
But lenses do come with several advantages:

- Lenses perform immutable updates: you get an updated copy of a data structure, while the original is untouched.
  This means that lenses pair nicely with immutable data libraries like [Immutable][] or [Mori][].

- Lenses can be composed to focus on deeply nested pieces of a data structure.
  Updating a deeply-nested, immutable data structure by hand is painful -
  but lenses make it easy.

- Lenses provide type safety.
  Immutable has methods [`getIn`][getIn], [`setIn`][setIn];
  and Mori has equivalent functions.
  These are invaluable for working with deeply nested data structures.
  But there is no type checker available today that can check the type of
  a value returned from one of these functions,
  or that can check that appropriate types are used in updates.
  Lenses do the same job, but with dependable type-checking using [Flow][].

- Lenses provide encapsulation.
  When writing a library or module,
  you can export lenses, but keep the details of your data structures hidden.

[Immutable]: https://facebook.github.io/immutable-js/
[Mori]: https://swannodette.github.io/mori/
[getIn]: https://facebook.github.io/immutable-js/docs/#/Iterable/getIn
[setIn]: https://facebook.github.io/immutable-js/docs/#/Map/setIn


## Documentation

Please refer to these topics for more information:

- [Types of Lenses][], covers specialized lens types, and explains type parameters
- [API Documentation][]

[Types of Lenses]: doc/types-of-lenses.md
[API Documentation]: doc/api-documentation.md


## Install

```
npm install --save safety-lens
```


## Building from source

Run:

```
$ npm install
```

That invokes the `prepublish` npm script,
which runs the type checker, transpiles code, and runs tests.
Requires GNU Make.

## Examples of usage

### Getting and setting nested values

```js
import { get, set } from 'safety-lens'
import { prop } from 'safety-lens/es2015'

let obj = { foo: 1, bar: 2 }

// Get a value
assert( get(prop('bar'), obj) === 2 )

obj = set(prop('bar'), 3, obj)

// Set a value
assert( get(prop('bar'), obj) === 3 )
```

### Transforming nested values with a function

```js
import { over } from 'safety-lens'
import { prop } from 'safety-lens/es2015'

let obj = { foo: 1, bar: 2 }

obj = over(prop('bar'), x => x * 2, obj)

assert( obj.bar === 4 )
```

### Composing lenses

Imagine a program with values of this type:

```js
import { List } from 'immutable'

type Calendar = List<{ date: Date, title: string }>

const events = List.of(
  { date: new Date(), title: 'get coffee' },
  { date: new Date(), title: 'plan day' }
)
```

To construct a lens that can focus on the title of the first event in a calendar list:

```js
import { compose, lookup } from 'safety-lens'
import { index } from 'safety-lens/immutable'
import { prop } from 'safety-lens/es2015'

const firstEventLens = index(0)
const titleLens = prop('title')

const firstEventTitleLens = compose(firstEventLens, titleLens)

assert( lookup(firstEventTitleLens, events) === 'get coffee' )
```

A lens might focus on multiple pieces within a data structure simultaneously.
To operate on all events in a calendar:

```js
import { over } from 'safety-lens'
import { traverse } from 'safety-lens/immutable'

const dateLens = prop('date')

const allDatesLens = compose(traverse, dateLens)

// Moves all events forward by one day.
const rescheduled = over(
  allDatesLens,
  date => new Date(Number(date) + 24 * 60 * 60 * 1000),
  events
)
```
