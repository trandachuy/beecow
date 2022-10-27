import React, {Component} from 'react';
import {connect} from "react-redux";
import store from "../../config/redux/ReduxStore";
import PropTypes from "prop-types";

class Logo extends Component {

    defaultLogo;

    constructor(props) {
        super(props);
        this.state = {
            ...this.state,
            color: this.props.color ? '-'+this.props.color : '',
            height: this.props.height ? this.props.height : 30,
        };
        this.defaultLogo = '/assets/images/gosell-logo' + this.state.color + '.svg'
    }

    render() {
        return (
            <img alt='logo' height={this.state.height} src={store.getState().logo || this.defaultLogo}/>
        );
    }
}

const mapStateToProps = (state) => {
    return {logo: state.logo};
};
Logo.propTypes = {
    color: PropTypes.string,
    height: PropTypes.number
};


export default connect(mapStateToProps)(Logo);
