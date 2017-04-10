function traverser(ast, visitor) {

  function traverseArray(array, parent) {
    array.forEach(function(child) {
      traverseNode(child, parent);
    });
  }

  function traverseNode(node, parent) {

    var method = visitor[node.type];

    if (method) {
      method(node, parent);
    }

    switch (node.type) {
      case 'SubDeclaration':
        traverseArray(node.body, node);
        break;
      case 'ClassDeclaration':
        traverseArray(node.params, node);
        break;
      case 'Let':
        break;
      case "BinaryExpression",
        break;
      case 'stringLiteral',
        break;
      case 'integerLiteral'
        break;
      default:
        throw new TypeError(node.type);
    }

  }

  traverseNode(ast, null);
}
