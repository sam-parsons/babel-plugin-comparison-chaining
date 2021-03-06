[npm]: https://img.shields.io/npm/v/babel-plugin-comparison-chaining
[npm-url]: https://www.npmjs.com/package/babel-plugin-comparison-chaining
[size]: https://packagephobia.now.sh/badge?p=babel-plugin-comparison-chaining
[size-url]: https://packagephobia.now.sh/result?p=babel-plugin-comparison-chaining

[![npm][npm]][npm-url]
[![size][size]][size-url]
[![libera manifesto](https://img.shields.io/badge/libera-manifesto-lightgrey.svg)](https://liberamanifesto.com)


# babel-plugin-comparison-chaining

JavaScript interpreters don't recognize chains of comparison operators as a linear sequence, but as recursive calls comparing the right-most node and everything to the left of the operator.  If a developer wishes to write chained comparison expressions that are linearly evaluated, this plugin is of use.

## Examples

JavaScript will recursively evaluate the right-most node compared against whatever is on the left.

```javascript
// written
1 < 6 < 4 < 2 < 7

//evaluated
   (1 < 6 < 4 < 2) < 7 
  ((1 < 6 < 4) < 2) < 7
 (((1 < 6) < 4) < 2) < 7

// edge case
1 < 2 < 3 < 2 // returns true


//evaluated
   (1 < 2 < 3) < 2
  ((1 < 2) < 3) < 2
    (true < 3) < 2 // true coerces to 1
         true < 2 // repeated coercion, returns true
         
```

Written expressions transformed into linear evaluation

```javascript
// written
1 < 6 < 4 < 2 < 7
// transformed
1 < 6 && 6 < 4 && 4 < 2 && 2 < 7

// edge case
// written
1 < 2 < 3 < 2
// transformed
1 < 2 && 2 < 3 && 3 < 2 // returns false
```

## Installation

```sh
$ npm install --save-dev babel-plugin-comparison-chaining
```

## Usage

### Via `.babelrc` (Recommended)

**.babelrc**

```json
{
  "plugins": ["comparison-chaining"]
}
```

### Via CLI

```sh
$ babel --plugins comparison-chaining script.js
```

### Via Node API

```javascript
require('babel-core').transform('code', {
  plugins: ['comparison-chaining']
});
```

# License

MIT
