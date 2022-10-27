/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 16/06/2020
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import React, {useContext, useEffect, useState} from "react";
import "./MarketingEmailCampaignEditorSetting.sass";
import GSTrans from "../../../../../components/shared/GSTrans/GSTrans";
import {AvField} from "availity-reactstrap-validation";
import i18next from "i18next";
import {FormValidate} from "../../../../../config/form-validate";
import GSButton from "../../../../../components/shared/GSButton/GSButton";
import CustomerSegmentModal from "../../../../../components/shared/CustomerSegmentModal/CustomerSegmentModal";
import GSFakeLink from "../../../../../components/shared/GSFakeLink/GSFakeLink";
import GSActionButton, {GSActionButtonIcons,} from "../../../../../components/shared/GSActionButton/GSActionButton";
import MarketingEmailCampaignEditorTemplatesModal, {MailTemplatePreview,} from "../template-modal/MarketingEmailCampaignEditorTemplatesModal";
import {MarketingEmailCampaignEditorContext} from "../context/MarketingEmailCampaignEditorContext";
import {MarketingEmailCampaignEnum} from "../../MarketingEmailCampaignEnum";
import PropTypes from 'prop-types'
import {MailService} from "../../../../../services/MailService";

const MAIL_TO_VALUE = {
  EMAIL_ADDRESS: "EMAIL_ADDRESS",
  CUSTOMER_SEGMENTS: "CUSTOMER_SEGMENTS",
};
const MarketingEmailCampaignEditorSetting = (props) => {
  const { state, dispatch } = useContext(
    MarketingEmailCampaignEditorContext.context
  );

  const [stIsShowCustomerModal, setStIsShowCustomerModal] = useState(false);
  const [stSelectedCustomerList, setStSelectedCustomerList] = useState([]);
  const [stSelectedMailTo, setStSelectedMailTo] = useState(
      props.model? props.model.campaignEmailTo:MAIL_TO_VALUE.EMAIL_ADDRESS
  );
  const [stShowTemplateModal, setStShowTemplateModal] = useState(false);

  useEffect(() => {
    if (props.mode === MarketingEmailCampaignEnum.PAGE_MODE.EDIT && props.model.segmentIds) {
      const selectedList = props.model.segmentIds.split(',').map(id => ({
        id: parseInt(id)
      }))
      setStSelectedCustomerList(selectedList)
    }
  }, []);

  const calculateTotalUser = () => {
    if (props.mode === MarketingEmailCampaignEnum.PAGE_MODE.EDIT && props.model.segmentIds && stSelectedCustomerList[0] && !stSelectedCustomerList[0].userCount) {
      return props.totalCustomer
    }

    return stSelectedCustomerList.length > 0? stSelectedCustomerList
            .map((item) => item.userCount)
            .reduce((a, b) => a + b)
        : 0
  }

  const onChangeMailTo = (e) => {
    const { value } = e.currentTarget;
    switch (value) {
      case "customerSegments":
        setStIsShowCustomerModal(true);
    }
    setStSelectedMailTo(value);
  };

  const onCloseCustomerSegment = (customerSegment) => {
    if (customerSegment) {
      setStSelectedCustomerList(customerSegment);
    }
    setStIsShowCustomerModal(false);
  };

  const onRemoveAllSegment = () => {
    setStSelectedCustomerList([]);
  };

  const toggleShowTemplateModal = (e) => {
    if (e) {
      e.preventDefault();
    }
    setStShowTemplateModal((state) => !state);
  };

  const onSelectTemplate = (mailTemplate) => {
    dispatch(
      MarketingEmailCampaignEditorContext.actions.setCurrentMailTemplate(
        mailTemplate
      )
    );
    dispatch(
      MarketingEmailCampaignEditorContext.actions.setSelectedElement(null)
    );
    toggleShowTemplateModal();
  };

  return (
    <>
      {stIsShowCustomerModal && (
        <CustomerSegmentModal
          onClose={onCloseCustomerSegment}
          selectedItems={stSelectedCustomerList}
        />
      )}
      <MarketingEmailCampaignEditorTemplatesModal
        isOpen={stShowTemplateModal}
        onClose={toggleShowTemplateModal}
        onSelect={onSelectTemplate}
      />
      <div className="marketing_email_campaign_editor_setting gs-atm__scrollbar-1">
        <h5 className="text-left font-size-1rem">
          <GSTrans t="page.marketing.email.editor.campaignInfo" />
        </h5>
        <hr />
        <AvField
          name="campaignName"
          label={i18next.t("page.marketing.email.table.campaignName")}
          validate={{
            ...FormValidate.required(),
            ...FormValidate.maxLength(200),
          }}
          placeholder={i18next.t("page.marketing.email.table.campaignName.plh")}
        />
        <AvField
          type="textarea"
          name="campaignDescription"
          label={i18next.t("page.marketing.email.editor.campaignDescription")}
          validate={{
            ...FormValidate.maxLength(200),
          }}
          placeholder={i18next.t(
            "page.marketing.email.editor.campaignDescription.plh"
          )}
        />
        <div className="marketing_email_campaign_editor_setting__send-to-wrapper">
          <AvField
            type="select"
            name="campaignEmailTo"
            label={i18next.t("page.marketing.email.editor.to")}
            onChange={onChangeMailTo}
            defaultValue={stSelectedMailTo}
          >
            <option value={MAIL_TO_VALUE.EMAIL_ADDRESS}>
              {i18next.t("page.marketing.email.editor.sendToEmailAddress")}
            </option>
            <option value={MAIL_TO_VALUE.CUSTOMER_SEGMENTS}>
              {i18next.t("page.marketing.email.editor.sendToCustomerSegments")}
            </option>
          </AvField>

          {stSelectedMailTo === MAIL_TO_VALUE.EMAIL_ADDRESS && (
            <div className="p-2 marketing_email_campaign_editor_setting__email-to-address">
              <AvField
                name="receiver"
                placeholder={i18next.t(
                  "page.marketing.email.editor.sendToEmailAddress.plh"
                )}
                validate={{
                  ...FormValidate.email(),
                  ...FormValidate.required(),
                  ...FormValidate.async((emailAddress, ctx, input, cb) => {
                    MailService.getBlacklistDomains().then(blacklist => {
                      const atIdx = emailAddress.indexOf("@");
                      if (atIdx > 0) {
                        const domain = emailAddress.substring(atIdx + 1);
                        if (blacklist.includes(domain)) {
                          cb(i18next.t`common.validation.invalid.email2`);
                        }
                        else cb(true)
                      }
                      else cb(true)
                    })
                  })
                }}
              />
            </div>
          )}

          {stSelectedMailTo === MAIL_TO_VALUE.CUSTOMER_SEGMENTS && (
                <div className="p-2 mt-2 marketing_email_campaign_editor_setting__email-to-segment">
                  <div className=" d-flex align-items-center justify-content-between">
                    <span>
                    <GSTrans
                        t="page.marketing.email.editor.customerSummary"
                        values={{
                          segmentsLength: stSelectedCustomerList.length,
                          user: calculateTotalUser()
                        }}
                    >
                      Selected:
                      <GSFakeLink onClick={() => setStIsShowCustomerModal(true)}>
                        segmentsLength segment(s)/ user user(s)
                      </GSFakeLink>
                    </GSTrans>
                  </span>
                    {stSelectedCustomerList.length > 0 && (
                        <GSActionButton
                            onClick={onRemoveAllSegment}
                            icon={GSActionButtonIcons.CLOSE}
                            width=".8rem"
                            className="ml-2"
                        />
                    )}
                  </div>
                  <AvField
                      name="segmentIds"
                      value={stSelectedCustomerList.map(segment => segment.id).join(',')}
                  />
                </div>
          )}
        </div>
        <hr />
        <h5 className="text-left mb-0 font-size-1rem">
          <GSTrans t="page.marketing.email.editor.emailSetting" />
        </h5>
        <hr />
        <AvField
          name="title"
          label={i18next.t("page.marketing.email.editor.emailSubject")}
          validate={{
            ...FormValidate.required(),
            ...FormValidate.maxLength(200),
          }}
        />

        <hr />
        <h5 className="text-left mb-0 font-size-1rem">
          <GSTrans t="page.marketing.email.editor.emailTemplates" />
        </h5>
        <hr />
        <GSButton default className="w-100" onClick={toggleShowTemplateModal}>
          <GSTrans t="page.marketing.email.editor.chooseEmailTemplate" />
        </GSButton>

        {state.currentMailTemplate && (
          <div
            className="text-center mt-2 "
            style={{
              border: "1px solid rgb(234, 237, 243)",
              borderRadius: ".25rem",
            }}
          >
            <MailTemplatePreview mailTemplate={state.currentMailTemplate} />
          </div>
        )}
        <AvField
          name="mailId"
          value={state.currentMailTemplate ? state.currentMailTemplate.id : ""}
          validate={{
            ...FormValidate.required(
              i18next.t("page.marketing.email.editor.pleaseChooseMailTemplate")
            ),
          }}
          className="d-none"
        />
      </div>
    </>
  );
};

MarketingEmailCampaignEditorSetting.propTypes = {
  mode: PropTypes.string,
};

export default MarketingEmailCampaignEditorSetting;
