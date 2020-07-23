import { ToyReact, Component } from './ToyReact.js'

class MyComponent extends Component{
    constructor(props){
        super(props)
        console.log('constructor 执行')
    }

    render() {
        console.log('render 执行')
        return (
            <div>my component</div>
        )
    }
    
}

ToyReact.render(<MyComponent />, document.body)

