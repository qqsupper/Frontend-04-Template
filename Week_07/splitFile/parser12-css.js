const css = require("css");
const EOF = Symbol("EOF"); // EOF: End of File

let currentToken = null;

let currentAttribute = null;

let currentTextNode = null;

let stack = [{type: 'document', children: []}];


//加入新函数addCSSRules, 把css规则暂存在一个数组里面
let rules = [];
function addCSSRules(text){
    var ast = css.parse(text);
    console.log(JSON.stringify(ast,null, "  "));
    rules.push(...ast.stylesheet.rules);
}



// 判断css和element匹配
// 用简单选择器进行匹配
// .a 
// #a
// div 
function match(element,selector){   
    //如果没有选择器或者元素是文本节点，则不走下一步
    if(!selector || !element.attributes){
        return false
    }

    if(selector.charAt(0) == '#'){
        var attr = element.attributes.filter(attr => attr.name === 'id' )[0];
        if(attr && attr.value === selector.replace("#",'')){
            return true;
        }
    }else if(selector.charAt(0) == '.'){
        var attr = element.attributes.filter(attr => attr.name === 'class')[0];
        if(attr && attr.value === selector.replace(".",'')){
            return true;
        }
    }else{
        if(element.tagName === selector){
            return true;
        }
    }

    return false
    
}

// css计算
function computeCSS(element){
    //  console.log(rules);
    //  console.log('compute CSS for Element',element);

    var elements = stack.slice().reverse(); //因为stack会动态变化，因此将当前栈进行复制;reverse是因为是会从当前元素开始匹配，逐级找到他的父元素

    if(!element.computedStyle){
        element.computedStyle = {}
    }

    for (let rule of rules){
        var selectorParts = rule.selectors[0].split(" ").reverse();

        if(!match(element,selectorParts[0])){ //当前元素和css当前选择器不同，跳过
            continue;
        }

        let matched = false;

        var j =1; //选择器的位置
        for(var i = 0; i < elements.length; i++){
            if(match(elements[i],selectorParts[j])){
                j++;
            }

            if(j >= selectorParts.length)
                matched = true;

            if(matched){
                //  如何匹配到，我们要加入
                console.log("Element",element,"matched rule",rule);
            }
        }
    }
    
}

function emit(token){

    //栈顶
    let top = stack[stack.length -1];

    // 入栈操作
    if(token.type === 'startTag'){
        let element = {
             type: 'element',
             children: [],
             attributes: []
        }

        element.tagName = token.tagName;

        //将所有属性放进attributes里面
        for(let p in token){
            if(p != 'type' && p != 'tagName'){
                element.attributes.push({
                    name: p,
                    value: token[p]
                })
            }
        }

        //添加css调用
        computeCSS(element);

        //对偶的操作
        top.children.push(element);
        element.parent = top;

        //判断是否自封闭
        if(!token.isSelfClosing)
            stack.push(element);
        
        currentTextNode = null;
    }else if(token.type === 'endTag'){
        //判断结束标签与开始标签是否一致
        if(top.tagName != token.tagName){
            throw new Error('Tag start end doesn`t match!')
        } else {
            //++++++++++ 遇到style标签,执行css规则的操作 ++++++++++//
            if(top.tagName === 'style'){
                addCSSRules(top.children[0].content);//css内容
            }
            stack.pop();
        }
        currentTextNode = null;
    }else if(token.type == "text"){
        // 在开始标签startTag 和 结束标签endTag都需要把文本Node清空
        if(currentTextNode == null){
             currentTextNode ={
                 type:"text",
                 content:""
             }
           top.children.push(currentTextNode);
        }
        currentTextNode.content += token.content;

    }
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

    }else if(c == "'" || c == "'" || c == "<"){

    }else{
         currentAttribute.name += c;
         return attributeName

    }
}

// 处理属性value 判断单引号或双引号
function beforeAttributeValue(c){
    if(c.match(/^[\t\n\f ]$/) || c == "/" || c == ">" || c == EOF){
        return beforeAttributeValue;
    }else if (c == '"'){
        return doubleQuotedAttributeValue;
    }else if (c == "'"){
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
         return afterQuotedAttributeValue;
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
    if(c == "\'"){
         currentToken[currentAttribute.name] = currentAttribute.value;
         return afterQuotedAttributeValue;
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

     }else if(c == "\"" || c == "'" || c == "<" || c == "=" || c == "`" ){

     }else if(c == EOF){

     }else{
         currentAttribute.value += c;
         return UnquotedAttributeValue;
     }
}

/**
 * 处理完引号之后
 * @param {*} c 
 */
function afterQuotedAttributeValue(c){
    if(c.match(/^[\t\n\f ]$/)){
        return beforeAttributeName;
    }else if(c === '/'){
         return selfClosingStartTag;
    }else if(c === '>'){
        currentToken[currentAttribute.name] = currentAttribute.value;
        emit(currentToken);
        return data;
    }else if(c === EOF){

    }else {
        currentAttribute.value +=c;
        return afterQuotedAttributeValue;
    }
}

/**
 * 属性名称结束
 * @param {*} c 
 */

 function afterAttributeName(c){
    if(c.match(/^[\t\n\f ]$/)){
        return afterAttributeName; 
    }else if (c === '/'){
        return selfClosingStartTag;
    }else if(c === '>'){
         currentToken[currentAttribute.name] = currentAttribute.value;
         emit(currentToken);
         return data;
    }else if(c === EOF){

    }else{
        currentToken[currentToken.name] = currentAttribute.value;
        currentAttribute ={
            name: '',
            value: ''
        };
        return afterAttributeName(c);
    }
 }



/**
 * 自封闭标签
 * @param {*} c 
 */

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
        return stack[0];
}