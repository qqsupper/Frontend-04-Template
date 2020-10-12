function findChar(string,char){
  for(let c of string){
     if(c===char) return true;
  }

  return false;

}

console.log(findChar('I am hello','a'));