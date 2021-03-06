
const EOF = Symbol("EOF"); // EOF: End of File

let currentToken = null;

let currentAttribute = null;

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

// 处理属性

function beforeAttributeName(c){
    if(c.match(/^[\t\n\f ]$/)){
        return beforeAttributeName;
    } else if(c === '/' || c === '>' || c === EOF){
        return  afterAttributeName(c);
    } else if(c === '='){

    } else {
        currentAttribute ={
            name:'',
            value:''
        }

        return attributeName(c);
    }
}


// 处理属性Key
// <div class='name' ></div>
function attributeName(c){
    if(c.match(/^[\t\n\f ]$/) || c == '/' || c == '>' || c == EOF){
        return afterAttributeName(c);
    }else if(c == '='){
        return beforeAttributeValue
    }else if(c == '\u0000'){

    }else if(c == '\"' || c == "'" || c == "<"){

    }else{
         currentAttribute.name += c;
         return attributeName

    }
}

// 处理属性value 判断单引号或双引号
function beforeAttributeValue(c){
    if(c.match(/^[\t\n\f ]$/) || c == "/" || c == ">" || c == EOF){
        return beforeAttributeValue;
    }else if (c == "\""){
        return doubleQuotedAttributeValue;
    }else if (c == "\'"){
        return singleQuotedAttributeValue;
    }else if (c == ">"){

    }else{
        return UnquotedAttributeValue(c)
    }
}


// 处理双引号
function doubleQuotedAttributeValue(c){
    if(c == "\""){
         currentToken[currentAttribute.name] = currentAttribute.value;
    }else if (c == "\u0000"){
        // 空格处理
    }else if (c == EOF){

    }else{
        currentAttribute.value += c;
        return doubleQuotedAttributeValue
    }
}

// 处理单引号
function singleQuotedAttributeValue(c){
    if(c == "\""){
         currentToken[currentAttribute.name] = currentAttribute.value;
    }else if (c == "\u0000"){
        // 空格处理
    }else if (c == EOF){

    }else{
        currentAttribute.value += c;
        return singleQuotedAttributeValue
    }
}


//处理空白符
function UnquotedAttributeValue(c){
     if(c.match(/^[\t\n\f ]$/)){
         currentToken[currentAttribute.name] = currentAttribute.value;
         return beforeAttributeName;
     }else if (c == "/"){
         currentToken[currentAttribute.name] = currentAttribute.value;
         return selfClosingStartTag;
     }else if (c == ">"){
         currentToken[currentAttribute.name] = currentAttribute.value;
         emit(currentToken);
         return data;
     }else if(c == "\u0000"){

     }else if(c == "\”" || c == "'" || c == "<" || c == "=" || c == "`" ){

     }else if(c == EOF){

     }else{
         currentAttribute.value += c;
         return UnquotedAttributeValue;
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