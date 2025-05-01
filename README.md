@uiw/babel-plugin-add-import-extension
===
<!--rehype:style=display: flex; height: 230px; align-items: center; justify-content: center; font-size: 38px;-->

[![NPM version](https://img.shields.io/npm/v/@uiw/babel-plugin-add-import-extension.svg?style=flat)](https://npmjs.org/package/@uiw/babel-plugin-add-import-extension)
[![CI](https://github.com/uiwjs/babel-plugin-add-import-extension/actions/workflows/ci.yml/badge.svg)](https://github.com/uiwjs/babel-plugin-add-import-extension/actions/workflows/ci.yml)
[![Coverage Status](https://uiwjs.github.io/babel-plugin-add-import-extension/badges.svg)](https://uiwjs.github.io/babel-plugin-add-import-extension/lcov-report)
[![Downloadss](https://img.shields.io/npm/dm/@uiw/babel-plugin-add-import-extension.svg?style=flat)](https://npmjs.org/package/@uiw/babel-plugin-add-import-extension)
[![Repo Dependents](https://badgen.net/github/dependents-repo/uiwjs/babel-plugin-add-import-extension)](https://github.com/uiwjs/babel-plugin-add-import-extension/network/dependents)

A plugin to add extensions to import and export declarations, is very useful when you use Typescript with Babel and don't want to explicity import or export module with extensions.

> [!WARNING]
> 
> This is a fork of [babel-plugin-add-import-extension](https://www.npmjs.com/package/babel-plugin-add-import-extension), mainly used to add extensions when importing files in ESM packaging. If you are using an older webpack project, not all imported resources are `.js` files; they might be `.less`, `.css`, `.png`, or other files. Adding the `.js` extension directly would cause errors, so we need to add a parameter to ensure that resources that already have an extension won't have the `.js` extension added again.

## Usage

```bash
npm install @uiw/babel-plugin-add-import-extension --save-dev
```

Via `.babelrc` or `babel-loader`.

```json
{
  "plugins": [
    [
      "@uiw/babel-plugin-add-import-extension", {
        "extension": "js",
        "replace": true,
        "skipUnlistedExtensions": true,
        "observedScriptExtensions": ["js", "ts", "jsx", "tsx", "mjs", "cjs"]
      }
    ]
  ]
}
```

```json
{
  "plugins": [
    [
      "@uiw/babel-plugin-add-import-extension", {
        "extension": "js"
      }
    ]
  ]
}
```

```js
// Input Code
import './';
import './main';
import { Button } from 'uiw';
import { Select } from '@uiw/core';

// Output   ↓ ↓ ↓ ↓ ↓ ↓
import './index.js';
import './main.js';
import { Button } from 'uiw';
import { Select } from '@uiw/core';
```

Output Result

```diff
- import './';
- import './main';
+ import './index.js';
+ import './main.js';
import { Button } from 'uiw';
import { Select } from '@uiw/core';
```

## Options

### `replace`

* **Default:** `false`
* **Behavior:** By default, if a declaration file already has an extension, it is preserved. Extensions are added to declaration files that do not have one.

### `extension`

* **Default:** `js`
* **Behavior:** Appends the specified `.js` extension to `import` and `export` declarations.

### `skipUnlistedExtensions`

* **Default:** `false`
* **Behavior:** If set to `true` and a declaration file has an extension that is *not* included in the `observedScriptExtensions` list, the file will be skipped.

### `observedScriptExtensions`

* **Default:** `['js', 'ts', 'jsx', 'tsx', 'mjs', 'cjs']`
* **Behavior:** Declaration files with extensions present in this list are considered for extension replacement (based on the `replace` option). Files with extensions *not* in this list will have the `extension` option's value appended to them.

## Let's the transformation begin :)

A module import without extension:

```js
import { add, double } from "./lib/numbers";
```

will be converted to:

```js
import { add, double } from "./lib/numbers.js";
```

A module export without extension:

```js
export { add, double } from "./lib/numbers";
```

will be converted to:

```js
export { add, double } from "./lib/numbers.js";
```

If you add the `replace:true` option, extensions will be overwritten like so

```js
import { add, double } from "./lib/numbers.ts";
```

will be converted to:

```js
import { add, double } from "./lib/numbers.js";
```

and

```js
export { add, double } from "./lib/numbers.ts";
```

will be converted to:

```js
export { add, double } from "./lib/numbers.js";
```

What this plugin does is to check all imported modules and if your module is not on `node_module` it will consider that is a project/local module and add the choosed extension, so for node modules it don't add any extension.

## Contributors

As always, thanks to our amazing contributors!

<a href="https://github.com/uiwjs/babel-plugin-add-import-extension/graphs/contributors">
  <img src="https://uiwjs.github.io/babel-plugin-add-import-extension/CONTRIBUTORS.svg" />
</a>

Made with [github-action-contributors](https://github.com/jaywcjlove/github-action-contributors).

## License

[MIT](./LICENSE) © [`Kenny Wong`](https://github.com/jaywcjlove) & [`Karl Prieb`](https://codeberg.org/karl)
