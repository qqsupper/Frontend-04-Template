
//处理 abcabx 字符串
function match(string){
    let state=start;
    for(let c of string){
      state=state(c);//每次更新状态

    }
    return state === end;
}

function start(c){
    if(c === 'a'){
      return foundA;
    }else{
      return start
    }
}

function foundA(c){
    if(c === 'b'){
      return foundB
    }else{
      return start(c)
    }
}

function foundB(c) {
  if (c === "c") {
    return foundC;
  } else {
    return start(c);
  }
}

function foundC(c) {
  if (c === "a") {
    return foundA2;
  } else {
    return start(c);
  }
}


function foundA2(c) {
  if (c === "b") {
    return foundB2;
  } else {
    return start(c);
  }
}

function foundB2(c) {
  if (c === "x") {
    return end; //这里是c或者 x 不是 x则返回 foundB 看下是不是c 是才进入foundC处理第二种重复状态a
  } else {
    return foundB(c);
  }
}


function end(c){
   return end;//结束状态
}


console.log(match("I ababcd"))