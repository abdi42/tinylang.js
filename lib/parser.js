var TokenStream = require("./tokenStream.js");
var prettyjson = require('prettyjson');

var Parser = function(tokens){
  this.tokens = new TokenStream(tokens);
  return {
    type:"Program",
    nodes:this.ParseFile()
  }
}


Parser.prototype.parseArrayAssignment = function(){
  var expression = {
    type:"ArrayExpression",
    elements:[]
  }

  while(this.tokens.peek().val != ']'){
    var tok = this.tokens.next();
    if(tok.type === 'integerLiteral'  || tok.type === 'stringLiteral' || tok.val === ',' ){
      expression.elements.push(tok);
    }
  }

  this.tokens.expectType("operator")

  return expression;
}

Parser.prototype.ParseFile = function(){
  var nodes = [];
  while(this.tokens.peek().type != 'eos'){
    if(this.tokens.peek().type != 'newline'){
      nodes.push(this.parseToken());
    }
    else{
      this.tokens.next()
    }
  }
  console.log(prettyjson.render(nodes))
  return nodes;
}

Parser.prototype.parseToken = function(){
  var tok = this.tokens.next();
  var body = null;
  switch(tok.val){
    case 'let':
      return this.parseAssignment()
    case 'func':
      return this.parseFunction();
    case 'if':
      return this.parseIfStatement();
    case 'else':
      return this.parseElseStatement()
    case 'class':
      return this.ParseClass();
    case 'sub':
      return this.parseSub()
    case 'loopUntil':
      return this.parseLoop()
    default:
      var binary = this.parseBinary(tok)
      return binary
  }

}

Parser.prototype.parseBinary = function(_left){

  while(this.tokens.peek().type == "integerLiteral" || this.tokens.peek().type == "stringLiteral" || this.tokens.peek().type == "operator"){
      var op = this.tokens.next();

      if(op.val == '('){
        return { type: 'CallExpression' , id:_left,expression:this.parseCallExpression(_left,op)}
      }
      else{

        if(this.tokens.peek().type == "operator" && this.tokens.val != "," && this.tokens.val != "(" && this.tokens.val != ")"){
          op.val += this.tokens.next().val;
        }

        return {
          type:"BinaryExpression",
          left:_left,
          operator:op,
          right:this.parseBinary(this.tokens.next())
        }
      }
  }

  return {
    type:_left.type,
    val:_left.val,
  }

}

Parser.prototype.parseAssignment = function(){
  var variableName = this.tokens.expectType("identifier");
  var variableOperator =  this.tokens.expectValue('=')
  if(this.tokens.peek().type == "identifier" || this.tokens.peek().type == 'stringLiteral' || this.tokens.peek().type == 'integerLiteral'){
    if (this.tokens.peek().val == 'new'){
      this.tokens.next()
      return this.parseNew(variableName)
    }
    else
      var varaibleValue = this.parseBinary(this.tokens.next());
  }
  else if(this.tokens.peek().val == '['){
    this.tokens.next()
    var varaibleValue = this.parseArrayAssignment();
  }
  else
    throw new Error("Unexpected " + this.tokens.next().type);

  var declaration = {
    type:'VariableDeclarator',
    id:{
      name:variableName.val,
      type:variableName.type
    },
    init:varaibleValue
  }

  return declaration;
}

Parser.prototype.parseLoop = function(){
  var loopstatement = {
    type:"LoopStatement",
    test:this.parseBinary(this.tokens.next()),
    block:this.parseBlock()
  }

  return loopstatement;
}



Parser.prototype.ParseClass = function(){
  var className = this.tokens.expectType('identifier');
  var classParams = [];
  var ClassDeclaration = {
    type:'ClassDeclaration',
    id:className,
  }


  if(this.tokens.next().val == 'extends'){
    ClassDeclaration.parent = this.tokens.next();
  }

  while(this.tokens.peek().val != ')'){
    var tok = this.tokens.next();
    if(tok.type === 'identifier' || tok.val === ',' ){
      classParams.push(tok);
    }
  }

  this.tokens.expectValue(')');
  ClassDeclaration.body = this.parseBlock();
  ClassDeclaration.params = classParams;

  return ClassDeclaration

}

Parser.prototype.parseFunction = function(){

  var functionName = this.tokens.expectType("identifier");
  var functionParams = [];
  var FunctionDeclaration = {
    type:'FunctionDeclaration',
    id:functionName,
  }
  while(this.tokens.peek().val != ')'){
    var tok = this.tokens.next();
    if(tok.type === 'identifier' || tok.val === ","){
      functionParams.push(tok);
    }
  }

  this.tokens.expectValue(')');
  FunctionDeclaration.body = this.parseBlock();
  FunctionDeclaration.params = functionParams;

  return FunctionDeclaration
}

Parser.prototype.parseSub = function(){

  var subName = this.tokens.expectType("identifier");
  var subParams = [];
  var SubDeclaration = {
    type:'SubDeclaration',
    id:subName,
  }

  while(this.tokens.peek().val != ')'){
    var tok = this.tokens.next();
    if(tok.type === 'identifier'){
      subParams.push(tok);
    }
  }
  this.tokens.expectValue(')');
  SubDeclaration.body = this.parseBlock();
  SubDeclaration.params = subParams;

  return SubDeclaration
}


Parser.prototype.parseNew = function(val){

  var classInstance = {
    type:"ClassInstance",
    class:this.tokens.expectType('identifier'),
    id:val,
    params:[]
  }

  this.tokens.next();

  while(this.tokens.peek().val != ')'){
    var tok = this.tokens.next();
    if(tok.type === 'identifier' || tok.type === 'integerLiteral' || tok.type === 'stringLiteral' || tok.type == 'operator'){
      classInstance.params.push(tok);
    }
  }

  this.tokens.expectValue(')');

  return classInstance;

}


Parser.prototype.parseBlock = function(){
  while(this.tokens.peek().type != 'indent'){
    this.tokens.next();
  }

  var indent = this.tokens.expectType('indent').val;
  var eos = false;
  var nodes = [];

  while(this.tokens.peek().type !== 'outdent'){
    if(this.tokens.peek().type === 'identifier'){
      nodes.push(this.parseToken());
    }
    else if(this.tokens.peek().type == 'eos') {
      eos = true;
      break;
    }
    else{
      this.tokens.next()
    }
  }


  if(!eos){
    if(this.tokens.peek().val  == indent - 2 ){
      this.tokens.expectType('outdent');
    }
  }

  return nodes;

}

Parser.prototype.parseCallExpression = function(){
  var param = [];
  while(this.tokens.peek().val != ')'){
    var tok = this.tokens.next();
    if(tok.type === 'identifier' || tok.type === 'integerLiteral' || tok.type === 'stringLiteral' || tok.type == 'operator'){
      param.push(tok);
    }
  }
  this.tokens.expectValue(')');

  return {params:param};
}

Parser.prototype.parseIfStatement = function(){
  return { type:'IfStatement',test:this.parseBinary(this.tokens.next()),block:this.parseBlock()}

}

Parser.prototype.parseElseStatement = function(){
  return {type:'ElseStatement',block:this.parseBlock()};
}

module.exports = Parser;
