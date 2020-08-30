学习笔记

- js label用法多用在循环，可以在break或者continue 跳出外层循环，起到剪枝效果
- 异步编程编程变成同步执行，可以用callback,promise链式调用，或者async awit解决，async后面的setTimeout函数需要包装在promise函数里面
- 一维数组克隆可以用Object.create(xxx),继承原型链的数据和方法；二维数据要用JSON.parse(JSON.stringify(xxx))