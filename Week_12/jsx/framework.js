export function createElement(type, attributes, ...children){
    let element;
    if(typeof type === 'string'){
       element = new ElementWrapper(type);
    }else{
        element = new type;
    }
    
    //设置属性
    for(let name in attributes ){
        element.setAttribute(name, attributes[name])
    };

    // 设置子元素
    for (let child of children){
        if(typeof child === 'string'){
            child = new TextWrapper(child);
        }
        element.appendChild(child)
    }

    
    return element;
}



// 组件
export class Component{
    constructor(type){
        // this.root = this.render(type)
    }
    setAttribute(name,value){
        this.root.setAttribute(name,value)
    }
    appendChild(child){
        child.mountTo(this.root);
    }
    mountTo(parent){
        parent.appendChild(this.root);

    }
}



/**
 * @description: 针对元素类型
 * @param {*}
 * @return {*}
 */
class ElementWrapper extends Component{
    constructor(type){
        super(type)
    }
    render(type){
       return document.createElement(type);
    }
   
}


/**
 * @description: 针对text类型
 * @param {*}
 * @return {*}
 */
class TextWrapper extends Component{
    constructor(content){
        super(content)
    }
    render(content){
       return document.createTextNode(content);
    }
 
}
