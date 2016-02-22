# safety-lens API

The page [Types of Lenses][] provides background on the types described here.
Please read that page before reading this documentation.

[Types of Lenses]: ./types-of-lenses.md

safety-lens is divided into several modules.

- `'safety-lens'`, the main module, contains general purpose functions and types.
  This module does not export lenses, but does export `get`, `set`, and other
  functions that take lenses as arguments.
  It also contains some helpers for building and composing lenses.
- `'safety-lens/es2015'` exports lenses that operate on native JavaScript data structures,
  such as objects, maps, arrays, pairs, and promises.
- `'safety-lens/immutable'` exports lenses that operate on data structures from [Immutable][].

[Immutable]: https://facebook.github.io/immutable-js/

Lenses from `'safety-lens/es2015'` and `'safety-lens/immutable'` are interoperable.
For example, if you have an object that contains an Immutable list,
you could compose the `prop` lens from `'safety-lens/es2015'` with the `index`
lens from `'safety-lens/immutable'` to access an index within the list.

## `safety-lens`

General purpose functions and types.

### `compose: (...lenses) => lens`

Combines two or more lenses.
This is most useful for reaching through multiple layers of nesting in a data structure.

Lenses compose from left-to-right.

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

The result of `compose` is a lens of incorporates the restrictions of all of
the input lenses.
For example, if a `Lens` is composed with a `Traversal`,
the result is also a `Traversal`.
If a `Getting` is composed with a `Traversal`, the result is a `Fold`.
On the other hand, a `Getting` and a `Setting` cannot be composed,
because they have mutually incompatible specializations.
Flow is able to track and enforce these results when type-checking.
(See [Types of Lenses][] for explanations of these lens types.)

### `foldMapOf: <R:Monoid,S,A>(lens: Fold<R,S,A>, fn: (val: A) => R, mempty: R, obj: S) => R`

Translate every focused piece in a data structure according to a function,
and combine the results using the [Monoid][] `concat` operation.

[Monoid]: https://www.npmjs.com/package/fantasy-land#monoid

If you do not want to bother with monoids, use `foldrOf` instead.

```js
import { foldMapOf } from 'safety-lens'
import { traverse } from 'safety-lens/immutable'
import { List } from 'immutable'

const xs = List.of(1,2,3,4)

class Sum {
  constructor(n) { this.n = n }
  concat(other) { return new Sum(this.n + other.n) }
  empty() { return new Sum(0) }
}

const total = foldMapOf(traverse, x => new Sum(x), new Sum(0), xs)

assert( total.n === 10 )
```

Type-checking Monoid implementations is still a work in progress.

### `foldrOf: <R,S,A>(lens: Fold<Endo<R>,S,A>, fn: (val: A, accum: R) => R, init: R, obj: S) => R`

Combines values in a data structure focused by the given lens using a right-fold.

```js
import { foldrOf } from 'safety-lens'
import { traverse } from 'safety-lens/immutable'
import { List } from 'immutable'

const xs = List.of(1,2,3,4)

const total = foldrOf(traverse, (x, sum) => x + sum, 0, xs)

assert( total === 10 )
```

### `get: <S,A>(lens: Getting<A,S,A>, obj: S) => A`

Get a nested value using a lens.

Given a lens that is capable of getting, and a data structure,
returns the value of the piece within the data structure that the lens focuses on.

```js
import { get } from 'safety-lens'
import { prop } from 'safety-lens/es2015'

let obj = { foo: 1, bar: 2 }

assert( get(prop('bar'), obj) === 2 )
```

`get` should not ever return `undefined` - unless the data structure actually
contains `undefined` in the focused spot.

### `getter: <S,A>(getter: (obj: S) => A) => Getter<S,A>`

Turns an ordinary getter function into a `Getter` lens.
A lens of type `Getter<S,A>` can be used where the type `Getting<R,S,A>` is
required.

### `to: <S,A>(getter: (obj: S) => A) => Getter<S,A>`

Alias for `getter`

### `id: <A>(val: A) => A`

Function that returns its argument unaltered.

### `lens: <S,T,A,B>(getter: (obj: S) => A, setter: (obj: S, val: B) => T) => Lens<S,T,A,B>`

Creates a general purpose lens from a getter function and a setter function.
This is the easiest way to create custom lenses,
if you cannot create the lens that you need by composing available lenses.

### `lookup: <S,A>(lens: Fold<First<A>,S,A>, obj: S) => ?A`

Get a value using a lens - but might return `undefined` if the position that
the lens focuses on does not exist in the data structure.

```js
import { lookup } from 'safety-lens'
import { key } from 'safety-lens/immutable'
import { Map } from 'immutable'

const map = Map({ foo: 1, bar: 2 })

const x = lookup(key('bar'), map)
assert( x === 2 )

const y = lookup(key('baz'), map)
assert( typeof y === 'undefined' )
```

If the lens focuses on multiple pieces in the data structure,
`lookup` returns the first focused piece.

### `over: <S,T,A,B>(lens: Setting<S,T,A,B>, fn: (val: A) => B, obj: S) => T `

Update a nested value by applying a function.

Given a lens that is capable of setting, an updater value, and a data structure,
creates a new data structure identical to the original,
but with the piece that the lens focuses replaced by the return value of the
given function.

```js
import { over } from 'safety-lens'
import { prop } from 'safety-lens/es2015'

let obj = { foo: 1, bar: 2 }

obj = over(prop('bar'), x => x * 2, obj)

assert( obj.bar === 4 )
```

The type `T` stands in for the type of the new data structure.
This may or may not be the same as `S`,
depending on the data structure and the new value that was set.

### `set: <S,T,A,B>(lens: Setting<S,T,A,B>, val: B, obj: S) => T `

Set a nested value using a lens.

Given a lens that is capable of setting, an updated value, and a data structure,
creates a new data structure identical to the original,
but with the piece that the lens focuses replaced by the given value.

```js
import { set } from 'safety-lens'
import { prop } from 'safety-lens/es2015'

let obj = { foo: 1, bar: 2 }

obj = set(prop('bar'), 3, obj)

assert( obj.bar === 3 )
```

The type `T` stands in for the type of the new data structure.
This may or may not be the same as `S`,
depending on the data structure and the new value that was set.

### `sumOf: <S>(lens: Fold<Endo<number>,S,number>, obj: S) => number`

Given a lens that focuses on numeric values in the given data structure,
returns the sum of those values.

```js
import { sumOf } from 'safety-lens'
import { traverse } from 'safety-lens/immutable'
import { List } from 'immutable'

const xs = List.of(1,2,3,4)

const total = sumOf(traverse, xs)

assert( total === 10 )
```


## `safety-lens/es2015`

Exports lenses that operate on native JavaScript data structures.

### `_1: Lens<[A,X],[B,X],A,B>`

Focus on the first element of a pair.

```js
import { get } from 'safety-lens'
import { _1 } from 'safety-lens/es2015'

const pair = ['foo', true]

const x = get(_1, pair)

assert( x === 'foo' )
```

### `_2: Lens<[X,A],[X,B],A,B>`

Focus on the second element of a pair.

```js
import { get } from 'safety-lens'
import { _2 } from 'safety-lens/es2015'

const pair = ['foo', true]

const x = get(_2, pair)

assert( x === true )
```

### `index: <A>(idx: number) => Traversal_<A[],A>`

Given an index, focuses on the corresponding position in an array.

```js
import { lookup } from 'safety-lens'
import { index } from 'safety-lens/es2015'

const xs = [1,2,3,4]

assert( lookup(index(1), xs) === 2 )
```

`index` is a `Traversal`, so it cannot be used with `get` to retrieve a value.
However, you can use `lookup`, which differs from `get` in that it might return `undefined`.

### `key: <S:Object,T:Object,A,B>(name: string) => Lens<S,T,A,B>`

Given the name of a property, focuses on the value of that property in some map or object.
A lens created this way can operate on any object that has a property with the same name.

### `prop: <S:Object,T:Object,A,B>(name: $Keys<S> | $Keys<T>) => Lens<S,T,A,B>`

Given the name of a property, focuses on the value of that property in some object.
A lens created this way can operate on any object that has a property with the same name.

```js
import { lookup } from 'safety-lens'
import { index } from 'safety-lens/es2015'

const xs = [1,2,3,4]

assert( lookup(index(1), xs) === 2 )
```

`prop` shares the same implementation with `key`;
but `prop` has more thorough type-checking.
Flow is able to check that the name given to `prop` actually exists in the
object that the resulting lens is applied to.
But Flow is not currently able to check types of values set or retrieved using
`prop`.

### `success: Setting<Promise<A>,Promise<B>,A,B>`

Focus on the successful result of a promise.
If the promise is not successful, this lens has no effect.

```js
import { over } from 'safety-lens'
import { succes } from 'safety-lens/es2015'

const promise = Promise.resolve(2)
const promise_ = over(success, x => x * 2, promise)

promise_.then(x => assert( x === 4 ))
```

This lens can only be used to set values - use it with `set` or `over`.

### `failure: Setting<Promise<X>,Promise<X>,A,B>`

Focus on the failure result of a promise.
If the promise is successful, this lens has no effect.

```js
import { over } from 'safety-lens'
import { failure } from 'safety-lens/es2015'

const promise = Promise.reject(2)
const promise_ = over(failure, x => x * 2, promise)

promise_.then(null, x => assert( x === 4 ))
```

This lens can only be used to set values - use it with `set` or `over`.

## `safety-lens/immutable`

Exports lenses that operate on data structures from [Immutable][].

### `contains: <V>(val: V) => Lens_<Set<V>, boolean>`

Focus on the presence or absence of a given value in a [Set][].
Using `get` with this lens will return `true` if the value is in the set.
Using `set` and setting a value of `true` or `false` will add or remove the
value from the set.

```js
import { get, set } from 'safety-lens'
import { contains } from 'safety-lens/immutable'
import { Set } from 'immutable'

let ns = Set.of(1,2,3,4)

assert( get(contains(2), ns) === true )

ns = set(contains(2), false, ns)

assert( get(contains(2), ns) === false )

ns = set(contains(6), true, ns)

assert( get(contains(6), ns) === true )
```

### `field: <S:Object,A>(name: $Keys<S>) => Lens_<Record<S>,A>`

Focus on a field in a [Record][].

```js
import { get } from 'safety-lens'
import { field } from 'safety-lens/immutable'
import { Record } from 'immutable'

const MyRecord = Record({ foo: 1, bar: 2 })
const r = MyRecord()

const x = get(field('bar'), r)

assert( x === 2 )
```

### `index: <K,V, S:Iterable<K,V>>(idx: K) => Traversal_<S,V> `

Focus on a key or index in an [Iterable][] value.
This works on all Iterable types from Immutable:
[List][], [Map][], [Set][], [Seq][], etc.

```js
import { lookup } from 'safety-lens'
import { index } from 'safety-lens/immutable'
import { List } from 'immutable'

const xs = List.of(1,2,3,4)

const x = lookup(index(0), xs)

assert( x === 1 )
```

`index` is a `Traversal`, so it cannot be used with `get` to retrieve a value.
However, you can use `lookup`, which differs from `get` in that it might return `undefined`.

### `key: <K,V, S:Iterable<K,V>>(idx: K) => Traversal_<S,V> `

Alias for `index`.

The name `key` is intended to remind one of map keys, as opposed to list indexes.

```js
import { lookup } from 'safety-lens'
import { key } from 'safety-lens/immutable'
import { Map } from 'immutable'

const map = Map({ foo: 1, bar: 2 })

const x = lookup(key('bar'), map)

assert( x === 2 )
```

### `toListOf: <S,A>(lens: Fold<Endo<List<A>>,S,A>, obj: S) => List<A>`

Build a [List][] of all pieces in a data structure that are focused by the given lens.

```js
import { toListOf, traverse } from 'safety-lens/immutable'
import { List, Map, is } from 'immutable'

const map = Map({ foo: 1, bar: 2 })

const values = toListOf(traverse, map)

assert(is( values, List.of(1, 2) ))
```

### `toStackOf: <S,A>(l: Fold<Endo<Stack<A>>,S,A>, obj: S) => Stack<A>`

Like `toListOf`, but builds a [Stack][] instead of a [List][].

### `traverse: Traversal<Collection<K,A>,Collection<K,B>,A,B>`

Focuses on every value in a [Collection][].

TODO: `traverse` should focus on entries in a map, not just on values

[Collection]: https://facebook.github.io/immutable-js/docs/#/Collection
[List]: https://facebook.github.io/immutable-js/docs/#/List
[Map]: https://facebook.github.io/immutable-js/docs/#/Map
[Record]: https://facebook.github.io/immutable-js/docs/#/Record
[Seq]: https://facebook.github.io/immutable-js/docs/#/Seq
[Set]: https://facebook.github.io/immutable-js/docs/#/Set
[Stack]: https://facebook.github.io/immutable-js/docs/#/Stack
