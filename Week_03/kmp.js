function kmp(source,pattern){
  //计算table
  let table=new Array(pattern.length).fill(0);

  {
     //pattern
    let i = 1,
      j = 0; //i是自重复开始的位置,j是已重复字数,如果i是0则所有都是自重复

    while (i < pattern.length) {
      if (pattern[i] === pattern[j]) {
        ++j, ++i;
        table[i] = j;
      } else {
        // 没有匹配上
        if (j > 0) {
          j = table[j]; //这时候table[i] 为0
        } else {
          //  table[i]=j;
          ++i; //没有匹配上向前走一步
        }
      }
    }
    console.log(table);
  }

  {
    // source匹配
    let i=0,j=0;

    while(i<source.length){
      
       if(pattern[i]===pattern[j]){
          ++i,++j;
       }else{
          if(j>0){
            j = table[j];
          }else{
            ++i
          }
       }

       if (j === pattern.length) {
         return true;
       }
    }

    // source结束
    return false
  }
 

}

// kmp('','abcdabce')  //0,0,0,0,0,1,2,3
// kmp("", "abcdabd"); //0,0,0,1,2,3,4
// kmp('','abababc')
// kmp('','aabaaac') //0,0,1,0,1,2,2

//  a a b a a a c

console.log(kmp("Hello","ll"))
