/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 16/06/2020
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import React, {useEffect, useState} from "react";
import PropTypes from "prop-types";
import "./MarketingEmailCampaignEditorTemplatesModal.sass";
import Modal from "reactstrap/es/Modal";
import ModalHeader from "reactstrap/es/ModalHeader";
import ModalBody from "reactstrap/es/ModalBody";
import GSPagination from "../../../../../components/shared/GSPagination/GSPagination";
import GSTrans from "../../../../../components/shared/GSTrans/GSTrans";
import GSActionButton, {GSActionButtonIcons,} from "../../../../../components/shared/GSActionButton/GSActionButton";
import i18next from "i18next";
import {UikSelect} from "../../../../../@uik";
import {MailService} from "../../../../../services/MailService";
import GSImg from "../../../../../components/shared/GSImg/GSImg";

const MarketingEmailCampaignEditorTemplatesModal = (props) => {
  const [stMailGroups, setStMailGroups] = useState([]);
  const [stSelectedGroupId, setStSelectedGroupId] = useState("all");
  const [stMailTemplatePaging, setStMailTemplatePaging] = useState({
    page: 0,
    totalItem: 0,
  });
  const [stMailTemplateList, setStMailTemplateList] = useState([]);
  const [stIsFetching, setStIsFetching] = useState(false);

  useEffect(() => {
    if(!props.isOpen) return
    fetchMailGroups();
    fetchMailTemplateByGroup(0);
  }, [props.isOpen]);

  useEffect(() => {
    if(!props.isOpen) return
    fetchMailTemplateByGroup(0);
  }, [stSelectedGroupId]);

  useEffect(() => {
    if(!props.isOpen) return
    fetchMailTemplateByGroup();
  }, [stMailTemplatePaging.page]);

  const fetchMailGroups = () => {
    MailService.getMailGroup().then((result) => {
      setStMailGroups(result);
    })
  };

  const fetchMailTemplateByGroup = (page) => {
    setStIsFetching(true)

    MailService.getMailTemplateByGroup(
      stSelectedGroupId === "all" ? undefined : stSelectedGroupId,
      page || stMailTemplatePaging.page
    ).then((res) => {

      setStMailTemplateList(res.data);
      setStMailTemplatePaging((state) => ({
        ...state,
        totalItem: res.totalItem,
        page: page || state.page,
      }));
    }).finally(() => {
      setStIsFetching(false)

    });
  };

  const onClose = (e) => {
    if (props.onClose) {
      props.onClose(e);
    }
  };

  const onChangeGroup = ({ label, value }) => {
    setStSelectedGroupId(value);
  };

  const renderMailTemplates = () => {
    return stMailTemplateList.map((mailTemplate) => {
      return (
        <MailTemplatePreview
          mailTemplate={mailTemplate}
          key={mailTemplate.id}
          onSelect={props.onSelect}
        />
      );
    });
  };

  const onChangePage = (page) => {
    setStMailTemplatePaging((state) => ({
      ...state,
      page: page - 1,
    }));
  };

  return (
    <Modal
      isOpen={props.isOpen}
      className="marketing_email_campaign_editor_templates_modal"
    >
      <ModalHeader className="marketing_email_campaign_editor_templates_modal__header">
        <GSTrans t="page.marketing.email.editor.chooseEmailTemplate" />
        <span>
          {stIsFetching &&
            <div className="spinner-border text-secondary spinner-border-sm mr-2" role="status">
              <span className="sr-only">Loading...</span>
            </div>
          }
          <UikSelect
            defaultValue={stSelectedGroupId}
            onChange={onChangeGroup}
            position="bottomRight"
            options={[
              {
                label: i18next.t("page.marketing.email.editor.allTemplate"),
                value: "all",
              },
              ...stMailGroups.map((group) => ({
                label: group.name,
                value: group.id,
              })),
            ]}
            style={{
              width: "400px",
            }}
          />
          <GSActionButton
            icon={GSActionButtonIcons.CLOSE}
            width={"1rem"}
            style={{ marginLeft: "1rem" }}
            onClick={() => onClose()}
          />
        </span>
      </ModalHeader>
      <ModalBody>
        <hr className="mt-0" />
        <div style={{
          overflowY: 'auto',
          maxHeight: '75vh'
        }}>
          <div className="marketing_email_campaign_editor_templates_modal__template-container">
            {renderMailTemplates()}
          </div>
        </div>
        <GSPagination
          totalItem={stMailTemplatePaging.totalItem}
          onChangePage={() => onChangePage()}
          currentPage={stMailTemplatePaging.page - 1}
        />
      </ModalBody>
    </Modal>
  );
};

export const MailTemplatePreview = ({ mailTemplate, onSelect }) => {
  const onClick = (e) => {
    if (onSelect) {
      onSelect(mailTemplate);
    }
  };

  const thumbnail = mailTemplate.thumbnail? JSON.parse(mailTemplate.thumbnail).thumbnail:''

  return (
    <div
      className="marketing_email_campaign_editor_templates_modal__template-item p-2"
      onClick={onClick}
    >
      <GSImg src={thumbnail} alt="mail-template" height="115px" style={{
        width: '100%'
      }}/>
      <strong className="pt-2 d-block">{mailTemplate.name}</strong>
      <p className="color-gray font-size-_8em ">{mailTemplate.description}</p>
    </div>
  );
};

MarketingEmailCampaignEditorTemplatesModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func,
  onSelect: PropTypes.func,
};

export default MarketingEmailCampaignEditorTemplatesModal;
