学习笔记


1. HTML | HTML parse模块的文件拆分
2. HTML | 用FSM(有限状态机)实现HTMl分析 
3. HTML | 解析标签
4. HTML | 创建元素
5. HTML | 处理属性
6. HTML | 用token构建DOM
7. HTML | 将文本节点添加到DOM树
8. CSS计算 | 手机CSS规则，用插件css
9. CSS计算 | 添加调用  -  在dom树的节点的开始标签 就开始调用computeCSS
10. CSS计算 | 获取父元素序列  - computeCSS 里面逐级找到他父元素对比
11. CSS计算 | 选择器与元素的匹配 - computeCSS 里面调用match 函数 进行每个元素与选择器对比
12. CSS计算 | 计算选择器与元素的匹配 - match函数实现
13. CSS计算 | 生成computed属性 - 将csssom 与 dom树 结合计算得出 computedStyle
14. CSS计算 | specificity的计算逻辑 - 计算优先级 [0, 0, 0, 0] 对应 [inline, id, class, tag],高位能比较出来结果则不考虑低位