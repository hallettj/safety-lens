# Changelog

## v1.5.0

- Switch from fantasy-land to flow-static-land
- Move lenses for native JS types and for immutable to separate packages
- Upgrade to Flow v0.48.0
- Modify native / `index` to permit type-broadening when setting
- Make some functions, such as `get`, curryable: if called with two arguments
  `get` works the same as before; if called with one argument it returns
  a partially-applied function
