import { ElementWrapper, TextWrapper } from './Wrapper'
import { Component } from './Component'

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





