import React, {Component} from 'react';
import {setPageTitle} from "../../config/redux/Reducers";
import Constants from "../../config/Constant";
import {connect} from "react-redux";

class Order extends Component {

    // interval;

    constructor(props) {
        super(props);
        this.props.dispatch(setPageTitle(Constants.APP_NAME + ' - Orders'));
        this.state = {
            number: 0
        }
    }

    componentDidMount() {
        let self = this;
        // this.interval = setInterval(() => {
        //     let count = self.state.number;
        //     console.log('Order Count: ' + count);
        //     count++;
        //     self.setState({number: count});
        // }, 1000);
    }

    componentWillUnmount() {
        // clearInterval(this.interval);
    }

    render() {
        return (
            <div>
                <h1>Order body</h1>
                <br/>
                <h2>{this.state.number}</h2>
            </div>
        );
    }
}

export default connect()(Order);