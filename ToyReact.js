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
        let range = document.createRange()
        if(mountNode.children.length) {
            range.setStartAfter(mountNode.lastChild)
            range.setEndAfter(mountNode.lastChild)
        }else{
            range.setStart(mountNode, 0)
            range.setEnd(mountNode, 0)
        }
        vdom.mountTo(range)
    }
}

export class Component {
    constructor(){
        this.children = []
        this.props = Object.create(null)
    }
    get type() {
        return this.constructor.name
    }
    get vdom() {
        return this.render().vdom
    }
    setAttribute(name, value) {
        this.props[name] = value
    }
    appendChild(child) {
        this.children.push(child)
    }
    mountTo(range) {
        this.range = range
        this.update()
    }
    update(){
        this.range.deleteContents()
        let vdom = this.render().vdom
        vdom.mountTo(this.range)
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
        this.type = type 
        this.children = []
        this.props = Object.create(null)
    }
    get vdom(){
        return this;
    }
    setAttribute(name, value) {
        this.props[name] = value
    }
    mountTo(range){
        range.deleteContents()
        let element = this.buildRealDom()
        range.insertNode(element)
    }
    buildRealDom(){
        let element = document.createElement(this.type)
        for(let name in this.props) {
            let value = this.props[name]
            if(name === 'className') {
                name = 'class'
            }
            if(name.match(/^on([\s\S]+)$/)) {
                let eventName = RegExp.$1.toLowerCase()
                element.addEventListener(eventName, value)
            }
            element.setAttribute(name, value)
        }
        for(let child of this.children) {
            let range = document.createRange()
            if(element.children.length) {
                range.setStartAfter(element.lastChild)
                range.setEndAfter(element.lastChild)
            }else{
                range.setStart(element, 0)
                range.setEnd(element, 0)
            }
            child.mountTo(range)
        }
        return element
    }
    appendChild(vchild){
        this.children.push(vchild.vdom)
    }
}

class TextWrapper {
    constructor(text) {
        this.type = '#text'
        this.props = Object.create(null)
        this.text = text
        this.children = []
    }
    get vdom() {
        return this;
    }
    mountTo(range){
        range.deleteContents()
        let element = document.createTextNode(this.text)
        range.insertNode(element)
    }
}