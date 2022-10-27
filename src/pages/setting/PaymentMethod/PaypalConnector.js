import React, {useEffect, useImperativeHandle, useRef} from 'react';
import PropTypes from 'prop-types';
import {RouteUtils} from '../../../utils/route';
import {NAV_PATH} from '../../../components/layout/navigation/Navigation';
import AlertModal from '../../../components/shared/AlertModal/AlertModal';
import _ from 'lodash';
import paymentService from '../../../services/PaymentService';

const PaypalConnector = React.forwardRef((props, ref) => {

  const refAlertModal = useRef(null);

  useEffect(() => {
    updateConnect();
    return () => {};
  }, [])

  useImperativeHandle(ref,
      () => ({
          connectPaypal: async () => {
            return await paymentService.getPaypalConnectUrl();
          }
      })
  );

  const updateConnect = () => {
    const queryParams = new URLSearchParams(window.location.search);
    const trackingId = queryParams.get('merchantId');
    const merchantId = queryParams.get('merchantIdInPayPal');
    const permissionsGranted = queryParams.get('permissionsGranted');
    const consentStatus = queryParams.get('consentStatus');
    const isEmailConfirmed = queryParams.get('isEmailConfirmed');
    const accountStatus = queryParams.get('accountStatus');
    if(merchantId && trackingId){
      updatePaypalInfo({merchantId, trackingId, permissionsGranted, consentStatus, isEmailConfirmed, accountStatus});
      setTimeout(() => RouteUtils.redirectWithoutReload(props, `${NAV_PATH.settings}?tabId=2`), 3000);
    }
  }

  const updatePaypalInfo = async (data) => {
    try {
       await paymentService.updatePaymentPaypal(data);
    }
    catch(e){
    }
  }

  return (
    <div>
      <AlertModal ref={refAlertModal} />
    </div>
  );
});

PaypalConnector.propTypes = {
  complete: PropTypes.func,
}

export default PaypalConnector;
