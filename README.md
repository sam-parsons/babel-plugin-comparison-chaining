# babel-plugin-comparison-chaining

description goes here

## Examples

```javascript
1 < 6 < 4 < 2;
```

Turn into

```javascript
1 < 6 && 6 < 4 && 4 < 2;
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