/* @flow */

export {
  Functor,
  compose,
  get,
  lens,
  over,
  set,
}

export type Lens<S,T,A,B> =
  (f: (val: A) => $Subtype<Functor<B>>) => ((obj: S) => $Subtype<Functor<T>>)

export type SimpleLens<S,A> = Lens<S,S,A,A>

export type Getting<R,S,A> =
  (f: (val: A) => Const<R,A>) => ((obj: S) => Const<R,S>)

export type Setting<S,T,A,B> =
  (f: (val: A) => Identity<B>) => ((obj: S) => Identity<T>)

export type Getter<S,A> = Getting<A,S,A>
export type Setter<S,T,A,B> = Setting<S,T,A,B>

export type SimpleSetter<S,A> = Setter<S,S,A,A>

class Functor<A> {
  map<B>(f: (val: A) => B): Functor<B> {
    throw 'Functor#map is abstract'
  }
}

class Const<R,A> extends Functor<A> {
  value: R;
  constructor(value: R) {
    super()
    this.value = value
  }
  map<B>(f: (_: A) => B): Const<R,B> {
    return new Const(this.value)
  }
}

class Identity<A> extends Functor<A> {
  value: A;
  constructor(value: A) {
    super()
    this.value = value
  }
  map<B>(f: (_: A) => B): Identity<B> {
    return new Identity(f(this.value))
  }
}

// Ordinary function composition
function compose<A,B,C>(f: (_: B) => C, g: (_: A) => B): (_: A) => C {
  return x => f(g(x))
}


/* lenses */

function lens<S,T,A,B>(
  getter: (obj: S) => A,
  setter: (obj: S, val: B) => T
): Lens<S,T,A,B> {
  return f => obj => (
    f(getter(obj)).map(val => setter(obj, val))
  )
}


/* getting */

function to<S,A>(getter: (obj: S) => A): Getter<S,A> {
  return f => obj => (
    f(getter(obj)).map(val => obj)
  )
}

function get<S,A>(getter: Getting<A,S,A>, obj: S): A {
  return getter(v => new Const(v))(obj).value
}


/* setting */

function set<S,T,A,B>(setter: Setter<S,T,A,B>, val: B, obj: S): T {
  return setter(_ => new Identity(val))(obj).value
}

function over<S,T,A,B>(setter: Setting<S,T,A,B>, f: (val: A) => B, obj: S): T {
  return setter(a => new Identity(f(a)))(obj).value
}
