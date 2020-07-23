## 实现拆解

### 给自定义组件和 html 标签组件添加 wrapper ，使 api 保持行为一致

在命令式的代码中，挂载组件到页面上的过程是：

1. `new type` 得到了 `MyComponent` 的实例对象
2. 实例对象假设有一个 `mountTo(parent)` 方法, 负责将组件挂载到真实 `dom` 上
3. `mountTo(parent)` 方法首先要调用 `render()` 方法得到 `jsx` 内容，然后会等价转换为 `createElement` 方法
4. 由于我们的 `createElement` 对于 `html` 标签目前返回的是真实 `dom` 对象，因此调用 `render` 方法得到的实际上已经是真实 `dom` 了
5. 真实的 `dom` 直接挂载到页面上即可 `document.body.appendChild(dom)`

现在做进一步的抽象。

1. 对于真实的 `html` 标签也用一个 `class` 包裹起来，并且暴露一个 `mountTo` 方法，这样虚拟 `dom` 和真实的 `dom` 的 `mount` 都是直接调用 `mountTo` 方法

在 `ToyReact.js` 中创建两个 `Wrapper` 类，由于非文字类型的 `dom` 节点还有 `setAttribute` 和 `appendChild` 方法，这里也要一并加上。

```js
class ElementWrapper {
    constructor(type){
        this.root = document.createElement(type)
    }
    setAttribute(name, value) {
        this.root.setAttribute(name, value)
    }
    mountTo(parent){
        console.log('element 挂载到页面上')
        parent.appendChild(this.root)
    }
    appendChild(vdom){
        vdom.mountTo(this.root)
    }
}

class TextWrapper {
    constructor(text) {
        this.root = document.createTextNode(text)
    }
    mountTo(parent){
        console.log('text挂载到页面上')
        parent.appendChild(this.root)
    }
}
```

在 `createElement` 中，不直接 `document.createElement` ，而是返回 `new Wrapper` 的实例

```js
createElement(type, attributes, ...children){
    console.log('createElement 执行， type', type)
    let element = null
    if(typeof type === 'string') {
        element = new ElementWrapper(type) // 这里变了
    } else {
        element = new type;
    }
    
    for(let name in attributes) {
        element.setAttribute(name, attributes[name])
    }
    for(let child of children) {
        if(typeof child === 'string') {
            let textNode = new TextWrapper(child) // 这里变了
            element.appendChild(textNode)
        }else{
            element.appendChild(child)
        }
    }
    
    return element
}
```

2. 对于自定义的组件也要创建一个 `Wrapper` ，也会有 `setAttribute` 和 `appendChild` 方法，因为这些都在 `createElement` 当中有调用。 自定义的组件不是真实的 `dom` ，所以 `attributes` 用一个 `props` 对象来代替。同理还要初始化一个 `children` 数组。


```js
export class Component {
    constructor(){
        this.props = Object.create(null)
        this.children = []
    }
    setAttribute(name, value) {
        this.props[name] = value
    }
    appendChild(child) {
        this.children.push(child)
    }
    mountTo(parent){
        let vdom = this.render() // 这里得到的是 Wrapper ，之前得到的是真实 dom
        vdom.mountTo(parent) // 这里不直接 document.body.append(vdom) 了
    }
}

```

3. 同时收拢入口，将原来的这一部分命令式代码抽象为 `ToyReact.render` 方法

```js
// 旧的命令式代码
let instance = <MyComponent />
console.log('得到实例 ', instance)
console.log('调用 mountTo 方法')
instance.mountTo(document.body)
```

```js
// ToyReact.js 新增 render 方法
export let ToyReact = {
    createElement() { /*省略*/ }
    render(component, mountNode) {
        let vdom = component.render()
        vdom.mountTo(mountNode)
    }
}
```

在新的 `main.js` 中，自定义组件继承  `Component` 就会有 `mountTo` 方法
```js
// main.js
import { ToyReact, Component } from './ToyReact.js'

class MyComponent extends Component{
    constructor(props){
        super(props)
        console.log('constructor 执行')
    }

    render() {
        console.log('render 执行')
        return (
            <div>my component</div>
        )
    }
    
}
ToyReact.render(<MyComponent />, document.body)
```




