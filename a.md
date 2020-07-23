## 实现拆解

### 创建虚拟 dom ，而不是真实的 dom 节点，等到 render 的时候再进行 dom 操作

实际上 wrapper 就是一个 vdom ，可以把 document.createElement 放到 mountTo 中去，而不是在 constructor 中创建。