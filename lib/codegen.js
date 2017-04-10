var CodeGen = function(ast){
  this.ast = ast;
  this.source = ""

  var source = this.generateCode();
  console.log("\n")
  eval(source)
  console.log("\n")
}

CodeGen.prototype.generateCode = function(){
  var source = "var inheritsFrom = function (child, parent){\n  child.prototype = Object.create(parent.prototype);\n  child.prototype.constructor = child;\n};\n"

  source += this.GenBlock(this.ast.nodes,0);
  return source
}

CodeGen.prototype.GenBlock = function(nodes,indentNum){
  var source = "";
  for(var i=0;i<nodes.length;i++){
    var node = nodes[i];

    switch(node.type){
      case "VariableDeclarator":
        source += "\n" + indent(this.GenAssignment(node),indentNum);
        break;
      case "FunctionDeclaration":
        source += "\n" + indent(this.GenFunction(node),indentNum);
        break;
      case "IfStatement":
        source += "\n" + indent(this.GenIfStatement(node),indentNum);
        break;
      case "BinaryExpression":
        source += "\n" + indent(this.GenBinaryExpression(node),indentNum)
        break;
      case "CallExpression":
        source += "\n" + indent(this.GenCallExpression(node),indentNum)
        break;
      case "ClassDeclaration":
        source += "\n"+ indent(this.GenClass(node),indentNum);
        break;
      case "ClassInstance":
        source += "\n" + indent(this.GenClassInstance(node),indentNum);
        break;
      case "LoopStatement":
        source += "\n" + indent(this.GenLoop(node),indentNum);
        break;
      case "ArrayExpression":
        source += "\n" + indent(this.GenArray(node),indentNum);
        break;
      case "ElseStatement":
        source += "\n" + indent(this.GenElseStatement(node),indentNum);
        break;
    }

  }

  return source;
}

CodeGen.prototype.GenArray = function(node){
  var source = "["
  for(var i=0;i<node.elements.length;i++){
    source += node.elements[i].val + " "
  }
  source += "]";

  return source;
}

CodeGen.prototype.GenClass = function(node){
  var methods = [];
  var others = [];

  for(var i=0;i<node.body.length;i++){
    var child = node.body[i];

    if(child.type == 'SubDeclaration'){
      methods.push(child);
    }
    else{
      if(child.id)
        if(child.id.val == "super"){
          child.id.val = node.parent.val + ".call";
          child.expression.params.unshift({
            type:'operator',
            val:","
          })
          child.expression.params.unshift({
            type:'identifier',
            val:"this"
          })
        }

      others.push(child)
    }
  }

  var source = "function " + node.id.val +"(" + this.GenParams(node.params) + "){" + this.GenBlock(node.body,1)+"\n}"

  if(node.parent)
    source += "\ninheritsFrom(" + node.id.val + "," + node.parent.val + ");"

  source += "\n" + this.GenSubs(methods,node.id.val);

  return source;
}

CodeGen.prototype.GenSubs = function(subs,className){
  var source = "";
  for(var i=0;i<subs.length;i++){
    var sub = subs[i];
    source += "\n" + className + ".prototype." + sub.id.val +" = function(" + this.GenParams(sub.params) + "){" + this.GenBlock(sub.body,1)+"\n}"
  }

  return source
}

CodeGen.prototype.GenLoop = function(node){
  return "while(" + this.GenBinaryExpression(node.test,true) + "){" + this.GenBlock(node.block,1) + "\n}";
}

CodeGen.prototype.GenFunction = function(node){
  return "function " + node.id.val +"(" + this.GenParams(node.params) + "){" + this.GenBlock(node.body,1)+"\n}";
}

CodeGen.prototype.GenAssignment = function(node){
  if(node.init.type == 'stringLiteral' ||  node.init.type == 'integerLiteral' ||  node.init.type == 'identifier' ){
    return 'var ' + node.id.name + " = " + node.init.val;
  }
  else{
    var source = ""
    if(node.init.type == 'BinaryExpression'){
      return 'var ' + node.id.name + " = " + this.GenBinaryExpression(node.init);
    }
    else{
      return 'var ' + node.id.name + " = " + this.GenArray(node.init);
    }

  }
}

CodeGen.prototype.GenClassInstance = function(node){
  return 'var ' + node.id.val + " = new " + node.class.val +"(" + this.GenParams(node.params) + ")";
}

CodeGen.prototype.GenIfStatement = function (node) {
  return  "if(" + this.GenBinaryExpression(node.test,true) + "){" + this.GenBlock(node.block,1) + "\n}";
};

CodeGen.prototype.GenBinaryExpression = function(node,ifstate){
  if(node.right.type == 'BinaryExpression'){
    return node.left.val + " " + node.operator.val + " " + this.GenBinaryExpression(node.right);
  }
  else{
    return node.left.val + " " + node.operator.val + " " + node.right.val;
  }
}

CodeGen.prototype.GenParams = function(params){
  var source = "";

  for(var i=0;i<params.length;i++){
    var param = params[i];
    source += param.val;
  }

  return source;
}

CodeGen.prototype.GenElseStatement = function(node){
  return  "else {" + this.GenBlock(node.block,1) + "\n}";
}

CodeGen.prototype.GenCallExpression = function(node){
  return node.id.val + "(" + this.GenParams(node.expression.params) + ")";
}

function indent(str, numOfIndents, opt_spacesPerIndent) {
  str = str.replace(/^(?=.)/gm, new Array(numOfIndents + 1).join('\t'));
  numOfIndents = new Array(opt_spacesPerIndent + 1 || 0).join(' '); // re-use
  return opt_spacesPerIndent
    ? str.replace(/^\t+/g, function(tabs) {
        return tabs.replace(/./g, numOfIndents);
    })
    : str;
}



module.exports = CodeGen
