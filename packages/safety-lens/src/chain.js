/* @flow */
import { set, over } from '../setter';

class Chain<S> {
    s: S;

    constructor(s: S) {
        this.s = s;
    }

    set(setter: Setting<S, T, A, B>, val: B): Chain<T> {
        return new Chain(set(setter, val, this.s));
    }

    over(setter: Setting<S, T, A, B>, f: (val: A) => B): Chain<T> {
        return new Chain(over(setter, f, this.s));
    }

    build(): S {
        return this.s;
    }
}
export const chain = (s: S): Chain<S> => new Chain(s);