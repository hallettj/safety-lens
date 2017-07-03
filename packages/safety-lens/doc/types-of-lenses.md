# Types of Lenses

There are several different types of Lenses, which have different capabilities.
Some of these types subsume others.

`Lens<S,T,A,B>` is the most general type.
A lens of type `Lens` can usually be used for any operation in safety-lens.


## Type parameters explained

The generic type of a lens is `Lens<S,T,A,B>`.
The type parameters `S,T,A,B` are evocative, but perhaps not self-explanatory.
A lens can retrieve a value within a data structure,
so the type of the lens should encode the type of data structures that it can
be applied to, and the type of the value that the lens focuses on.

- The parameter `S` is the type of *S*tructure that a lens can operate on.
- The parameter `A` is the type of the piece that the lens focuses on.

For example,
a lens of type `Lens<[string,boolean],T,boolean,B>` applies to pairs of
a string and a boolean.
(e.g. `['foo', true]` or `['bar', false]`)
This lens gets the `boolean` value out of the pair.

A lens might also be able to replace the focused part of a data structure.
The new value that you put in might not be of the same type as the value that
was there before.
If the type of the focused piece changes,
the type of the overall data structure might also change.

- The parameter `T` is the type of a *T*ransformed structure,
  after the structure has been updated using the given lens.
- The parameter `B` is the type for allowed values when setting.
  After setting, the focused type will change from *A* to *B*.

Continuing from the previous example,
a lens of type `Lens<[string,boolean], [string,boolean|number], boolean, boolean|number>`
operates on values of type `[string, boolean]`, and retrieves the `boolean`
piece when using `get` or `lookup`.
But when setting,
this lens can be used to set a value of type `number` instead of type `boolean`.
If that happens,
the overall result will be a new data structure of type `[string, number]`.

That example can be implemented like this:

```js
import { lens, get, set } from 'safety-lens'
import type { Lens } from 'safety-lens'

const myLens: Lens<[string,boolean], [string,boolean|number], boolean, boolean|number> =
  lens(
    ([_,b]) => b,        // getter function
    ([a,_], c) => [a,c]  // setter function
  )

const pair = ['foo', true]
const b: boolean = get(myLens, pair)

const pair_ = set(myLens, 1, pair)
const n: boolean|number = get(myLens, pair_)
```

It might be useful to have a lens like this,
but that is a bit more general.
The lens `_2` from the `safety-lens/es2015` module is just that:

```js
_2: Lens<[X,A],[X,B],A,B>
```

`_2` can operate on any pair, `[X,A]`,
and retrieves or updates the second value in the pair, `A`.
When setting, `_2` sets a value of type `B`,
which means that the result will be a pair of type `[X,B]`.
`B` might or might not be the same type as `A`,
depending on the context where the lens is used.

It is common to define a lens that is not supposed to change the types of
structures or focused pieces that it operates on.
For these cases there is a type alias:

```js
type Lens_<S,A> = Lens<S,S,A,A>
```

The alias fixes `T` and `B` so that `S = T`, and `A = B`.
A variation of `myLens` that operates on `[string,boolean]` values,
and that does not allow updates to change the type of the data structure or the
focused value would have the type `Lens_<[string,boolean],boolean>`.


## Specialized lens types

Once again,
`Lens<S,T,A,B>` is the most general type.
A lens of type `Lens` can usually be used for any operation in safety-lens.

`Getting<R,S,A>` is the type of lens used for getting values with the `get` function.
Any lens of type `Lens_<S,A>` can be used in where the type `Getting<R,S,A>` is required.
(`Lens_<S,A>` is an alias for `Lens<S,S,A,A>`, where `S` and `T` are
constrained to be the same type,
and `A` and `B` are the same type.)
But a `Getting` lens by itself is effectively read-only.

`Traversal<S,T,A,B>` is a read-write lens that, unlike `Lens`, can focus on
multiple pieces of a data structure simultaneously,
or that can focus on a piece that might not be present.
For example, a `Traversal` is what you would use to access a specific index in
a list,
or to access all elements in a list in one pass.
Any lens of type `Lens<S,T,A,B>` can be used in where the type `Traversal<S,T,A,B>` is required.

`Setting<S,T,A,B>` is a write-only lens.
Any lens of type `Lens<S,T,A,B>` or of type `Traversal<S,T,A,B>` can be used
where the type `Setting<S,T,A,B>` is required.

`Fold<R,S,A>` is read-only like `Getting` -
but like `Traversal`, a `Fold` lens can focus on multiple pieces of a data
structure, or on a piece that might not be present.
Any lens of type `Lens_<S,A>`, `Traversal_<S,A>`, or `Getting<R,S,A>` can be
used where the type `Fold<R,S,A>` is required.
(As with `Lens_<S,A>`, `Traversal_<S,A>` is an alias for `Traversal<S,S,A,A>`.)

These lens types can be composed with each other using the `compose` function.
The result is a lens of incorporates the restrictions of all of the input lenses.
For example, if a `Lens` is composed with a `Traversal`,
the result is also a `Traversal`.
If a `Getting` is composed with a `Traversal`, the result is a `Fold`.
On the other hand, a `Getting` and a `Setting` cannot be composed,
because they have mutually incompatible specializations.
Flow is able to track and enforce these results when type-checking.

This diagram shows the lens hierarchy,
and lists functions that are specialized for each lens type:

```
+-----------------------------------+   +-----------------------------------+
|            Fold<R,S,A>            |   |         Setting<S,T,A,B>          |
|-----------------------------------|   |-----------------------------------|
| lookup: <S,A>(                    |   | set: <S,T,A,B>(                   |
|   lens: Fold<First<A>,S,A>,       |   |   lens: Setting<S,T,A,B>,         |
|   obj: S                          |   |   val: B,                         |
| ) => ?A                           |   |   obj: S                          |
|                                   |   | ) => T                            |
| foldMapOf: <R:Monoid,S,A>(        |   |                                   |
|   lens: Fold<R,S,A>,              |   | over: <S,T,A,B>(                  |
|   fn: (val: A) => R,              |   |   lens: Setting<S,T,A,B>,         |
|   mempty: R,                      |   |   fn: (val: A) => B,              |
|   obj: S                          |   |   obj: S                          |
| ) => R                            |   | ) => T                            |
|                                   |   +-----------------------------------+
| foldrOf: <R,S,A>(                 |                        ^
|   lens: Fold<Endo<R>,S,A>,        |                        |
|   fn: (val: A, accum: R) => R,    |                        |
|   init: R,                        |                        |
|   obj: S                          |                        |
| ) => R                            |                        |
|                                   |                        |
| sumOf: <S>(                       |                        |
|   l: Fold<Endo<number>,S,number>, |  S = T, A = B          |
|   obj: S                          |<---------------+       |
| ) => number                       |                |       |
+-----------------------------------+                |       |
                 ^                                   |       |
                 |                                   |       |
                 |                                   |       |
+-----------------------------------+   +-----------------------------------+
|          Getting<R,S,A>           |   |        Traversal<S,T,A,B>         |
|-----------------------------------|   |-----------------------------------|
| get: <S,A>(                       |   | traverseOf: <S,T,A,B,             |
|   lens: Getting<A,S,A>,           |   |              FB: Apply<B>,        |
|   obj: S                          |   |              FT: Apply<T>>(       |
| ) => A                            |   |   pure: Pure,                     |
+-----------------------------------+   |   lens: Traversal<S,T,A,B>,       |
             ^                          |   fn: (p: Pure, _: A) => FB,      |
             |                          |   obj: S                          |
             |  S = T, A = B            | ) => FT                           |
             +----------------+         +-----------------------------------+
                              |             ^
                              |             |
                              |             |
                   +-----------------------------------+
                   |           Lens<S,T,A,B>           |
                   +-----------------------------------+
```
