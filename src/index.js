/**
 * 
 * @param {*} t 
 * @param {*} array 
 */ // need to switch around parameters to conform to args, ..., types format
function generateExpressionStatement(t, array) {
  const endOfArr = array.slice(array.length - 3);
  const binaryOperator = endOfArr[1];
  const leftValue = endOfArr[0];
  const rightValue = endOfArr[2];
  const remainderExpression = array.slice(0, array.length - 2);

  return t.expressionStatement(t.logicalExpression(
    '&&', 
    generateLogicalExpression(t, remainderExpression), 
    t.binaryExpression(binaryOperator, 
      createLiteral(leftValue, t), 
      createLiteral(rightValue, t))
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
 * @param {*} t 
 * @param {*} array 
 */
function generateLogicalExpression(t, array) {
  const endOfArr = array.slice(array.length - 3);
  const endingLogicalExpressionArray = array.slice(0, array.length - 2);

  return t.logicalExpression(
    '&&', 
    array.length < 6 ? // detecting end of logical expression
      // transform last five elements into proper chaining
      generateEndingBinaryExpression(array, t) : 
      generateLogicalExpression(t, endingLogicalExpressionArray), 
    t.binaryExpression(
      endOfArr[1], 
      createLiteral(endOfArr[0], t), 
      createLiteral(endOfArr[2], t)
    )
  );
}

/**
 * 
 * @param {*} array 
 * @param {*} t 
 */
function generateEndingBinaryExpression(array, t) {
  return t.binaryExpression(
    array[1], 
    createLiteral(array[0], t), 
    createLiteral(array[2], t)
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
        const replacementExpression = generateExpressionStatement(t, array);

        path.replaceWith(replacementExpression); 

        return;
      }
    }
  }
);