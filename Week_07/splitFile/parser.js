
const EOF = Symbol("EOF"); // EOF: End of File

function data(c) { 
  
 }

module.exports.parseHTML = function parseHTML(html){ 
        let state = data;
        for(let c of html){
            state = state(c)
        }
        // 解析结束,设置一个唯一的终结符
        state = state(EOF);
}