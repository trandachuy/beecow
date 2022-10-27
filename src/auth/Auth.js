import React, {Component} from 'react';
import {setPageTitle} from "../config/redux/Reducers";
import {connect} from "react-redux";

class Auth extends Component {

    constructor(props) {
        super(props);
        this.props.dispatch(setPageTitle('Authorized'));
    }

    render() {
        return (
            <h1>Authorized body</h1>
        );
    }
}

export default connect()(Auth);