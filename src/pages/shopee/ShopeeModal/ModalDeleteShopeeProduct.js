import './ModalDeleteShopeeProduct.sass';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import i18next from 'i18next';
import GSButton from '../../../components/shared/GSButton/GSButton';
import { Trans } from 'react-i18next';
import {Modal, ModalBody, ModalFooter, ModalHeader} from "reactstrap";
import {AvForm} from "availity-reactstrap-validation";
import _ from 'lodash';
import LoadingScreen from '../../../components/shared/LoadingScreen/LoadingScreen';
import i18n from '../../../config/i18n';
import AvCheckbox from 'availity-reactstrap-validation/lib/AvCheckbox';
import AvCheckboxGroup from 'availity-reactstrap-validation/lib/AvCheckboxGroup';

class ModalDeleteShopeeProduct extends Component {

  OPTION = [{
    value: "OPT_1",
    label: i18n.t("shopee.product.delete.modal.option1")
  },
  {
    value: "OPT_2",
    label: i18n.t("shopee.product.delete.modal.option2")
  }]

  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      isOpen: false,
      canClose: false,
      items: props.selectedItems || [],
      defaultValue: this.OPTION[0].value,
      selectedValue: {[this.OPTION[0].value]: true, [this.OPTION[1].value]: false},
    };

    this.toggle=this.toggle.bind(this);
    this.onSelectedOption=this.onSelectedOption.bind(this);
    this.onFinish=this.onFinish.bind(this);
    this.onCancel=this.onCancel.bind(this);
    this.openModal=this.openModal.bind(this);
  }

  componentDidMount() {
    
  }

  openModal(options) {
    this.setState(_.extend({
      isOpen: true,
    }, options));
  }

  toggle() {
    this.setState(prevState => ({
      isOpen: !prevState.isOpen
    }));
  }

  onSelectedOption(e) {
    const {value, checked} = e.target;
    let opt = {...this.state.selectedValue, ...{[value]: checked}};
    console.debug(opt);
    this.setState({selectedValue: opt});
    return e;
  }

  onFinish() {
    if(this.state.onClickOk) {
      this.state.onClickOk(this.state.selectedValue);
    }
    this.toggle();
  }

  onCancel() {
    if(this.state.onClickCancel) {
      this.state.onClickCancel();
    }
    this.toggle();
  }

  render() {
    const {items, selectedValue} = this.state;
    return (
      <div>
        {this.state.isLoading && <LoadingScreen zIndex={9999} />}
        <Modal isOpen={this.state.isOpen} toggle={this.toggle} 
          backdrop={this.state.canClose? "":"static"} 
          keyboard={ this.state.canClose? true:false } 
          modalClassName={`shopee_delete_product_modal`}>
            <ModalHeader toggle={this.toggle}>{i18next.t("shopee.product.delete.modal.title")}</ModalHeader>
            <ModalBody>
                <div className="shopee__description">
                    <Trans i18nKey="shopee.product.delete.modal.description"
                        values={{quantity: items.length}}>
                        <span></span>
                    </Trans>
                </div>
                <div className="shopee__body">
                  <AvForm autoComplete="off">
                    <AvCheckboxGroup
                        className="branch-type"
                        name="selectedOption">
                          <>
                            {this.OPTION.map((opt, index) => {
                              const optValue = opt.value;
                              const optLabel = opt.label;
                              return (<AvCheckbox
                                customInput
                                checked={selectedValue[optValue]}
                                label={optLabel}
                                key={optValue}
                                value={optValue}
                                onChange={(e) => {
                                  this.onSelectedOption(e);
                                }}
                              />);
                            })}
                          </>
                    </AvCheckboxGroup>
                  </AvForm>
                </div>
            </ModalBody>
            <ModalFooter>
                <GSButton onClick={this.onCancel}>
                    <Trans i18nKey="common.btn.cancel"/>
                </GSButton>
                <GSButton marginLeft success onClick={this.onFinish}>
                    <Trans i18nKey="common.btn.ok"/>
                </GSButton>
            </ModalFooter>
        </Modal>
      </div>
    );
  }
}

ModalDeleteShopeeProduct.propTypes = {
  selectedItems: PropTypes.array,
};

export default ModalDeleteShopeeProduct;