
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import './PurchaseOrderStatusTag.sass'

class PurchaseOrderStatusTag extends Component {



    render() {
        const {className, tagStyle, text, border, ...other} = this.props
        return (
            <span className={['gs-status-tag', className, tagStyle? tagStyle:'gs-tag-light', border? '':'gs-status-tag--no-border'].join(' ')} {...other}
            >
                {text? text:this.props.children}
            </span>
        );
    }
}

PurchaseOrderStatusTag.STYLE = {
    ORDER: 'gs-tag-order',
    IN_PROGRESS: 'gs-tag-in-progress',
    COMPLETED: 'gs-tag-completed',
    CANCELLED: 'gs-tag-cancelled',
}

PurchaseOrderStatusTag.defaultProps = {
    border: false
}

PurchaseOrderStatusTag.propTypes = {
  className: PropTypes.string,
  tagStyle: PropTypes.oneOf(Object.values(PurchaseOrderStatusTag.STYLE)),
  text: PropTypes.any,
    border: PropTypes.bool,
}

export default PurchaseOrderStatusTag;
