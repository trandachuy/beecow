import './SharedHeader.sass'

import React from 'react'

const SharedHeader = ({children, ...other}) => {
    return (
        <div className='shared-header' {...other}>
            {children}
        </div>
    )
}

export default SharedHeader