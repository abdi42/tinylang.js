var TokenStream = function(tokens){
  this.tokens = tokens;
  this.currIndex = -1;
}

TokenStream.prototype.next = function () {
  this.currIndex += 1;
  return this.getToken();
};

TokenStream.prototype.peek = function(){
  return this.tokens[this.currIndex + 1];
}

TokenStream.prototype.expectType = function(type){
  this.currIndex +=1
  if(this.tokens[this.currIndex].type == type){
    return this.tokens[this.currIndex];
  }
  else{
    throw new Error("Expected type " + type + ", Got " + this.tokens[this.currIndex].type)
  }
}

TokenStream.prototype.expectValue = function(value){
  this.currIndex +=1
  if(this.tokens[this.currIndex].val == value){
    return this.tokens[this.currIndex];
  }
  else{
    throw new Error("Expected type " + value + ", Got " + this.tokens[this.currIndex].value)
  }
}

TokenStream.prototype.getToken = function(){
  if(this.currIndex + 1 > this.tokens.length){
    return 'end'
  }
  else {
      return this.tokens[this.currIndex];
  }
}

module.exports = TokenStream;
