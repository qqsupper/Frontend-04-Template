//字符串找abcd



// 方法2
function match(str){
      let  foundA=false;
      let  foundB=false;
      let  foundC=false;

      for(let c of str){
         if(c === 'a'){
           foundA=true
         }
         else if(foundA && c === 'b'){
           foundB = true;
         }
         else if(foundB && c === 'c'){
           foundC = true;
         }
         else if(foundC && c === 'd'){
           return true
         }
         else{
           foundA = false;
           foundB = false;
           foundC = false;
         }
      }

      return false


}

console.log(match("I abcf"));