function generateExpressionStatement(t, array) {
  const endOfArr = array.slice(array.length - 3);

  return t.expressionStatement(t.logicalExpression(
    '&&', 
    generateLogicalExpression(t, array.slice(0, array.length - 2)), 
    t.binaryExpression(endOfArr[1], 
      createLiteral(endOfArr[0], t), 
      createLiteral(endOfArr[2], t))
  ));
}

function createLiteral(node, types) {
  switch (typeof node) {
    case "string": return types.stringLiteral(node);
    case "number": return types.numericLiteral(node);
    default: return;
  }
}

// need to refactor and comment
function generateLogicalExpression(t, array) {
  const endOfArr = array.slice(array.length - 3);

  if (array.length < 6) return t.logicalExpression(
    '&&', 
    t.binaryExpression(array[array.length - 4], 
      createLiteral(array[array.length - 5], t), 
      createLiteral(array[array.length - 3], t)), 
    t.binaryExpression(array[array.length - 2], 
      createLiteral(array[array.length - 3], t), 
      createLiteral(array[array.length - 1], t)))

  return t.logicalExpression(
    '&&', 
    generateLogicalExpression(t, array.slice(0, array.length - 2)), 
    t.binaryExpression(endOfArr[1], 
    createLiteral(endOfArr[0], t), 
    createLiteral(endOfArr[2], t))
  );
}

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

        //
        const array = [path.node.expression.right.value, path.node.expression.operator];

        //
        parseExpressionStatement(path.node.expression.left, array); 

        //
        array.reverse();

        //
        const newAST = generateExpressionStatement(t, array);

        path.replaceWith(newAST); 

        return;
      }
    }
  }
);