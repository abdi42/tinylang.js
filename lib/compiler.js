var fs = require("fs");
var Lexer = require("./lexer.js");
var Parser = require("./parser.js");
var CodeGen = require("./codegen.js");

var compile = function(file){
  fs.readFile('example/sub.pl',"utf8",function(err,data){
    if(err) console.error(err)

    data = data.replace(/[\r\n]+/g, '\n')


    var tokens = new Lexer(data);
    var ast = new Parser(tokens);
    var code = new CodeGen(ast);

  })
}

compile("../app.pl")
