import React, {Component} from 'react';
import PropTypes from "prop-types";
import ModalHeader from "reactstrap/es/ModalHeader";
import {Trans} from "react-i18next";
import ModalBody from "reactstrap/es/ModalBody";
import GSButton from "../../../../components/shared/GSButton/GSButton";
import Modal from "reactstrap/es/Modal";
import {Link} from "react-router-dom";
import './ThemeModal.sass'
import ModalFooter from "reactstrap/es/ModalFooter";
import {TokenUtils} from "../../../../utils/token";
import PrivateComponent from "../../../../components/shared/PrivateComponent/PrivateComponent";
import {PACKAGE_FEATURE_CODES} from "../../../../config/package-features";

export class ThemeModal extends Component {

    constructor(props) {
        super(props);

        this.state = {
            link: '/channel/storefront/customization/design?id=' + this.props.data.id
        };

        this.onClose = this.onClose.bind(this);
    }

    onClose() {
        this.props.onClose();
    }

    render() {
        const isAllowEdit = TokenUtils.hasThemingPermission();
        return (<Modal isOpen={true} className="theme-modal">
            <ModalHeader>
                <Trans i18nKey="component.storefront.customization.modal.theme.title"/>
                <i className="btn-close__icon" onClick={() => this.onClose()} />
            </ModalHeader>
            <ModalBody>
                <div className="theme-content">
                    <div className="img-content">
                        <img src={this.props.data.thumbnail} />
                    </div>
                    <div className="desc-content">
                        <div dangerouslySetInnerHTML={{ __html: this.props.data.description }} />
                    </div>
                </div>
            </ModalBody>
            <ModalFooter>
                <GSButton secondary outline
                          onClick={() => this.onClose()}>
                    <Trans i18nKey="common.btn.alert.modal.close"/>
                </GSButton>

                <PrivateComponent hasAnyPackageFeature={[PACKAGE_FEATURE_CODES.WEB_PACKAGE, PACKAGE_FEATURE_CODES.APP_PACKAGE]}>
                    <Link to={this.state.link} className='btn-edit'>
                        <GSButton success marginLeft>
                            <Trans i18nKey="common.btn.edit"/>
                        </GSButton>
                    </Link>
                </PrivateComponent>
            </ModalFooter>
        </Modal>)
    }
}


ThemeModal.propTypes = {
    onClose: PropTypes.func
};
