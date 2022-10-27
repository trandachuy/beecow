import React, {Component} from 'react'
import AppRouter from './AppRouter'
import AffiliateRoute from './pages/affiliate/AffiliateRoute'

class RouterRenderController extends Component {
    constructor(props) {
        super(props);
    }

    shouldComponentUpdate(nextProps, nextState) {
        return false
    }

    render() {
        return (
            <>
                <AppRouter/>
                <AffiliateRoute/>
            </>
        )
    }
}

export default RouterRenderController