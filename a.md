## 实现拆解

### 1. 搬运 tic-tac-toe 游戏

源码：https://codepen.io/gaearon/pen/gWWZgR?editors=0100

把 js 的部分拷贝过来放到 main.js 中。

把 css 的部分直接贴到 index.html 文件中，用 style 标签包裹。

需要注意的地方：

1. render 的节点是 document.body ，因为 index.html 里面没加 root div （或者加上也可以）
`ReactDOM.render(<Game />, document.body>`
2. 把 function 组件改成 class 组件（别忘了加 this )，再把 React 改成 ToyReact。ReactDOM 也改成 ToyReact 

`yarn webpack` 运行一下，只要不报错并且页面有出来就行了。

### 2. 添加 `props` 和事件监听

- 2.1 `props` 的 `className` 做特殊处理

观察界面会发现样式丢了，检查 `dom` 元素发现是 `classname` 不对，所以这里要对 `setAttribute` 方法进行修改

![image](https://user-images.githubusercontent.com/20458239/88255101-0b2af680-ccea-11ea-8adb-78877082bf1c.png)

```js
setAttribute(name, value) {
    if(name === 'className') {
        name = 'class'
    }
    this.root.setAttribute(name, value)
}
```
改了之后重新打包样式就出来了

![image](https://user-images.githubusercontent.com/20458239/88255578-48dc4f00-cceb-11ea-9e28-d259bd565780.png)

- 2.2 添加事件监听函数

点击棋盘没有反应，因为目前还没有处理事件监听。这里要把 `onClick` 转变为 `onclick` 并且绑定到真实的 `dom` 元素上去。同样的还是修改 `setAttribute` 函数。由于还没实现 `setState` 函数，事件监听函数可以简单用 `console.log()` 测试

```js
setAttribute(name, value) {
    if(name === 'className') {
        name = 'class'
    }
    if(name.match(/^on([\s\S]+)$/)) { // 匹配 on 开头的任意字符 [\s\S] 匹配任意字符 () 作为一个组 
        let eventName = RegExp.$1.toLowerCase() 
        this.root.addEventListener(eventName, value)
    }
    this.root.setAttribute(name, value)
}
```

### 3. `setState` 和 `mergeState` 和 re-render 

实现 `setState` 函数，首先考虑简单的逻辑：
1. `setState` 接受一个参数 `newState` 并且合并 `oldState` 然后更新 `this.state` (不考虑接受函数作为参数)
2. 直接更新 `UI` 重新 `mount` 组件（不考虑 `diff` )


```js
export class Component {
    /* 省略其他 */
    mountTo(parent) {
        this.parent = parent
        let vdom = this.render()
        vdom.mountTo(this.parent)
    }
    update(){
        this.parent.innerHTML = '' // 不考虑 diff 直接把原来都删掉，重新 mount
        let vdom = this.render()
        vdom.mountTo(this.parent)
    }
    setState(state) {
        if(!this.state && state) {
            this.state = {}
        }
        let merge = (oldState, newState) => {
            for(let p in newState) {
                if (typeof newState[p] === 'object' && newState[p] !== null) {
                    if(typeof oldState[p] !== 'object') {
                        if(newState[p] instanceof Array) {
                            oldState[p] = []
                        }else{
                            oldState[p] = {}
                        }
                    }
                    merge(oldState[p], newState[p])
                }else{
                    oldState[p] = newState[p]
                }
            }
        }
        merge(this.state, state)
        console.log('after merge, this.state = ', this.state)
        this.update()
    }
}
