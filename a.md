## 实现拆解

### 给自定义组件和 html 标签组件添加 wrapper ，使 api 保持行为一致

在 `createElement` 函数中，我们返回的 `html` 节点是直接通过 `document.createElement` 创建的真实 `dom` ，所以要挂载到页面上需要手动写 `document.body.append()` 能不能在这里也返回一个对 `html` 节点的 `wrapper` 类型，封装一个 `mountTo()` 方法，挂载的时候直接调用就可以了。