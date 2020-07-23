## 实现拆解

### 自定义组件 children 的处理

1. 对 `boolean` `undefined` `null` 等的处理

在 `createElement` 中增加对 `child` 的类型的限制，目前类型只有 `html` 标签类型和自定义组件类型，但是如果 `children` 含有类似这样的节点：

```jsx
render(){
    return (
        <div>
            {
                true
            }
            {
                false
            }
            {
                undefined
            }
            {
                null
            }
        </div>
    )
}
```
那么直接调用 `element.appendChild(vdom)` 会调用 `vdom.mountTo()` 方法，这里的 `vdom` 不是一个 `wrapper` 对象，而是原来的类型 `true` `undefined` `null` ，所以 `mountTo` 不存在而报错。
简单起见可以直接将另外的类型都强转为 `String` 类型，然后再包装为一个 `TextWrapper` 对象。
```js
// createElement 
for(let child of children) {
    if(!(child instanceof Component) && !(child instanceof ElementWrapper) && !(child instanceof TextWrapper)) { // 强转为 String
        child = String(child)
    }
    if(typeof child === 'string') {
        let textNode = new TextWrapper(child)
        element.appendChild(textNode)
    }else{
        element.appendChild(child)
    }
}
        
```
也可以参照 `React` 的处理，过滤了 `null` `undefined` `true` `false` 这些值。
```js
for(let child of children) {
    if(child === null || child === void 0 || typeof child === 'boolean') { // 过滤这些值
        continue
    }
    if(!(child instanceof Component) && !(child instanceof ElementWrapper) && !(child instanceof TextWrapper)) { // 强转 String
        child = String(child)
    }
    if(typeof child === 'string') {
        let textNode = new TextWrapper(child)
        element.appendChild(textNode)
    }else {
        element.appendChild(child)
    }
}
```

2. 如果 `children` 里面还有 `children` 

```jsx
render() {
    return (
        <div>
            {
                [1,2,3].map(i => <p>p - {i}</p>)
            }
        </div>
    )
}
```

需要单独判断 `child` 的类型是不是 `Array` ，然后递归处理
```js
createElement(type, attributes, ...children){
    let element = null
    if(typeof type === 'string') {
        element = new ElementWrapper(type)
    } else {
        element = new type;
    }
    
    for(let name in attributes) {
        element.setAttribute(name, attributes[name])
    }
    // 处理 children
    let insertChildren = (children) => {
        for(let child of children) {
            if(typeof child === 'object' && child instanceof Array) {
                // 如果是数组继续递归处理
                insertChildren(child)
            }else{
                if(!child || typeof child === 'boolean') {
                    continue
                }
                if(!(child instanceof Component) && !(child instanceof ElementWrapper) && !(child instanceof TextWrapper)) {
                    child = String(child)
                }
                if(typeof child === 'string') {
                    let textNode = new TextWrapper(child)
                    element.appendChild(textNode)
                }else {
                    element.appendChild(child)
                }
            }
            
        }
    }
    
    insertChildren(children)
    return element
},
```



