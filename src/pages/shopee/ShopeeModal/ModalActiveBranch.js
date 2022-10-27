import './ModalActiveBranch.sass';

import React, { Component } from 'react';
import i18next from 'i18next';
import GSButton from '../../../components/shared/GSButton/GSButton';
import { Trans } from 'react-i18next';
import storeService from '../../../services/StoreService';
import {Modal, ModalBody, ModalFooter, ModalHeader} from "reactstrap";
import {AvRadio, AvRadioGroup, AvForm} from "availity-reactstrap-validation";
import _ from 'lodash';
import LoadingScreen from '../../../components/shared/LoadingScreen/LoadingScreen';

class ModalActiveBranch extends Component {

  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      isOpen: false,
      canClose: false,
      branches: [],
      selectedBranch: {},
      branchId: null,
      selectedBranchId: null
    };

    this.toggle=this.toggle.bind(this);
    this.selectedOnBranch=this.selectedOnBranch.bind(this);
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
    this.getActiveBranch();
  }

  toggle() {
    this.setState(prevState => ({
      isOpen: !prevState.isOpen
    }));
  }

  getActiveBranch() {
    this.setState({isLoading: true});
    try {
      let data = this.state.branches;
      if(_.isEmpty(data)) {
        return;
      }
      const defaultBranch = data.filter(b => b.isDefault === true);
      const defaultValue = !_.isEmpty(defaultBranch)? defaultBranch[0]: data[0];
      this.setState({branches: data, selectedBranch: defaultValue, branchId: defaultValue.id, selectedBranchId: defaultValue.id});
    } catch(e) {
      console.error(e);
    } finally {
      this.setState({isLoading: false});
    }
  }

  selectedOnBranch(e) {
    const branchId = e.target.value;
    console.debug(branchId);
    this.setState({selectedBranchId: branchId});
    return e;
  }

  onFinish() {
    this.toggle();
    if(this.state.onClickOk) {
      this.state.onClickOk(this.state.selectedBranchId);
    }
  }

  onCancel() {
    if(this.state.onClickCancel) {
      this.state.onClickCancel();
    }
  }

  render() {
    const {canClose, isOpen, branchId} = this.state;
    return (
      <div>
        {this.state.isLoading && <LoadingScreen zIndex={9999} />}
        <Modal isOpen={isOpen} toggle={this.toggle} 
          backdrop={canClose? "":"static"} 
          keyboard={canClose} 
          modalClassName={`active-branch-modal`}>
            <ModalHeader /* toggle={this.toggle} */>{i18next.t("shopee.account.author.modal.title")}</ModalHeader>
            <ModalBody>
                <div className="shopee__description">
                    {i18next.t("shopee.account.author.modal.description")}
                </div>
                <div className="shopee__body">
                  <AvForm autoComplete="off">
                    <AvRadioGroup
                        value={branchId}
                        className="branch-type"
                        onClick={this.selectedOnBranch}
                        name="branchModal">
                          <>
                          {this.state.branches.map( (branch) => {
                            const label = `${branch.name} - ${branch.address}`
                              return (<AvRadio
                                  customInput
                                  label={label}
                                  value={branch.id}
                              />);
                          })}
                          </>
                    </AvRadioGroup>
                  </AvForm>
                </div>
            </ModalBody>
            <ModalFooter>
                <GSButton success onClick={this.onFinish}>
                    <Trans i18nKey="common.btn.ok"/>
                </GSButton>
                {this.state.canClose && <GSButton success onClick={this.onCancel}>
                    <Trans i18nKey="common.btn.cancel"/>
                </GSButton>}
            </ModalFooter>
        </Modal>
      </div>
    );
  }
}

ModalActiveBranch.propTypes = {
};

export default ModalActiveBranch;