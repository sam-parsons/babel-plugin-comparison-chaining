/**
 * 
 * @param {*} array
 * @param {*} types
 */
function generateExpressionStatement(array, types) {
  const endOfArray = generateEndOfArrayObject(array);
  const remainderExpression = array.slice(0, array.length - 2);

  return types.expressionStatement(types.logicalExpression(
    '&&', 
    generateLogicalExpression(remainderExpression, types), 
    types.binaryExpression(
      endOfArray.operator, 
      createLiteral(endOfArray.left, types), 
      createLiteral(endOfArray.right, types))
  ));
}

/**
 * 
 * @param {*} node 
 * @param {*} types 
 */
function createLiteral(node, types) {
  switch (typeof node) {
    case "string": return types.stringLiteral(node);
    case "number": return types.numericLiteral(node);
    default: return;
  }
}

/**
 * 
 * @param {*} array 
 * @param {*} types
 */
function generateLogicalExpression(array, types) {
  // detecting end of logical expression
  // transform last five elements into proper chaining
  if (array.length < 6) {
    return generateEndingLogicalExpression(array, types)
  }

  const endOfArray = generateEndOfArrayObject(array);
  const endingLogicalExpressionArray = array.slice(0, array.length - 2);

  return types.logicalExpression(
    '&&', 
    generateLogicalExpression(endingLogicalExpressionArray, types), 
    types.binaryExpression(
      endOfArray.operator, 
      createLiteral(endOfArray.left, types), 
      createLiteral(endOfArray.right, types)
    )
  );
}

/**
 * 
 * @param {*} array 
 * @param {*} types 
 */
function generateEndingLogicalExpression(array, types) {
  const endOfArray = generateEndOfArrayObject(array);

  return types.logicalExpression(
    "&&",
    generateEndingBinaryExpression(array, types),
    types.binaryExpression(
      endOfArray.operator, 
      createLiteral(endOfArray.left, types), 
      createLiteral(endOfArray.right, types)
    )
  )
}

/**
 * 
 * @param {*} array 
 * @param {*} t 
 */
function generateEndingBinaryExpression(array, types) {
  const operator = array[1];
  const left = array[0];
  const right = array[2];

  return types.binaryExpression(
    operator, 
    createLiteral(left, types), 
    createLiteral(right, types)
  );
}

function generateEndOfArrayObject(array) {
  const endOfArr = array.slice(array.length - 3);
  const operator = endOfArr[1];
  const left = endOfArr[0];
  const right = endOfArr[2];

  return {
    operator,
    left,
    right 
  }
}

/**
 * 
 * @param {*} node 
 * @param {*} array 
 */
function parseExpressionStatement(node, array) {
  return node.type === 'BinaryExpression' ?
    parseBinaryExpression(node, array) :
    parseNonBinaryExpression(node, array);
}

/**
 * 
 * @param {*} node
 * @param {*} array
 */
function parseNonBinaryExpression(node, array) {
  const nodeValue = node.value;
  array.push(nodeValue);
}

/**
 * 
 * @param {*} node
 * @param {*} array
 */
function parseBinaryExpression(node, array) {
  const rightValue = node.right.value;
  const operator = node.operator;
  
  // 
  array.push(rightValue);
  array.push(operator);

  // recursively handle rest of expression
  const leftNode = node.left;
  parseExpressionStatement(leftNode, array);
}

module.exports = ({ types }) => (
  {
    visitor: {
      ExpressionStatement(path) {
        // shortcircuit on unapplicable expressions
        if (path.node.expression.type !== 'BinaryExpression') return;
        if (path.node.expression.left.type !== 'BinaryExpression') return;

        // seeding array with first two value
        const array = [path.node.expression.right.value, path.node.expression.operator];

        // recursively parse remaining expression
        parseExpressionStatement(path.node.expression.left, array); 

        // elements now arranged in correct forward to back order
        array.reverse();

        // create replacement expression
        const replacementExpression = generateExpressionStatement(array, types);

        path.replaceWith(replacementExpression); 

        return;
      }
    }
  }
);