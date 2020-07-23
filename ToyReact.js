export let ToyReact = {
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
        let insertChildren = (children) => {
            for(let child of children) {
                if(typeof child === 'object' && child instanceof Array) {
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
    render(vdom, mountNode){
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
        this.parent = parent
        let vdom = this.render()
        vdom.mountTo(this.parent)
    }
    update(){
        this.parent.innerHTML = ''
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

class ElementWrapper {
    constructor(type){
        this.root = document.createElement(type)
    }
    setAttribute(name, value) {
        if(name === 'className') {
            name = 'class'
        }
        if(name.match(/^on([\s\S]+)$/)) {
            let eventName = RegExp.$1.toLowerCase()
            this.root.addEventListener(eventName, value)
        }
        this.root.setAttribute(name, value)
    }
    mountTo(parent){
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
        parent.appendChild(this.root)
    }
}