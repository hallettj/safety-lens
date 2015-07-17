/* @flow */

export type Maybe<A> = Just<A> | Nothing

class Just<A> {
  value: A;
  constructor(value: A) {
    this.value = value
  }
  map<B>(f: (val: A) => B): Just<B> {
    return new Just(f(this.value))
  }
  ap<T,U>(x: Maybe<T>): Maybe<U> {
    var f: any = this.value
    if (x instanceof Just) {
      return new Just(f(x.value))
    }
    else {
      return x
    }
  }
}

class Nothing {
  map<B>(f: (_: any) => B): Nothing { return this }
}
