
   function UTF8_Encoding(string){
      let buffer=new Buffer(string.length);
       for(let i of string){
         // let char=i.charCodeAt(0).toString(2);
         buffer.write(i,2)
       }

       return buffer;
   }


   console.log(UTF8_Encoding('hello'));

