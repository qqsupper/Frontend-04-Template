
// 获取元素属性
function getStyle(element){
    if(!element.style)
        element.style = {};
    
    for(let prop in element.computedStyle){
        var p = element.computedStyle.value;

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


//排版

function layout(element){
    if(!element.computedStyle) return;


    //预处理
    var elementStyle = getStyle(element);

    //只接收flex布局
    if(elementStyle.display !== 'flex') return;

    //过滤子节点文本节点，只接收元素节点
    var items = element.children.filter(e=>e.type === 'elemennt');

    //对order属性排序，从小到大排序
    items.sort(function(a,b){
        
        return (a.order || 0) - (b.order || 0);
    })

    var style = elementStyle;
    
    //width和height 值为auto 或者 ‘’,全部转换成null,方便统一管理
    ['width','height'].forEach(size => {
        if(style[size] === 'auto' || style[size] === ''){
            style[size] = null;
        }
    })

    //设置默认值
    if(!style.flexDirection || style.flexDirection === 'auto')
        style.flexDirection = 'row';
    if(!style.alignItems || style.alignItems === 'auto')
        style.alignItems = 'stretch';
    if(!style.justifyContent || style.justifyContent === 'auto')
        style.justifyContent = 'flex-start';
    if(!style.flexWrap || style.flexWrap === 'auto')
        style.flexWrap = 'nowrap';
    if(!style.alignContent || style.alignItems === 'auto')
        style.alignContent = 'stretch';


    //定义主轴和交叉轴尺寸
    var mainSize,mainStart,mainEnd,mainSign,mainBase,
        crossSize,crossStart,crossEnd,crossSign,mainBase;

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
        var tmp = crossStart;
        crossStart = crossEnd;
        crossEnd = tmp;
        crossSign = -1;
    }else{
        crossBase = 0;
        crossSign = 1;
    }


    var isAutoMainSize = false; //父元素没有设置宽度，则主轴由子元素撑开,则子元素怎么设置都不会超过父元素宽度
    if(!style[mainSize]){ //auto sizing
        elementStyle[mainSize] = 0;
        for(var i =0; i < items.length; i++){
             var item = items[i];
             const itemStyle = getStyle(item);
             if(itemStyle[mainSize] !== null || itemStyle[mainSize] !== (void 0)){
                    elementStyle[mainSize]  = elementStyle[mainSize]
             }
        }
        isAutoMainSize = true; //所有元素能排在一行
        //style.flexWrap = 'noWrap';
    }


    var flexLine = []; //把元素收进行
    var flexLines = [flexLine]; //所有行放进一个数组里面

    var mainSpace = elementStyle[mainSize]; //剩余空间
    var crossSpace = 0;

    for(var i = 0; i < items.length; i++){
        var item = items[i];
        var itemStyle = getStyle(item);

        if(itemStyle[mainSize] === null){ //没有设置主轴尺寸
            itemStyle[mainSize] = 0;
        }

        if(itemStyle.flex){ //flex属性，元素是可伸缩的
            flexLine.push(item);
        }else if(style.flexWrap === 'nowrap' && isAutoMainSize){
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
                mainSpace = style[mainSpace];
                crossSpace = 0;
             }else{
                 flexLine.push(item)
             }

             //在可以wrap的情况下
             if(itemStyle[crossSize] !== null && itemStyle[crossSize] !== void(0)){
                  crossSpace = Math.max(crossSpace,itemStyle[crossSize])
             }
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
        var scale = style[mainSize] / (style[mainSize] - mainSpace);
        var currentMain = mainBase;
        for(var i = 0; i < items.length; i++){
            var item = items[i];
            var itemStyle = getStyle(item);

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

            var mainSpace = items.mainSpace;
            var flexTotal = 0;
            for(var i =0;i < items.length; i++){
                var item = items[i];
                var itemStyle = getStyle(item);

                if((itemStyle.flex !== null) && (itemStyle.flex !== void(0))){
                     flexTotal += itemStyle.flex;
                     continue;
                }
            }

            if(flexTotal > 0){
                 var currentMain = mainBase;
                 for(var i =0; i < items.length; i++){
                     var item = items[i];
                     var itemStyle = getStyle(item);

                     if(itemStyle.flex){
                         itemStyle[mainSize] = (mainSpace / flexTotal) * itemStyle.flex;
                     }
                     itemStyle[mainStart] = currentMain;
                     itemStyle[mainEnd] = itemStyle[mainStart] + mainSign * itemStyle[mainSize];
                     currentMain = itemStyle[mainEnd];
                 }
            } else {
                // 没有flex的值，根据justifyContent 的规则去判断
                if(style.justifyContent === 'flex-start'){
                     var currentMain = mainBase;
                     var step = 0;
                }
                if(style.justifyContent === 'flex-end'){
                     var currentMain = mainSpace * mainSign + mainBase;
                     var step = 0;
                }

                if(style.justifyContent === 'center'){
                    var currentMain = mainSpace / 2 * mainSign + mainBase;
                    var step = 0;
                }

                if(style.justifyContent === 'space-between'){
                    var step = mainSpace / (items.length - 1) * mainSign;
                    var currentMain = mainBase;
                }

                if(style.justifyContent === 'space-around'){
                    var step = mainSpace / items.length * mainSign;
                    var currentMain = step / 2 + mainBase;
                }

                for (var i = 0; i < items.length; i++){
                     var item = items[i];
                     itemStyle[mainStart] = currentMain;
                     itemStyle[mainEnd] = itemStyle[mainStart] + mainSign * itemStyle[mainSize];
                     currentMain = itemStyle[mainEnd] + step;
                }


            }

         })
    }


      
}


module.exports = layout