import React, {useState, useRef, useImperativeHandle} from 'react';
import PropTypes from 'prop-types';
import {Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import './GSModalBootstrap.sass';

const GSModalBootstrap =  (props, ref) => {

    const [show, setShow] = useState(false);

    useImperativeHandle(ref,
        () => ({
            open: () => {
                open()
            },
            close: () => {
                close()
            }
        })
    );
    
    const open = () => {
        setShow(true)
    }
    
    const close = () => {
        setShow(false)
    }

    const {className, showClose, header, footer, ...other} = props
    return (
        <div {...other}>
            <Modal isOpen={show} centered={true} className={["gs-modal-bootstrap", className].join(" ")} wrapClassName="vh-100 vw-100 d-block d-sm-block d-md-block w-auto">
                {header&& <ModalHeader>
                    {header}
                    {showClose && <div className={'gs-modal-close'} onClick={close}>X</div>}
                </ModalHeader>}
                <ModalBody>
                    {props.children}
                </ModalBody>
                {footer&& <ModalFooter>
                    {footer}
                </ModalFooter>}
            </Modal>
        </div>
    )
};

GSModalBootstrap.defaultProps = {
    showClose: true
}

GSModalBootstrap.propTypes = {
    showClose: PropTypes.bool,
    className: PropTypes.string,
    header: PropTypes.any,
    footer: PropTypes.any,
};

export default React.forwardRef(GSModalBootstrap);
