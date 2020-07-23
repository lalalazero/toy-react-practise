import { ToyReact, Component } from './ToyReact.js'

class MyComponent extends Component{
    constructor(props){
        super(props)
        console.log('constructor 执行')
    }

    render() {
        return (
            <div>
                {
                    [1,2,3].map(i => <p>p - {i}</p>)
                }
            </div>
        )
    }
    
}

class Foo extends Component {
    constructor(props){
        super(props)
    }
    render() {
        return <p>
            foo
            <span>foo - child 1</span>
            <span>foo - child 2</span>
        </p>
    }
}

ToyReact.render(<MyComponent />, document.body)

