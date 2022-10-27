import React from 'react';
import ReactDOM from 'react-dom';

import App from './App';
import * as serviceWorker from './serviceWorker';
import {Provider} from "react-redux";
import store from "./config/redux/ReduxStore";
// Global library
import 'bootstrap';
import './config/i18n';
import 'react-tippy/dist/tippy.css'
import 'font-awesome/css/font-awesome.min.css'
import './@stringee/stringee-web-sdk.min';
import 'bootstrap/dist/css/bootstrap.min.css'
import './index.css';
import '../sass/_style.sass'
import './@uik/styles.css';
import './config/fas';
import 'react-toastify/dist/ReactToastify.css';
import 'react-datepicker/dist/react-datepicker.css'
import {RecoilRoot} from "recoil";


/* ReactDOM.render(
    <Learning/>,
    document.getElementById('learning-root')
);
 */

ReactDOM.render(
    <Provider store={store}>
        <RecoilRoot>
            <App />
        </RecoilRoot>
    </Provider>
    ,
document.getElementById('root')

);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
