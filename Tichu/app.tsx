declare var require: any

var React = require('react');
var ReactDOM = require('react-dom');

export const Hello = () => {
    return (
        <h1>Welcome to React!!</h1>
    );
}

ReactDOM.render(<Hello />, document.getElementById('root'));