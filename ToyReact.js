export let ToyReact = {
    createElement(type, attributes, ...children){
        console.log('createElement 执行， type', type)
        let element = null
        if(typeof type === 'string') {
            element = document.createElement(type)
        } else {
            element = new type;
        }
        
        for(let name in attributes) {
            element.setAttribute(name, attributes[name])
        }
        for(let child of children) {
            if(typeof child === 'string') {
                let textNode = document.createTextNode(child)
                element.appendChild(textNode)
            }else{
                element.appendChild(child)
            }
        }
        
        return element
    }
}
