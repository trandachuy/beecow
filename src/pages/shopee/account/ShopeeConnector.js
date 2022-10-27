import React, {useEffect, useImperativeHandle, useRef, useState} from 'react';
import shopeeService from '../../../services/ShopeeService';
import PropTypes from 'prop-types';
import ModalActiveBranch from '../ShopeeModal/ModalActiveBranch';
import {RouteUtils} from '../../../utils/route';
import {NAV_PATH} from '../../../components/layout/navigation/Navigation';
import {GSToast} from '../../../utils/gs-toast';
import AlertModal, {AlertModalType} from '../../../components/shared/AlertModal/AlertModal';
import _ from 'lodash';
import i18n from '../../../config/i18n';
import storeService from '../../../services/StoreService';
import storageService from "../../../services/storage";
import Constants from "../../../config/Constant";
import ConfirmModal from "../../../components/shared/ConfirmModal/ConfirmModal";
import {NavigationPath} from "../../../config/NavigationPath";
import i18next from "i18next";

const ShopeeConnector = React.forwardRef((props, ref) => {

  const refModalBranch = useRef(null);
  const refAlertModal = useRef(null);
  const refConfirmModal = useRef(null);
  const [shopeeId, setShopeeId] = useState(null);
  const [getAuthCode, setAuthCode] = useState(null);
  const [isReAuth, setIsReAuth] = useState(null);

  useEffect(() => {
    extractShopeeId();
    return () => {};
  }, [])

  useEffect(() => {
    checkExistedShopee();
  }, [shopeeId, isReAuth])

  useEffect(() => {
    setTimeout(redirectToAccManagement, 1000);
  }, [shopeeId])

  useImperativeHandle(ref,
      () => ({
          openShopee: () => {
            getAuthorizationUrl()
          }
      })
  );

  const extractShopeeId = () => {
    const queryParams = new URLSearchParams(window.location.search);
    const shopId = queryParams.get('shop_id');
    const authCode = queryParams.get('code');
    const reAuth = queryParams.get('re_auth');
    if(shopId) {
      setShopeeId(shopId);
    }
    if(authCode){
      setAuthCode(authCode)
    }
    if (reAuth) {
      setIsReAuth(true)
    }
  }

  const redirectToAccManagement = () => {
    const isOpenBranchModal = refModalBranch.current? refModalBranch.current.state.isOpen: false;
    const isOpenAlertModal = refAlertModal.current? refAlertModal.current.state.modal: false;
    const isOpenConfirmModal = refConfirmModal.current? refConfirmModal.current.state.modal: false;

    if(!shopeeId && isOpenBranchModal === false && isOpenAlertModal === false && !isOpenConfirmModal) {
      try {
        let newProps = props || {history: []};
        RouteUtils.redirectWithoutReload(newProps, NAV_PATH.shopeeAccountManagement);
      } catch(e){}
    }
  }
  
  const obtainShopeeAccount = () => {
    const shopId = shopeeId;
    if(!_.isEmpty(shopId)) {
      storeService.getActiveStoreBranches()
      .then((data) => {
          const defBranchId = (_.isArray(data))? data[0].id: null;
          if(!_.isEmpty(defBranchId) && data.length === 1) {
            updateShopeeAccount(shopId, defBranchId);
          } else {
            refModalBranch.current.openModal({
              canClose: false,
              branches: data,
              onClickOk: function(branchId) {
                updateShopeeAccount(shopId, branchId);
              }
            });
          }
      })
      .catch(e => {
        RouteUtils.redirectWithoutReload(props, NAV_PATH.shopeeAccountManagement);
        GSToast.commonError();
      })
    }
  }

  const getAuthorizationUrl = () => {
    shopeeService.getAuhorizationUrl()
    .then(response => {
      window.location.replace(response.url);
    })
    .catch(e => {
      if (e.response.data.message === "err.param.package.plan.invalid") {
        GSToast.error(i18next.t('page.shopee.accountManagement.error'));
        return
      }
      GSToast.commonError();
    });
  }

  const checkExistedShopee = () => {
    const shopId = shopeeId;
    if(_.isEmpty(shopId)) return;
    const reconnectShopeeShopId = storageService.getFromSessionStorage(Constants.STORAGE_KEY_RECONNECT_SHOPEE_SHOP_ID);
    if (reconnectShopeeShopId) {
      if (shopId !== reconnectShopeeShopId) {
        const shopName = storageService.getFromSessionStorage(Constants.STORAGE_KEY_RECONNECT_SHOPEE_SHOP_NAME);
        refConfirmModal.current.openModal({
          messages: i18n.t("shopee.account.connector.reconnect.wrong.account", {shopName: shopName}),
          okCallback: () => {
            shopeeService.getAuhorizationUrl(true)
                .then(response => {
                  window.location.replace(response.url);
                })
          },
          cancelCallback: () => {
            RouteUtils.redirectWithoutReload(props, NavigationPath.shopeeAccountManagement)
          }
        })

      } else {
        shopeeService.postAuthorization(shopId, getAuthCode, true)
            .then(() => {
              storageService.removeSessionStorage(Constants.STORAGE_KEY_RECONNECT_SHOPEE_SHOP_ID);
              storageService.removeSessionStorage(Constants.STORAGE_KEY_RECONNECT_SHOPEE_SHOP_NAME);
              storageService.removeSessionStorage(Constants.STORAGE_KEY_RECONNECT_SHOPEE_BRANCH_ID);
              RouteUtils.redirectWithoutReload(props, NAV_PATH.shopeeAccountManagement);
            });
      }
    } else {
      shopeeService.findExistedShopeeId(shopId)
          .then((shop) => {
            if (shop.id !== undefined && shop.id !== null) {
              let title = i18n.t("shopee.account.connector.modal.title");
              let message = i18n.t("shopee.account.connector.modal.message.existed");
              let alertType = AlertModalType.ALERT_TYPE_SUCCESS;
              refAlertModal.current.openModal({
                type: alertType,
                title: title,
                messages: message,
                modalBtn: i18n.t("common.btn.ok"),
                closeCallback: function () {
                  RouteUtils.redirectWithoutReload(props, NAV_PATH.shopeeAccountManagement);
                }
              });
            } else {
              shopeeService.postAuthorization(shopId, getAuthCode).then(() => {
                obtainShopeeAccount();
              }).catch(error => console.log(error));
            }
          })
          .catch((e) => {
            console.error(e);
            RouteUtils.redirectWithoutReload(props, NAV_PATH.shopeeAccountManagement);
          })
    }
  }

  const updateShopeeAccount = async (shopId, branchId) => {
    try {
       await shopeeService.putAuthorization(shopId, branchId);
    } catch(e){
      console.error(e);
      GSToast.commonError();
    } finally {
      RouteUtils.redirectWithoutReload(props, NAV_PATH.shopeeAccountManagement);
    }
  }

  return (
    <div>
      <ConfirmModal ref={refConfirmModal}/>
      <ModalActiveBranch ref={refModalBranch}/>
      <AlertModal ref={refAlertModal} />
    </div>
  );
});

ShopeeConnector.propTypes = {
  complete: PropTypes.func,
}

export default ShopeeConnector;
