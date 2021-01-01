/**
 * entry point to replacement process for exported module
 *  
 * @param {*} array
 * @param {*} types
 */
function generateReplacementExpression(array, types) {
  const endOfArray = generateEndOfArrayObject(array);
  const remainderExpression = array.slice(0, array.length - 2);

  return types.expressionStatement(types.logicalExpression(
    '&&', 
    generateLogicalExpression(remainderExpression, types), 
    types.binaryExpression(
      endOfArray.operator, 
      createLiteral(endOfArray.left, types), 
      createLiteral(endOfArray.right, types))
    )
  );
}

/**
 * generate logical expression in reverse direction
 * 
 * ex.
 *  {       recursive call       } && 1 < 2
 *  {  recursive call   } && 3 < 1 && 1 < 2
 *  {   ...    } && 2 < 3 && 3 < 1 && 1 < 2
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
 * handle ending logical sequence
 * kicks off generateEndingBinaryExpression
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
 * creates final binary expression in the replacement generation
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
 * helper function for binary expression values
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
 * helper function - generates object from part of expression currently worked on
 * 
 * @param {*} array 
 */
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
        if (
          path.node.expression.type !== 'BinaryExpression' || 
          path.node.expression.left.type !== 'BinaryExpression'
        ) return;

        // seeding array with first two value
        const array = [path.node.expression.right.value, path.node.expression.operator];

        // recursively parse remaining expression
        parseExpressionStatement(path.node.expression.left, array); 

        // elements now arranged in correct forward to back order
        array.reverse();

        // create replacement expression
        const replacementExpression = generateReplacementExpression(array, types);

        path.replaceWith(replacementExpression); 

        return;
      }
    }
  }
);