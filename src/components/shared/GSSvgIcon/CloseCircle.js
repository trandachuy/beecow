import React from 'react';
import SvgIcon from './GSSvgIcon';
import PropTypes from 'prop-types';

const CloseCircleIcon = (props) => {
    return(
        <SvgIcon xmlns="http://www.w3.org/2000/svg" width={props.width} height={props.height} fill="currentColor" className="bi bi-x-lg" viewBox={props.viewBox} {...props} >
            <path fillRule="evenodd" d="M13.854 2.146a.5.5 0 0 1 0 .708l-11 11a.5.5 0 0 1-.708-.708l11-11a.5.5 0 0 1 .708 0Z"/>
            <path fillRule="evenodd" d="M2.146 2.146a.5.5 0 0 0 0 .708l11 11a.5.5 0 0 0 .708-.708l-11-11a.5.5 0 0 0-.708 0Z"/>
        </SvgIcon>
    );
}

CloseCircleIcon.defaultProps = {
    width: 16,
    height: 16,
    viewBox: '0 0 16 16',
}

CloseCircleIcon.propTypes = {
    children: PropTypes.node,
    className: PropTypes.string,
    width: PropTypes.number,
    height: PropTypes.number,
    titleAccess: PropTypes.string,
    viewBox: PropTypes.string,
    fontSize: PropTypes.number,
    color: PropTypes.string,
    style: PropTypes.object,

};
export default React.memo(CloseCircleIcon);
