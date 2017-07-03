/*
 * Declarations for global variables that mocha creates.
 * This lets us use Flow to type-check tests.
 */

declare function describe(descr: string, body: Function): void;
declare function it(descr: string, test: Function): void;
