import React from 'react';
import SvgIcon from './GSSvgIcon';
import PropTypes from 'prop-types';

const ArrowForward = (props) => {
    return(
        <SvgIcon width={props.width} height={props.height} viewBox={props.viewBox} {...props}>
            <polygon points="6.23,20.23 8,22 18,12 8,2 6.23,3.77 14.46,12" />
        </SvgIcon>
    );
}
ArrowForward.defaultProps = {
    height: 16,
    width: 16,
    viewBox: '0 0 24 24'
}
ArrowForward.propTypes = {
    children: PropTypes.node,
    className: PropTypes.string,
    width: PropTypes.number,
    height: PropTypes.number,
    titleAccess: PropTypes.string,
    viewBox: PropTypes.string,
    fontSize:  PropTypes.number,
    color: PropTypes.string,
    style: PropTypes.object,

};
export default React.memo(ArrowForward);
