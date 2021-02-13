declare var require: any

var React = require('react');
var ReactDOM = require('react-dom');

import { App } from './src/App';
import { runTests } from './tests/ValidPlayTests';

runTests();

ReactDOM.render(<App />, document.getElementById('root'));