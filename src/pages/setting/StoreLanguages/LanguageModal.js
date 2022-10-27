import { AvForm } from "availity-reactstrap-validation";
import i18next from "i18next";
import React, { useEffect, useState } from 'react';
import { Trans } from "react-i18next";
import { Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";
import { UikSelect } from "../../../@uik";
import GSButton from "../../../components/shared/GSButton/GSButton";
import GSTrans from "../../../components/shared/GSTrans/GSTrans";
import { CredentialUtils } from "../../../utils/credential";
import "./StoreLanguages.sass";

export const LANGUAGE_MODAL_MODE = {
  ADD: "ADD",
  CHANGE: "CHANGE"
};

export default function LanguageModal({ titleI18nKey, closeModal, acceptCallback, mode = LANGUAGE_MODAL_MODE.ADD, options }) {
  const [selected, setSelected] = useState(null);
  const [stOptions, setStOptions] = useState([]);

  useEffect(() => {
    if (mode === LANGUAGE_MODAL_MODE.CHANGE) {
      const mappedOptions = options.map(option => {
        const i18nextLanguage = i18next.t(`page.setting.languages.${option.langCode}`);
        const labelText = option.isDefault
          ? i18nextLanguage + " - " + i18next.t("common.txt.default")
          : i18nextLanguage;

        return ({
          label: <span>{labelText}</span>,
          value: option.id
        });
      });

      setStOptions(mappedOptions);
    }
    else {
      setStOptions(options);
    }
  }, [options, mode]);

  const onAccept = () => {
    if (!Boolean(selected)) {
      return;
    }

    if (mode === LANGUAGE_MODAL_MODE.ADD) {
      const storeLang = {
        storeId: Number.parseInt(CredentialUtils.getStoreId()),
        langCode: selected.value,
      };
      acceptCallback(storeLang);
    }
    else {
      const storeId = Number.parseInt(CredentialUtils.getStoreId());
      const storeLangId = selected.value;
      acceptCallback(storeId, storeLangId);
    }
  };

  return (
    <Modal isOpen={true} toggle={closeModal} className="modal-change">
      <ModalHeader toggle={closeModal}><Trans i18nKey={titleI18nKey} /></ModalHeader>
      <ModalBody>
        <AvForm >
          <p><Trans i18nKey="page.setting.languages.languages"></Trans></p>
          <UikSelect
            className='w-100'
            options={stOptions}
            placeholder={i18next.t("common.text.selectLanguage")}
            onChange={langKey => setSelected(stOptions.find(lang => lang.value === langKey.value))}
          />
          <ModalFooter className="mt-3">
            <GSButton default onClick={closeModal}>
              <GSTrans t={"common.btn.cancel"} />
            </GSButton>
            <GSButton success marginLeft onClick={onAccept}>
              <GSTrans t={"common.btn.ok"} />
            </GSButton>
          </ModalFooter>
        </AvForm>
      </ModalBody>
    </Modal>
  );
}
