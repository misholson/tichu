var React = require('react');
var ReactDOM = require('react-dom');
import { HashRouter } from 'react-router-dom';

import { App } from './src/App';

const rootElement = document.getElementById('root');

ReactDOM.render(
    <HashRouter>
        <App />
    </HashRouter>,
    rootElement);