import fs from 'fs';
import path from 'path';
import { expect } from 'chai';
import { transformFileSync } from 'babel-core';

const skipArray = ['expression', 'iife'];

describe('Comparison operator chaining', () => {
  const fixtures = path.join(__dirname, 'fixtures');
  fs.readdirSync(fixtures).forEach(fixture => {
    if (!skipArray.includes(fixture)) {
      it(fixture, () => {
        const directory = path.join(fixtures, fixture);
        const actual = transformFileSync(path.join(directory, 'actual.js'), {
            babelrc: false,
            plugins: [path.resolve('./src/index.js')]
        }).code;
        const expected = fs.readFileSync(path.join(directory, 'expected.js')).toString();
        expect(actual.trim()).to.equals(expected.trim());
      })
    }
  });
});

// spies on early return statements in visitor