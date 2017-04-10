var Lexer = function(input){
  var current = 0;
  this.tokens = [];
  this.str = input;
  this.indent = 0;

  while(this.str.length){
    current += 1;
    var tok = this.whiteSpace()||
                    this.newLine()    ||
                    this.identifier() ||
                    this.operator()   ||
                    this.integer()    ||
                    this.string()
    if(tok)
      this.tokens.push(tok)
  }

  this.tokens.push({type:"eos"});
  console.log(this.tokens)
  return this.tokens;
}

Lexer.prototype.identifier = function () {
  var match = /^[A-Za-z.]+/i.exec(this.str);

  if(match){
    this.str = this.str.substring(match[0].length);
    return {type:'identifier',val:match[0]};
  }
};

Lexer.prototype.whiteSpace = function(){
  if(this.str[0] == ' '){
    this.str = this.str.substring(1);
  }
}

Lexer.prototype.newLine = function(){
  var match = /^\n( *)/.exec(this.str);

  if(this.str[0] == '\n'){
    this.str = this.str.substring(match[0].length);
    var oldIndent = this.indent;
    this.indent = match[1].length;
    if(this.indent > oldIndent) {
      var prevTok = this.tokens[this.tokens.length-1].type
      if(prevTok == 'outdent'){
        this.tokens.pop()
      }
      else{
        return {type:'indent',val:this.indent};
      }
    }
    if(this.indent < oldIndent) return {type:'outdent',val:this.indent};
    return {type:'newline',indent:this.indent};
  }
}

Lexer.prototype.operator = function(){
  var match = /^[-+=<>:,()\[\]]|^[|]{2}|^[&]{2}/g.exec(this.str);

  if(match){
    this.str = this.str.substring(match[0].length);
    return {type:'operator',val:match[0]};
  }
}

Lexer.prototype.integer = function(){
  var match = /^[\d]+/i.exec(this.str);

  if(match){
    this.str = this.str.substring(match[0].length);
    return {type:'integerLiteral',val:match[0]};
  }
}

Lexer.prototype.string = function(){
  var match = /^'(?:[^'\\]|\\.)*'/.exec(this.str);

  if(match){
    this.str = this.str.substring(match[0].length);
    return {type:"stringLiteral",val:match[0]};
  }
}


module.exports = Lexer;
