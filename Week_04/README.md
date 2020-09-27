学习笔记
- symbol可以保证属性的唯一值，如果这个赋值的变量给更改了，就拿不到这个symbol的引用地址。跟原本的字符串不同
- 对象类中，行为改变对象状态
- Function 是带[[call]]方法行为
- Object API
   1. {} . [] Object.defineProperty
   2. Object.create/ Object.setPrototypeOf / Object.getPrototypeOf
   3. new / class / extends
   4. new / function / prototype