# vue-tsc-files

A tiny tool to run `vue-tsc` on specific files without ignoring `tsconfig.json`.

Ported from [tsc-files](https://github.com/gustavopch/tsc-files).

## Installation

```sh
npm i -D itoxiq/vue-tsc-files
```

```sh
yarn add -D itoxiq/vue-tsc-files
```

## Why

I wanted to type-check **only the staged files** with [lint-staged](https://github.com/okonet/lint-staged).

## Usage

With lint-staged:

```json
{
  "lint-staged": {
    "**/*.{vue,ts}": "vue-tsc-files"
  }
}
```

Flag "--noEmit" is always passed to `vue-tsc` by default.

## License

Released under the [MIT License](./LICENSE.md).
