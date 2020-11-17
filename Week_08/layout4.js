
// 获取元素属性
function getStyle(element){
    if(!element.style){
        element.style = {};
    }
       
    
    for(let prop in element.computedStyle){
        let p = element.computedStyle.value;

        element.style[prop] = element.computedStyle[prop].value;

        if(element.style[prop].toString().match(/px$/)){
             element.style[prop] = parseInt(element.style[prop]);
        }

        if(element.style[prop].toString().match(/^[0-9\.]+$/)){
            element.style[prop] = parseInt(element.style[prop]);
        }
    }

    return element.style;
}



function initFlexStyle(style){
    //width和height 值为auto 或者 ‘’,全部转换成null,方便统一管理
['width','height'].forEach(size => {
    if(style[size] === 'auto' || style[size] === ''){
        style[size] = null;
    }
})

//设置默认值
if(!style.flexDirection || style.flexDirection === 'auto'){
    style.flexDirection = 'row';
}
    
if(!style.alignItems || style.alignItems === 'auto'){
    style.alignItems = 'stretch';
}
    
if(!style.justifyContent || style.justifyContent === 'auto'){
    style.justifyContent = 'flex-start';
}
    
if(!style.flexWrap || style.flexWrap === 'auto'){
    style.flexWrap = 'nowrap';
}
    
if(!style.alignContent || style.alignItems === 'auto'){
    style.alignContent = 'stretch';
}
   

}

// 初始化主从轴变量
function initMainAndCross(style){
    //定义主轴和交叉轴尺寸 
let mainSize,mainStart,mainEnd,mainSign,mainBase,
crossSize,crossStart,crossEnd,crossSign,crossBase;

    if(style.flexDirection === 'row'){
        mainSize = 'width';
        mainStart = 'left';
        mainEnd = 'right';
        mainSign = +1;
        mainBase = 0; //从左开始值

        crossSize = 'height';
        crossStart = 'top';
        crossEnd = 'bottom';
    }

    if(style.flexDirection === 'row-reverse'){
        mainSize = 'width';
        mainStart = 'right';
        mainEnd = 'left';
        mainSign = -1;
        mainBase = style.width; //从右开始值

        crossSize = 'height';
        crossStart = 'top';
        crossEnd = 'bottom';
    }

    if(style.flexDirection === 'column'){
        mainSize = 'height';
        mainStart = 'top';
        mainEnd = 'bottom';
        mainSign = +1;
        mainBase = 0;

        crossSize = 'width';
        crossStart = 'left';
        crossEnd = 'right';

    }

    if(style.flexDirection === 'column-reverse'){
        mainSize = 'height';
        mainStart = 'bottom';
        mainEnd = 'top';
        mainSign = -1;
        mainBase = style.height;

        crossSize = 'width';
        crossStart = 'left';
        crossEnd = 'right';

    }

    // 反向换行
    if(style.flexWrap === 'wrap-reverse'){
        let tmp = crossStart;
        crossStart = crossEnd;
        crossEnd = tmp;
        crossSign = -1;
    }else{
        crossBase = 0;
        crossSign = 1;
    }

    return {
        mainSize,
        mainStart,
        mainEnd,
        mainSign,
        mainBase,
        crossSize,
        crossStart,
        crossEnd,
        crossSign,
        crossBase,
      }
}


//排版

function layout(element){
    if(!element.computedStyle){return;} 


    //预处理
    let style = getStyle(element);

    //只接收flex布局
    if(style.display !== 'flex'){return};

    //过滤子节点文本节点，只接收元素节点
    let items = element.children.filter(e=>e.type == 'element');

    //对order属性排序，从小到大排序
    items.sort((a,b) =>{
        return (a.order || 0) - (b.order || 0);
    })
    
     // 初始化属性
     initFlexStyle(style);

       // 主从轴设置
       let { 
        mainSize,
        mainStart,
        mainEnd,
        mainSign,
        mainBase,
        crossSize,
        crossStart,
        crossEnd,
        crossSign,
        crossBase
      } = initMainAndCross(style);
    

    let isAutoMainSize = false; //父元素没有设置宽度，则主轴由子元素撑开,则子元素怎么设置都不会超过父元素宽度
    if(!style[mainSize]){ //auto sizing
        style[mainSize] = 0;
        for(let i =0; i < items.length; i++){
             let item = items[i];
             const itemStyle = getStyle(item);
             if(itemStyle[mainSize] !== null || itemStyle[mainSize] !== (void 0)){
                    style[mainSize]  += itemStyle[mainSize]
             }
        }
        isAutoMainSize = true; //所有元素能排在一行
        //style.flexWrap = 'noWrap';
    }


    let flexLine = []; //把元素收进行
    let flexLines = [flexLine]; //所有行放进一个数组里面

    let mainSpace = style[mainSize]; //剩余空间
    let crossSpace = 0;

    for(let i = 0; i < items.length; i++){
        let item = items[i];
        let itemStyle = getStyle(item);

        if(itemStyle[mainSize] === null){ //没有设置主轴尺寸
            itemStyle[mainSize] = 0;
        }

        if(itemStyle.flex){ //flex属性，元素是可伸缩的
            flexLine.push(item);
        }else if(itemStyle.flexWrap === 'nowrap' && isAutoMainSize){
             // 处理不换行或者自动填充时只有一行
            mainSpace -= itemStyle[mainSize];
            if(itemStyle[crossSize] !== null && itemStyle[crossSize] !== void(0)){
                crossSpace = Math.max(crossSpace,itemStyle[crossSize]);//取行高
            }
            flexLine.push(item);
        }else{
             if(itemStyle[mainSize] > style[mainSize]){
                  itemStyle[mainSize] = style[mainSize] //当单个元素的主轴宽度大于主轴的宽度，则压缩到行宽一样，独占一行
             }
             if(mainSpace < itemStyle[mainSize]){ //行剩余空间不足，进行换行策略

                //处理旧的flexLine,把剩余的空间存进去
                flexLine.mainSpace = mainSpace;
                flexLine.crossSpace = crossSpace;

                // 处理新的flexLine，重置mainSpace
                flexLine = [item];
                flexLines.push(flexLine);
                mainSpace = style[mainSize];
                crossSpace = 0;
             }else{
                 flexLine.push(item)
             }

             //在可以wrap的情况下,计算交叉轴空间取最大
             if(itemStyle[crossSize] !== null && itemStyle[crossSize] !== void(0)){
                  crossSpace = Math.max(crossSpace,itemStyle[crossSize])
             }

             // 处理不换行或者自动填充时只有一行
             mainSpace -= itemStyle[mainSize];
        }
    }

    flexLine.mainSpace = mainSpace;


    // console.log('items',items);

    if(style.flexWrap === 'nowrap' || isAutoMainSize){
        flexLine.crossSpace = (style[crossSize] !== undefined) ? style[crossSize] : crossSpace;
    }else{
        flexLine.crossSpace = crossSpace;
    }

    if(mainSpace < 0){
        //剩余空间不够，进行按比例压缩
        let scale = style[mainSize] / (style[mainSize] - mainSpace);
        let currentMain = mainBase;

        for(let i = 0; i < items.length; i++){
            let item = items[i];
            let itemStyle = getStyle(item);

            if(itemStyle.flex){ //flex没有权利参加等比压缩
                itemStyle[mainSize] = 0;
            }

            itemStyle[mainSize] = itemStyle[mainSize] * scale;

            //算出item的left和right
            itemStyle[mainStart] = currentMain;
            itemStyle[mainEnd] = itemStyle[mainStart] + mainSign * itemStyle[mainSize];
            currentMain = itemStyle[mainEnd];
        }
    } else {
        //计算多行
         flexLines.forEach(function(items){

            let mainSpace = items.mainSpace;
            let flexTotal = 0;
            for(let i =0;i < items.length; i++){
                let item = items[i];
                let itemStyle = getStyle(item);

                if((itemStyle.flex !== null) && (itemStyle.flex !== void(0))){
                     flexTotal += itemStyle.flex;
                     continue;
                }
            }

            if(flexTotal > 0){
                 let currentMain = mainBase;
                 for(let i =0; i < items.length; i++){
                     let item = items[i];
                     let itemStyle = getStyle(item);

                     if(itemStyle.flex){
                         itemStyle[mainSize] = (mainSpace / flexTotal) * itemStyle.flex;
                     }
                     itemStyle[mainStart] = currentMain;
                     itemStyle[mainEnd] = itemStyle[mainStart] + mainSign * itemStyle[mainSize];
                     currentMain = itemStyle[mainEnd];
                 }
            } else {

                // 没有flex的值，根据justifyContent 的规则去判断
                let currentMain, step;

                if(style.justifyContent === 'flex-start'){
                    currentMain = mainBase;
                    step = 0;
                }
                if(style.justifyContent === 'flex-end'){
                      currentMain = mainSpace * mainSign + mainBase;
                      step = 0;
                }

                if(style.justifyContent === 'center'){
                     currentMain = mainSpace / 2 * mainSign + mainBase;
                     step = 0;
                }

                if(style.justifyContent === 'space-between'){
                     step = mainSpace / (items.length - 1) * mainSign;
                     currentMain = mainBase;
                }

                if(style.justifyContent === 'space-around'){
                     step = mainSpace / items.length * mainSign;
                     currentMain = step / 2 + mainBase;
                }

                for (let i = 0; i < items.length; i++){
                     let item = items[i];
                     const itemStyle = getStyle(item);

                     itemStyle[mainStart] = currentMain;
                     itemStyle[mainEnd] = itemStyle[mainStart] + mainSign * itemStyle[mainSize];
                     currentMain = itemStyle[mainEnd] + step;
                }


            }

         })
    }


    if(!style[crossSize]){ //auto sizing
        crossSpace = 0;
        style[crossSize] = 0;
        
        for(let i =0; i < flexLines.length; i++){
            style[crossSize] = style[crossSize] + flexLines[i].crossSpace;
        }
    } else {
        //非auto sizing
         crossSpace  = style[crossSize];
         for(let i = 0; i < flexLines.length; i++){
              crossSpace -= flexLines[i].crossSpace;
         }
    }

    //wrap相反
    if (style.flexWrap === 'wrap-reverse') {
        crossBase = style[crossSize];
    } else {
        crossBase = 0;
    }

    let lineSize = style[crossSize] / flexLines.length;

    let step;

    if(style.alignContent === 'flex-start'){
        crossBase += 0;
        step = 0;
    }

    if(style.alignContent === 'flex-end'){
        crossBase += crossSign * crossSpace;
        step = 0;
    }

    if(style.alignContent === 'center'){
        crossBase += crossSign * crossSpace / 2;
        step = 0;
    }

    if(style.alignContent === 'space-between'){
        crossBase += 0;
        step = crossSpace / (flexLines.length - 1);
    }

    if(style.alignContent === 'space-around'){
        step = crossSpace / flexLines.length;
        crossBase += crossSign * step / 2
    }

    if(style.alignContent === 'stretch'){
        crossBase += 0;
        step = 0;
    }



    //得出每一行的位置
    flexLines.forEach((items) => {
        const lineCrossSize = style.alignContent === 'stretch' ? items.crossSpace + crossSpace / flexLines.length : items.crossSpace;

        for(let i = 0; i < items.length; i++){
             const item = items[i];
             const itemStyle = getStyle(item);

             align = itemStyle.alignSelf || style.alignItems;

             if(itemStyle[crossSize] === null){
                 itemStyle[crossSize] = (align === 'stretch') ? lineCrossSize : 0;
             }

             if(align === 'flex-start'){
                 itemStyle[crossStart] = crossBase;
                 itemStyle[crossEnd] = itemStyle[crossStart] + crossSign * itemStyle[crossSize];
             }

             if(align === 'flex-end'){
                 itemStyle[crossEnd] = crossBase + crossSign * lineCrossSize;
                 itemStyle[crossStart] = itemStyle[crossEnd] - crossSign * itemStyle[crossSize];
             }

             if(align === 'center'){
                 itemStyle[crossStart] = crossBase + crossSign * (lineCrossSize - itemStyle[crossSize]) / 2;
                 itemStyle[crossEnd] = itemStyle[crossStart] + crossSign * itemStyle[crossSize];
             }

             if(align === 'stretch'){
                 itemStyle[crossStart] = crossBase;
                 itemStyle[crossEnd] = crossBase + crossSign * ((itemStyle[crossSize] !== null && itemStyle[crossSize] !== (void 0))? itemStyle[crossSize] : lineCrossSize);
                 itemStyle[crossSize] = crossSign * (itemStyle[crossEnd] - itemStyle[crossStart]);
             }
                console.log(itemStyle)
        }

        crossBase += crossSign * (lineCrossSize + step);
    })
      
}


module.exports = layout