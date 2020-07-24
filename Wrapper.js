export class ElementWrapper {
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
        
        let placeholder = document.createComment("placeholder");
        let endRange = document.createRange();
        endRange.setStart(range.endContainer, range.endOffset);
        endRange.setEnd(range.endContainer, range.endOffset);
        endRange.insertNode(placeholder);

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

export class TextWrapper {
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
        this.range = range
    }
}