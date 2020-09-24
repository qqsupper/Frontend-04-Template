学习笔记

- 循环里面 `node=node[c]`将字典查找的时候翻到对应字符页查找下一级
- reactToy里面的effect函数相当于事件监听 addEventListener
- usedReactivties 观察每个effect函数里面用了哪些变量，相当于effect和reactive的桥接作用;
  1.reactivties是缓存所有proxy对象
  2.callbacks是所有回调函数
  3.usedReactivties当前用了哪些对象和属性
- 监听元素的mouse事件,当元素mousedown的时候里面用document监听mousemove和mouseup事件,不然元素的mousedown会产生断层
- range.getBoundingClientRect();range不变，但是它获取的坐标会随页面变化的时候变化;
- selectstart的默认事件是文本给选中