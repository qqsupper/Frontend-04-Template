//字符串找ab

function findChar(string,char){
  let str='';

  for(let i=0;i<string.length;i++){
    console.log(i)
     if(string[i]===char[0]){
        str+=string[i]+string[++i];
        if(str==char) {
          return true
        }else{
          str='';
          i--;
        }

     }
  }
  return false;

}

console.log(findChar('I ab hello','ab'));


// 方法2
function match(str){
      let  found=false;
      for(let c of str){
         if(c === 'a'){
           found=true
         }
         else if(found && c === 'b'){
            return true
         }
         else{
           found = false
         }
      }

      return false


}

console.log(match("I ab hello"));