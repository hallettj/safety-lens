# Changelog

## v1.6.0

- Switch from fantasy-land to flow-static-land
- Move lenses for native JS types and for immutable to separate packages
- Upgrade to Flow v0.48.0
- Make some functions, such as `get`, curryable: if called with two arguments
  `get` works the same as before; if called with one argument it returns
  a partially-applied function

## v1.5.0

- Enhance `key` lens in es2015 module to track types of focused values
- Modify es2015 / `index` to permit type-broadening when setting
- Upgrade to Flow v0.23.1
- Split `Collection.Set` traverse implementation from `Collection.Indexed` implementation
