function parseExpressionStatement(node, array) {
  if (node.type === 'BinaryExpression') {
    array.push(node.right.value);
    array.push(node.operator);
    parseExpressionStatement(node.left, array);
  } else if (node.type === 'NumericLiteral') {
    array.push(node.value);
  } else return;  
}

function generateExpressionStatement(t, array) {
  const endOfArr = array.slice(array.length - 3);

  return t.expressionStatement(t.logicalExpression('&&', 
          generateLogicalExpression(t, array.slice(0, array.length - 2)), 
          t.binaryExpression(endOfArr[1], 
              t.numericLiteral(endOfArr[0]), 
              t.numericLiteral(endOfArr[2]))
        ));
}

function generateLogicalExpression(t, array) {
  const endOfArr = array.slice(array.length - 3);

  if (array.length < 6) return t.logicalExpression('&&', 
                                    t.binaryExpression(array[array.length - 4], 
                                      t.numericLiteral(array[array.length - 5]), 
                                      t.numericLiteral(array[array.length - 3])), 
                                    t.binaryExpression(array[array.length - 2], 
                                      t.numericLiteral(array[array.length - 3]), 
                                      t.numericLiteral(array[array.length - 1])))

  return t.logicalExpression('&&', 
                  generateLogicalExpression(t, array.slice(0, array.length - 2)), 
                  t.binaryExpression(endOfArr[1], 
                    t.numericLiteral(endOfArr[0]), 
                    t.numericLiteral(endOfArr[2])))
}


module.exports = ({ types: t }) => ({
  // return {
    visitor: {
      ExpressionStatement(path) {
        // also check if left side of binary expression is not equal to a binary express
        if (path.node.expression.type !== 'BinaryExpression') return;

        const array = [];
        
        if (path.node.expression.type === 'BinaryExpression') {
          array.push(path.node.expression.right.value);
          array.push(path.node.expression.operator);
          parseExpressionStatement(path.node.expression.left, array);
        }  

        array.reverse();

        const newAST = generateExpressionStatement(t, array);

        path.replaceWith(newAST); 

        return;
      }
    }
  // };
});