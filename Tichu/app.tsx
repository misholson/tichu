declare var require: any

var React = require('react');
var ReactDOM = require('react-dom');

import { App } from './src/App';

export const Hello = () => {
    return (
        <h1>Welcome to React!!</h1>
    );
}

ReactDOM.render(<App />, document.getElementById('root'));