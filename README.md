# vue-tsc-files

A tiny tool to run `vue-tsc` on specific files without ignoring `tsconfig.json`.

Ported from [tsc-files](https://github.com/gustavopch/tsc-files).

## Installation

```sh
npm i -D @itoxiq/vue-tsc-files
```

```sh
yarn add -D @itoxiq/vue-tsc-files
```

## Why

I wanted to type-check **only the staged files** with [lint-staged](https://github.com/okonet/lint-staged).

## Usage

With lint-staged:

```json
{
  "lint-staged": {
    "**/*.{vue,ts,tsx}": "vue-tsc-files"
  }
}
```

## Sidenotes

Flag "--noEmit" is always passed to underlying `vue-tsc` by default.

`vue-tsc-files` passes module declarations and namespaces from `d.ts` files to `vue-tsc`, so please make sure that needed declarations are inside `d.ts` files.

```javascript
// example.d.ts
declare module "@vue/runtime-core" {
  interface ComponentCustomProperties {
    $custom: MyCustomType;
  }
}
```

## License

Released under the [MIT License](./LICENSE.md).
