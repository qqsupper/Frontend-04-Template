
const EOF = Symbol("EOF"); // EOF: End of File

function data(c) { 
    if(c === '<'){
        return tagOpen;
    } else if(c === EOF){
        //结束返回
        return;
    } else {
        //返回数据
        return data;
    }

 }

module.exports.parseHTML = function parseHTML(html){ 
        let state = data;
        for(let c of html){
            state = state(c)
        }
        // 解析结束,设置一个唯一的终结符
        state = state(EOF);
}