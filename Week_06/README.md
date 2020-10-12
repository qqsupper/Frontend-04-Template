学习笔记

- 浏览器工作原理: 
1.url -> html:通过请求url,请求http获取html内容
2.html -> dom: 浏览器通过html parse 解析为dom tree
3.dom -> dom with css:因为css是级联样式表,通过computed 计算每个dom的节点挂载的属性以及叠加关系
4.dom with css -> dom with position : 把每个dom 在页面的位置计算出来,layout
5.dom with position -> Bitmap : 最后render出一张位图,交给浏览器的渲染引起渲染

- 状态机的reconsume的时候把参数重新传进函数里面
- http请求 headers里面必须要有Content-Type,不然Body无法解析