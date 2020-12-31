/**
 * 
 * @param {*} array
 * @param {*} types
 */ // need to switch around parameters to conform to args, ..., types format
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

// need to refactor and comment
/**
 * 
 * @param {*} array 
 * @param {*} types
 */
function generateLogicalExpression(array, types) {
  const endOfArr = array.slice(array.length - 3);
  const endingLogicalExpressionArray = array.slice(0, array.length - 2);

  return types.logicalExpression(
    '&&', 
    array.length < 6 ? // detecting end of logical expression
      // transform last five elements into proper chaining
      generateEndingBinaryExpression(array, types) : 
      generateLogicalExpression(endingLogicalExpressionArray, types), 
    types.binaryExpression(
      endOfArr[1], 
      createLiteral(endOfArr[0], types), 
      createLiteral(endOfArr[2], types)
    )
  );
}

/**
 * 
 * @param {*} array 
 * @param {*} t 
 */
function generateEndingBinaryExpression(array, types) {
  return types.binaryExpression(
    array[1], 
    createLiteral(array[0], types), 
    createLiteral(array[2], types)
  );
}

/**
 * 
 * @param {*} node 
 * @param {*} array 
 */
function parseExpressionStatement(node, array) {
  if (node.type === 'BinaryExpression') {
    array.push(node.right.value);
    array.push(node.operator);
    parseExpressionStatement(node.left, array);
  } else  { // need to make this line generalized
    array.push(node.value);
  }
}

module.exports = ({ types: t }) => (
  {
    visitor: {
      ExpressionStatement(path) {
        // also check if left side of binary expression is not equal to a binary express
        if (path.node.expression.type !== 'BinaryExpression') return;
        if (path.node.expression.left.type !== 'BinaryExpression') return;

        // seeding array with first two value
        const array = [path.node.expression.right.value, path.node.expression.operator];

        // recursively parse remaining expression
        parseExpressionStatement(path.node.expression.left, array); 

        // elements now arranged in correct forward to back order
        array.reverse();

        // create replacement expression
        const replacementExpression = generateExpressionStatement(array, t);

        path.replaceWith(replacementExpression); 

        return;
      }
    }
  }
);