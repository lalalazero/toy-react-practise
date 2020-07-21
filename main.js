import { ToyReact } from './ToyReact.js'

class MyComponent {
    constructor(){
        console.log('constructor 执行')
    }

    render() {
        console.log('render 执行')
        return (
            <div>my component</div>
        )
    }
    mountTo(parent) {
        console.log('mountTo 执行')
        let dom = this.render()
        console.log('实dom ', dom)
        console.log('挂载到页面上...')
        parent.appendChild(dom)
    }
}

let instance = <MyComponent />
console.log('得到实例 ', instance)
console.log('调用 mountTo 方法')
instance.mountTo(document.body)


