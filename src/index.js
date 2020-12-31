/**
 * 
 * @param {*} array
 * @param {*} types
 */
function generateExpressionStatement(array, types) {
  const endOfArr = array.slice(array.length - 3);
  const binaryOperator = endOfArr[1];
  const leftValue = endOfArr[0];
  const rightValue = endOfArr[2];
  const remainderExpression = array.slice(0, array.length - 2);

  return types.expressionStatement(types.logicalExpression(
    '&&', 
    generateLogicalExpression(remainderExpression, types), 
    types.binaryExpression(binaryOperator, 
      createLiteral(leftValue, types), 
      createLiteral(rightValue, types))
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
  const endOfArr = array.slice(array.length - 3);
  const operator = endOfArr[1];
  const left = endOfArr[0];
  const right = endOfArr[2];
  const endingLogicalExpressionArray = array.slice(0, array.length - 2);

  return types.logicalExpression(
    '&&', 
    array.length < 6 ? // detecting end of logical expression
      // transform last five elements into proper chaining
      generateEndingBinaryExpression(array, types) : 
      generateLogicalExpression(endingLogicalExpressionArray, types), 
    types.binaryExpression(
      operator, 
      createLiteral(left, types), 
      createLiteral(right, types)
    )
  );
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

/**
 * 
 * @param {*} node 
 * @param {*} array 
 */
function parseExpressionStatement(node, array) {
  if (node.type === 'BinaryExpression') {
    const rightValue = node.right.value;
    const operator = node.operator;
    const leftNode = node.left;

    array.push(rightValue);
    array.push(operator);
    parseExpressionStatement(leftNode, array);
  } else  {
    const nodeValue = node.value;

    array.push(nodeValue);
  }
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