import './SharedContainer.sass'

import React from 'react'
import {bool} from "prop-types";

const SharedContainer = ({disabled, children, className}) => {
    return (
        <div className={[
            className,
            'shared-container',
            disabled ? 'disabled' : ''
        ].join(' ')}>
            {children}
        </div>
    )
}

SharedContainer.defaultProps = {
    disabled: false
}

SharedContainer.propTypes = {
    disabled: bool
}

export default SharedContainer