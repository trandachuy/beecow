import React from 'react';
import SvgIcon from './GSSvgIcon';
import PropTypes from 'prop-types';

const CheckIcon = (props) => {
    return(
        <SvgIcon width={props.width} height={props.width} xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="bi bi-check" viewBox={props.viewBox} {...props} >
            <path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 0 1 .02-.022z"/>
        </SvgIcon>
    );
}

CheckIcon.defaultProps = {
    width: 20,
    height: 20,
    viewBox: '0 0 16 16',
}

CheckIcon.propTypes = {
    children: PropTypes.node,
    className: PropTypes.string,
    width: PropTypes.number,
    height: PropTypes.number,
    titleAccess: PropTypes.string,
    viewBox: PropTypes.string ,
    fontSize: PropTypes.number,
    color: PropTypes.any,
    style: PropTypes.any

};
export default React.memo(CheckIcon);


