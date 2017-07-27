/* @flow */
import { set, over } from '../setter';

export function chain(s: S): Chain<S> {
  return {
      set: function(setter: Setting<S, T, A, B>, val: B): Chain<T> {
          return chain(set(setter, val, s));
      },

      over: function(setter: Setting<S, T, A, B>, f: (val: A) => B): Chain<T> {
          return chain(over(setter, f, s));
      },

      build: function(): S {
        return s;
      }
  };
};