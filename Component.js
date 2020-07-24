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
    appendChild(vchild) {
        this.children.push(vchild)
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
        // if (typeof node1.props[name] === 'function'
        //     && typeof node2.props[name] === 'function'
        //     && node1.props[name].toString() === node2.props[name].toString()) {
        //     continue
        // }

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
    if(isSameTree(newTree, oldTree)) {
        return
    }
    if(!isSameNode(newTree, oldTree)) {
        newTree.mountTo(oldTree.range)
    }else{
        for(let i = 0; i < newTree.children.length; i++) {
            replace(newTree.children[i], oldTree.children[i])
        }
    }
}