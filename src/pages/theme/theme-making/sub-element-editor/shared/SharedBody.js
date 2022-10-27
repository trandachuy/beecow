import './SharedBody.sass'

import React from 'react'

const SharedBody = ({children, className}) => {
    return (
        <div className={['shared-body', className].join(' ')}>
            {children}
        </div>
    )
}

export default SharedBody