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
                        // child = ''
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
        let vdom = this.vdom 
        if(this.oldVdom) {
            if(isSameTree(vdom, this.oldVdom)) {
                return
            }
            if(!isSameNode(vdom, this.oldVdom)) {
                vdom.mountTo(this.oldVdom.range)
            } else {
                replace(vdom, this.oldVdom)
            }
        }else{
            vdom.mountTo(this.range)
        }
        this.oldVdom = vdom
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
        this.range = range
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
        this.range = range
        range.deleteContents()
        let element = document.createTextNode(this.text)
        range.insertNode(element)
    }
}

function isSameTree(node1, node2) {
    if(!isSameNode(node1, node2)) {
        return false
    }

    if(node1.children.length !== node2.children.length) {
        return false
    }
    for(let i = 0 ; i < node1.children.length; i++) {
        if(!isSameTree(node1.children[i], node2.children[i])) {
            return false
        }
    }

    return true
}

function isSameNode(node1, node2) {
    if(node1.type !== node2.type) {
        return false
    }

    if(Object.keys(node1.props).length !== Object.keys(node2.props).length) {
        return false
    }

    for(let name in node1.props) {
        if (typeof node1.props[name] === 'function'
            && typeof node2.props[name] === 'function'
            && node1.props[name].toString() === node2.props[name].toString()) {
            continue
        }

        if (typeof node1.props[name] === 'object'
            && typeof node2.props[name] === 'object'
            && JSON.stringify(node1.props[name]) === JSON.stringify(node2.props[name])) {
            continue
        }


        if (node1.props[name] !== node2.props[name]) {
            return false
        }
    }

    return true
}

function replace(newTree, oldTree) {
    // if(isSameTree(newTree, oldTree)) {
    //     return
    // }
    if(!isSameNode(newTree, oldTree)) {
        newTree.mountTo(oldTree.range)
    }else{
        for(let i = 0; i < newTree.children.length; i++) {
            if(newTree.children[i].type === '#text') {
                debugger
            }
            if(!oldTree.children[i]) {
                newTree.mountTo(oldTree.range)
            }else{
                replace(newTree.children[i], oldTree.children[i])
            }
            
        }
    }
}