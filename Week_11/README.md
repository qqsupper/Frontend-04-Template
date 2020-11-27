学习笔记
1. html标签语义： aside|侧边栏, main| 主体内容, article | 网站中的独立结构, hgroup | 标题栏(有标题和标题说明),
abbr | 单词的缩写,  strong|整篇文章重要词语, em|语句中重音位置, figure | 里面可以放img 和 figcaption 描述图片的文字,
nav | 导航, dfn | 单词解析, samp | 例子, pre | 保留原本格式(如果里面有html标签,则 "<" 用 "\&lt;" 代替), 
code | 代码语句, footer | 底部

2. * 事件api , passive设置为false可以设置滚动的时候阻止默认行为; 如果监听事件会阻止主进程渲染,可以将passive设置为true达到性能提升效果
   * 冒泡和捕获事件监听，默认是冒泡行为 
3. element是living collections,可以动态计算dom结构
4. range 的两种创建方式

```js
 let range = new Range ();

 let range1 = document.getSelection().getRangeAt(0)

```

5. CSSOM: 利用document.styleSheets访问

```js
document.styleSheets[0].cssRules
document.styleSheets[0].insertRule("p{color:ping;}",0)
document.styleSheets[0].removeRule(0)

// 取伪元素属性
getComputedStyle(document.querySelector('a'),'::before')
```
 