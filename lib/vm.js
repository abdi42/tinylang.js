var Generator = function(){
  this.source = "";
}

Generator.prototype.addClass = function(classAst){
  var source = ""
  source += "function " + className + "(" this.addParams(this.classAst.params) + ")"
}

Generator.prototype.addParams = function(params){
  var source = ""
  for(var i=0;i<params.length;i++){
    if(i == params.length-1)
      source += params[i]
    else
      source += params[i] + ','
  }
  return source;
}
