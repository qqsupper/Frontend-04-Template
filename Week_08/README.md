学习笔记

排版
1. 排版|根据浏览器属性进行排版 - 设置主轴和交叉轴， flex主轴方向的默认值
2. 排版|收集元素进行 - 判断nowrap进行同行压缩，wrap的时候进行换行操作
3. 排版|计算主轴 - 找出所有flex元素;把主轴方向的剩余尺寸按比例分配给这些元素;若剩余空间为负数,所有flex元素为0,等比压缩剩余元素
4. 排版|计算交叉轴 - 计算交叉轴方向; 根据每一行最大元素尺寸计算行高; 根据行高flex-align和item-align,确定元素具体位置
5. 渲染|绘制单个元素 - 解析元素的位置；生成位图；