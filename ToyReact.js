export let ToyReact = {
    createElement(type, attributes, ...children){
        console.log('createElement 执行， type', type)
        let element = null
        if(typeof type === 'string') {
            element = new ElementWrapper(type)
        } else {
            element = new type;
        }
        
        for(let name in attributes) {
            element.setAttribute(name, attributes[name])
        }
        for(let child of children) {
            if(typeof child === 'string') {
                let textNode = new TextWrapper(child)
                element.appendChild(textNode)
            }else{
                element.appendChild(child)
            }
        }
        
        return element
    },
    render(vdom, mountNode){
        console.log('ToyReact.render()...')
        vdom.mountTo(mountNode)
    }
}

export class Component {
    constructor(){
        this.children = []
        this.props = Object.create(null)
    }
    setAttribute(name, value) {
        this.props[name] = value
    }
    appendChild(child) {
        this.children.push(child)
    }
    mountTo(parent) {
        console.log('mountTo 执行，调用 this.render 方法')
        let vdom = this.render()
        console.log('实dom ', vdom)
        console.log('挂载到页面上...')
        vdom.mountTo(parent)
        // parent.appendChild(dom)
    }
}

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