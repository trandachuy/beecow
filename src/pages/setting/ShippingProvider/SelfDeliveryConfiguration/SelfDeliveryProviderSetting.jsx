import React, {useEffect, useRef} from "react";
import i18next from "i18next";
import ConfirmModal from "../../../../components/shared/ConfirmModal/ConfirmModal";
import {UikToggle} from "../../../../@uik";
import GSTrans from "../../../../components/shared/GSTrans/GSTrans";
import Constants from "../../../../config/Constant";
import PropTypes from "prop-types";
import GSButton from "../../../../components/shared/GSButton/GSButton";
import styled from "styled-components";
import {md, xs} from "../../../../utils/styled-breakpoints";

/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 27/10/2021
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/

const ShippingProviderBody = styled.div.attrs(props => ({
    enabled: props.enabled,
    className: props.className
}))`
  padding: 20px;
  display: ${props => props.enabled? 'flex':'none'};
  align-items: center;
  justify-content: space-between;
  
  ${xs} {
    align-items: flex-start;
  }
`

const SelfDeliveryProviderSetting = props => {
    const refConfirmModal = useRef(null);
    /**
     * @type {SelfDeliverySummaryVM}
     */
    const setting = props.setting


    useEffect(() => {
        return () => {

        };
    }, []);


    const onChangeEnable = (checked) => {
        if (!checked) {
            refConfirmModal.current.openModal({
                messages: i18next.t('page.setting.shippingAndPayment.disableProviderConfirm'),
                okCallback: () => {
                    props.onChangeEnable(checked, props.name)
                },
                cancelCallback: () => {

                }
            })
        } else {
            props.onChangeEnable(checked, props.name)
        }
    }




    return (
        <>
            <ConfirmModal ref={refConfirmModal}/>
            <div className="shipping__provider-wrapper mb-3" id={'provider-' + props.name}>
                <div className="shipping__provider-header d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center">
                        <img className="shipping__provider-image"
                             src={props.img}
                             alt={props.name}
                             height={props.title? '20':'50'}
                        />
                        {props.title && <h3 className="mb-0 ml-2">{props.title}</h3>}
                    </div>
                    <div onClick={() => onChangeEnable(!setting.enabled)}>
                        <UikToggle
                            checked={setting.enabled}
                            className="m-0 p-0"
                            key={'selfDeliveryStt' + setting.enabled}
                            onClick={(e) => e.preventDefault()}
                        />
                    </div>

                </div>
               <ShippingProviderBody enabled={setting.enabled} className="flex-column flex-md-row">
                   <span style={{
                       color: '#7A7A7A'
                   }}>
                        {setting.locationCount > 0 &&
                            <GSTrans t="page.setting.shipping.selfDelivery.locationAndRate" values={{
                                locationCount: setting.locationCount,
                                rateCount: setting.rateCount
                            }}>
                                <strong>locationCount</strong> location(s), <strong>rateCount</strong> rate(s)
                            </GSTrans>
                        }

                    </span>
                   <em style={{
                       color: '#7A7A7A'
                   }}>
                       {setting.locationCount === 0 &&
                           <GSTrans t="page.setting.shipping.selfDelivery.hasNoLocation"/>
                       }
                   </em>
                   <GSButton success className="mt-3 mt-md-0" onClick={props.onConfiguration}>
                       <GSTrans t="page.setting.shipping.selfDelivery.btn.configFee"/>
                   </GSButton>
               </ShippingProviderBody>
            </div>
        </>
    )
}


SelfDeliveryProviderSetting.propTypes = {
    img: PropTypes.string,
    title: PropTypes.string,
    name: PropTypes.oneOf(Object.values(Constants.LogisticCode.Common)),
    setting: PropTypes.object,
    onConfiguration: PropTypes.func,
}

export default SelfDeliveryProviderSetting;