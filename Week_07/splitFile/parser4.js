
const EOF = Symbol("EOF"); // EOF: End of File

let currentToken = null;

function emit(token){
    console.log(token)
}

function data(c) { 
    if(c === '<'){
        return tagOpen;
    } else if(c === EOF){
        //结束返回
        emit({
            type:"EOF"
        })
        return;
    } else {
        //返回data 方法处理
        emit({
            type:"text",
            content:c
        });

        return data;
    }

 }

function tagOpen(c) { 
     if(c === '/'){
        //  例子 </div>
         return endTagOpen;
     } else if(c.match(/^[a-zA-Z]$/)){
        currentToken = {
            type: "startTag",
            tagName: ''
        }
         return tagName(c);
     } else {
         return;
     }
 }

 function endTagOpen(c) {
     if(c.match(/^[a-zA-Z]$/)){
        currentToken = {
            type:"endTag",
            tagName: ''
        }
        return tagName(c)
     } else if(c === '>'){
        //在tagName里面处理 '>',如果这里出现报错
     }else if(c === EOF){
        //报错
     } else {

     }
   }

function tagName(c){
    if(c.match(/^[\t\n\f ]$/)){
        // 检测各种制表符和空格 后属性名
        return beforeAttributeName;
    }else if(c.match(/^[a-zA-Z]$/)){
        currentToken.tagName += c;
        return tagName;
    } else if(c === '/'){
        return selfClosingStartTag;
    } else if(c === '>'){
        //开始读取下一个标签
        emit(currentToken)
        return data;
    } else {
        return tagName;
    }
}

function beforeAttributeName(c){
    if(c.match(/^[\t\n\f ]$/)){
        return beforeAttributeName;
    } else if(c === '>'){
        return data;
    } else if(c === '='){
        return beforeAttributeName;
    } else {
        return beforeAttributeName;
    }
}

function selfClosingStartTag(c) { 
     if(c === '>'){
         currentToken.isSelfClosing = true;
         return data;
     } else if (c === 'EOF'){
        //  报错
     } else {

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