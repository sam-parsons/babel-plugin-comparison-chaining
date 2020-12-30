# babel-plugin-comparison-chaining

Unlike the discipline of mathematics, JavaScript interpreters don't recognize chains of comparison operators as a linear sequence, but as recursive calls compare the right-most node and everything to the left of the operator.  If a developer wishes to write conditionally chained expressions that are linearly evaluated, this plugin is of use.

## Examples

JavaScript will recursively evaluate the right-most node compared against whatever is on the left.

```javascript
// written
1 < 6 < 4 < 2 < 7;

//evaluated
    1 < 6 < 4 < 2 < 7;
   (1 < 6 < 4 < 2) < 7 
  ((1 < 6 < 4) < 2) < 7;
 (((1 < 6) < 4) < 2) < 7;
((((1) < 6) < 4) < 2) < 7;
```

Written expression evaluated linearly

```javascript
1 < 6 && 6 < 4 && 4 < 2 && 2 < 7;
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
