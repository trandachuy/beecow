import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import i18next from "i18next";
import React, { useEffect, useRef, useState } from "react";
import { Trans } from "react-i18next";
import { withRouter } from "react-router-dom";
import { Tooltip } from "react-tippy";
import GSImg from "../../../../src/components/shared/GSImg/GSImg.js";
import { UikWidget, UikWidgetContent, UikWidgetHeader } from "../../../@uik";
import GSContentBody from "../../../components/layout/contentBody/GSContentBody";
import GSContentContainer from "../../../components/layout/contentContainer/GSContentContainer";
import GSContentHeaderRightEl from "../../../components/layout/contentHeader/ContentHeaderRightEl/GSContentHeaderRightEl";
import GSContentHeader from "../../../components/layout/contentHeader/GSContentHeader";
import { GSLayoutCol12, GSLayoutRow } from "../../../components/layout/GSLayout/GSLayout";
import { NAV_PATH } from "../../../components/layout/navigation/Navigation";
import ConfirmModal from "../../../components/shared/ConfirmModal/ConfirmModal";
import GSActionButton, { GSActionButtonIcons } from "../../../components/shared/GSActionButton/GSActionButton";
import { GSAlertModalType } from "../../../components/shared/GSAlertModal/GSAlertModal";
import GSButton from "../../../components/shared/GSButton/GSButton";
import GSFakeLink from "../../../components/shared/GSFakeLink/GSFakeLink.js";
import GSTable from "../../../components/shared/GSTable/GSTable";
import GSTrans from "../../../components/shared/GSTrans/GSTrans";
import Constants from "../../../config/Constant";
import accountService from "../../../services/AccountService.js";
import storageService from "../../../services/storage";
import storeService from "../../../services/StoreService";
import { CredentialUtils } from "../../../utils/credential";
import { GSToast } from "../../../utils/gs-toast";
import { cancelablePromise } from "../../../utils/promise.js";
import { RouteUtils } from "../../../utils/route";
import { TokenUtils } from "../../../utils/token.js";
import LanguageModal, { LANGUAGE_MODAL_MODE } from "./LanguageModal.js";
import "./StoreLanguages.sass";

const languageOptions = [
  {
    value: "en",
    label: <span>{i18next.t("page.setting.languages.en")}</span>
  },
  {
    value: "vi",
    label: <span>{i18next.t("page.setting.languages.vi")}</span>
  },
];

const StoreLanguages = props => {
  const [modalChangeDashboardLanguage, setModalChangeDashboardLanguage] = useState(false);
  const [modalAddLanguage, setModalAddLanguage] = useState(false);
  const [showModalChageStoreLang, setShowModalChageStoreLang] = useState(false);

  const [stLanguages, setStLanguages] = useState([]);
  const [isFreePackage] = useState(!TokenUtils.hasThemeEnginePermission());
  const [storePkgExpireDate, setStorePkgExpireDate] = useState("");
  const [defaultStoreLangCode, setDefaultStoreLangCode] = useState(null);
  const [boughtLanguagePackage, setBoughtLanguagePackage] = useState(false);
  const [initialLanguage, setInitialLanguage] = useState(null);
  const [packageExpired, setPackageExpired] = useState(false);

  const [getHasCopyProgress, setHasCopyProgress] = useState(false);

  const refConfirmModal = useRef();
  const refConfirmPublishModal = useRef();
  const refConfirmDeleteModal = useRef();

  useEffect(() => {
    fetchLanguages();
    fetchDefaultStoreLangCode();
    fetchInitialLanguage();
  }, []);

  useEffect(() => {
    storeService.getBoughtPackagesByStoreId(Constants.PACKAGE_PRICE_CHANNEL.MULTI_LANGUAGE)
      .then(orderDetails => {
        if (orderDetails) {
          const expiryDate = new Date(orderDetails.expiryDate * 1000);
          setPackageExpired(expiryDate - Date.now() < 0);
          setStorePkgExpireDate(expiryDate.toLocaleDateString());
          setBoughtLanguagePackage(true);
        }
      }, GSToast.commonError);

    // get list of copy data
    storeService.getCopyLanguageInProgress().then(res => {
      if (res && res.length > 0) {
        setHasCopyProgress(true);
      }
    }).catch(e => { });

  }, []);

  useEffect(() => {
    if (packageExpired === true) {
      setStorePkgExpireDate(i18next.t("page.setting.account.expired"));
    }
  }, [packageExpired]);

  useEffect(() => {
    if (!defaultStoreLangCode && initialLanguage) {
      setDefaultStoreLangCode(initialLanguage.langCode);
    }
  }, [defaultStoreLangCode, initialLanguage]);

  const fetchLanguages = () => {
    storeService.getAllAddedLanguages().then(langs => setStLanguages(langs), GSToast.commonError);
  };

  const fetchDefaultStoreLangCode = () => {
    storeService.getDefaultStoreLanguage(CredentialUtils.getStoreId())
      .then(data => {
        if (data) {
          setDefaultStoreLangCode(data.langCode);
        }
      }, GSToast.commonError);
  };

  const fetchInitialLanguage = () => {
    storeService.getInitialLanguage(CredentialUtils.getStoreId())
      .then(initLang => {
        setInitialLanguage(initLang);
      }, GSToast.commonError);
  };

  const addLanguages = () => {
    storeService.getActiveBuyLanguages()
      .then(result => {
        if (result === null) {
          refConfirmModal.current.openModal({
            type: GSAlertModalType.ALERT_TYPE_INFO,
            messages: i18next.t("page.setting.languages.AddLanguages.description"),
            okCallback: () => RouteUtils.redirectWithoutReload(props, NAV_PATH.settingsLanguagesPlans),
            modalBtnOk: i18next.t("common.btn.buynow")
          });
        }
        else {
          setModalAddLanguage(true);
        }
      })
      .catch(() => GSToast.commonError());
  };

  const deleteLanguage = (storeLangId) => {
    const acceptDelete = () => {
      const storeId = Number.parseInt(CredentialUtils.getStoreId());
      storeService.deleteLanguage(storeId, storeLangId)
        .then(() => {
          const newStLanguages = stLanguages.filter(lang => lang.id !== storeLangId);
          setStLanguages(newStLanguages);
        })
        .catch(GSToast.commonError);
    };

    refConfirmDeleteModal.current.openModal({
      classNameHeader: "modal-danger",
      typeBtnOk: {
        size: "normal",
        color: GSButton.THEME.DANGER
      },
      modalTitle: i18next.t("page.setting.languages.confirmModal.delete.title"),
      messages: i18next.t("page.setting.languages.confirmModal.delete.description"),
      okCallback: acceptDelete
    });
  };

  const publishStoreLanguage = (storeLangId, publish) => {
    const storeId = Number.parseInt(CredentialUtils.getStoreId());
    const data = { storeId, storeLangId, publish };
    storeService.publishLanguage(data)
      .then(() => {
        const newStLanguages = stLanguages.map(lang => {
          if (lang.id === storeLangId) {
            lang.published = publish;
          }
          return lang;
        });
        setStLanguages(newStLanguages);
      })
      .catch(GSToast.commonError);
  };

  const togglePublish = (storeLangId, publish) => {
    const textKey = publish ? "publish" : "unpublish";

    refConfirmPublishModal.current.openModal({
      type: GSAlertModalType.ALERT_TYPE_SUCCESS,
      modalTitle: i18next.t(`page.setting.languages.confirmModal.${textKey}.title`),
      messages: i18next.t(`page.setting.languages.confirmModal.${textKey}.description`),
      okCallback: () => publishStoreLanguage(storeLangId, publish),
    });
  };

  const requestToCreateLanguage = (storeLang) => {
    storeService.createLanguage(storeLang)
      .then(data => {
        const newLang = {
          ...data,
          "isDefault": false,
          "published": false,
          "isInitial": false
        };
        setStLanguages([...stLanguages, newLang]);
      })
      .catch(e => {
        if (e.response.status === 409) {
          GSToast.error("page.setting.languages.langcode.already.added", true);
        }
        else {
          GSToast.commonError();
          console.error(e);
        }
      })
      .finally(() => setModalAddLanguage(false));
  };

  const requestToUpdateDefaultStoreLanguage = (storeId, storeLangId) => {
    publishStoreLanguage(storeLangId, true);
    storeService.updateDefaultStoreLanguage(storeId, storeLangId)
      .then(() => {
        setShowModalChageStoreLang(false);
        fetchLanguages();
        fetchDefaultStoreLangCode();
      }, GSToast.commonError);
  };

  const renderTableLanguages = () => stLanguages
    .sort((a, b) => (+b.published) - (+a.published)) // sort by publish true first
    .map(item => (
      <tr key={item.id} className={packageExpired && item.isInitial === false ? "disabled" : null}>
        <td className="w-50">{i18next.t(`page.setting.languages.${item.langCode}`)}</td>
        <td className="w-25">
          <GSFakeLink onClick={() => togglePublish(item.id, !item.published)}>
            {item.published === true
              ? !item.isDefault && i18next.t("page.setting.languages.unpublish")
              : i18next.t("page.setting.languages.publish")
            }
          </GSFakeLink>
        </td>
        <td className="w-25">
          {item.published === false && item.isInitial === false &&
            <GSActionButton
              icon={GSActionButtonIcons.DELETE}
              onClick={() => deleteLanguage(item.id)} />
          }
        </td>
      </tr>
    ));

  const onChangeLanguage = langKey => {
    // Update language key to server
    cancelablePromise(accountService.updateUserLanguage(langKey.langCode));
    storageService.setToLocalStorage(Constants.STORAGE_KEY_LANG_KEY, langKey.langCode);
    window.location.reload();
  };

  return (
    <>
      {modalAddLanguage && <LanguageModal
        titleI18nKey="page.setting.languages.addtitle"
        closeModal={() => setModalAddLanguage(false)}
        acceptCallback={requestToCreateLanguage}
        options={languageOptions.filter(lang => lang.value !== initialLanguage.langCode)} />}

      {showModalChageStoreLang && <LanguageModal
        titleI18nKey="page.setting.languages.changetitle"
        closeModal={() => setShowModalChageStoreLang(false)}
        acceptCallback={requestToUpdateDefaultStoreLanguage}
        mode={LANGUAGE_MODAL_MODE.CHANGE}
        options={stLanguages} />}

      {modalChangeDashboardLanguage && <LanguageModal
        titleI18nKey="page.setting.languages.changetitle"
        closeModal={() => setModalChangeDashboardLanguage(false)}
        acceptCallback={onChangeLanguage}
        options={languageOptions} />}

      <ConfirmModal ref={refConfirmModal} />
      <ConfirmModal ref={refConfirmPublishModal} />
      <ConfirmModal ref={refConfirmDeleteModal} />
      <GSContentContainer className="languages-setting">
        <GSContentHeader>
          {
            getHasCopyProgress &&
            <div className="p-3 has-init-data-language">
              {i18next.t("page.setting.languages.addLanguages.note.is.copying.data")}
              <FontAwesomeIcon className="avatar image-status__green image-rotate" icon="sync-alt" />
            </div>
          }

          <GSContentHeaderRightEl className="d-flex mr-3">
            <Tooltip
              arrow
              title={isFreePackage && i18next.t("page.setting.languages.addLanguages.disabled.hint")}
              disabled={!isFreePackage}>
              <GSButton
                success
                disabled={isFreePackage || packageExpired}
                onClick={addLanguages}>
                <GSTrans t={"page.setting.languages.addtitle"} />
              </GSButton>
            </Tooltip>
          </GSContentHeaderRightEl>
        </GSContentHeader>
        <GSContentBody className="mt-3 p-3">
          <GSLayoutRow>
            <GSLayoutCol12 className="p-0 col-md-5">
              <span className="left-title">
                <p className="title">
                  <Trans i18nKey="page.setting.languages.titlestore" />
                </p>
                <p className="description pr-5">
                  <Trans i18nKey="page.setting.languages.descriptionstore" />
                </p>
              </span>
            </GSLayoutCol12>
            <GSLayoutCol12 className="p-0 col-md-7">
              <UikWidget className="gs-widget m-0">
                <UikWidgetContent className="gs-widget__content body pl-4">
                  <div className="box-1">
                    <span className="box-title">
                      <p className="title">
                        {i18next.t(`page.setting.languages.${defaultStoreLangCode}`)}
                      </p>
                      <p className="description">
                        <Trans i18nKey="page.setting.languages.rightstore" />
                      </p>
                    </span>
                    <GSButton dark disabled={packageExpired} onClick={() => setShowModalChageStoreLang(true)}>
                      <GSTrans t={"page.setting.languages.changetitle"} />
                    </GSButton>
                  </div>
                </UikWidgetContent>
              </UikWidget>
            </GSLayoutCol12>
          </GSLayoutRow>
          <GSLayoutRow className="pt-5">
            <GSLayoutCol12 className="p-0 col-md-5">
              <span className="left-title">
                <p className="title">
                  <Trans i18nKey="page.setting.languages.titletrans" />
                </p>
                <p className="description pr-5">
                  <Trans i18nKey="page.setting.languages.descriptiontrans" />
                </p>
              </span>
            </GSLayoutCol12>
            <GSLayoutCol12 className="p-0 col-md-7">
              <UikWidget className="gs-widget m-0 boxright-2 pl-2">
                {isFreePackage || !boughtLanguagePackage
                  ? (
                    <div className="d-flex flex-column align-items-center m-3">
                      <GSImg className="d-inline-block m-3" src="/assets/images/iconno_language.svg" />
                      <GSTrans className="d-inline-block" t="page.setting.languages.noLanguages" />
                    </div>
                  )
                  : (<>
                    <UikWidgetHeader className="gs-widget__header">
                      <p className="title-multi">
                        <Trans i18nKey="page.setting.languages.titlemultiple" />
                      </p>
                      <div className="box2-right">
                        <span className="title-date pr-3">
                          <p className="title">
                            {packageExpired
                              ? <Trans i18nKey="page.setting.account.expired" />
                              : <>
                                  <Trans i18nKey="page.setting.languages.titledate" />
                                  &nbsp;
                                  <span>{storePkgExpireDate}</span>
                                </>
                            }
                          </p>
                        </span>
                        <GSButton success onClick={() => RouteUtils.redirectWithoutReloadWithData(props, NAV_PATH.settingsLanguagesPlans)}>
                          <GSTrans t={"page.setting.languages.renew"} />
                        </GSButton>
                      </div>
                    </UikWidgetHeader>
                    <UikWidgetContent
                      className="gs-widget__content body">

                      <div className="branch-list-desktop d-mobile-none d-desktop-flex">
                        <GSTable>
                          <tbody>
                            {renderTableLanguages()}
                          </tbody>
                        </GSTable>
                      </div>

                    </UikWidgetContent>
                  </>)
                }
              </UikWidget>
            </GSLayoutCol12>
          </GSLayoutRow>
          {/*<GSLayoutRow className="pt-5">*/}
          {/*  <GSLayoutCol12 className="p-0 col-md-5">*/}
          {/*    <span className="left-title">*/}
          {/*      <p className="title">*/}
          {/*        <Trans i18nKey="page.setting.languages.titledash" />*/}
          {/*      </p>*/}
          {/*      <p className="description pr-5">*/}
          {/*        <Trans i18nKey="page.setting.languages.descriptiondash" />*/}
          {/*      </p>*/}
          {/*    </span>*/}
          {/*  </GSLayoutCol12>*/}
          {/*  <GSLayoutCol12 className="p-0 col-md-7">*/}
          {/*    <UikWidget className="gs-widget m-0">*/}
          {/*      <UikWidgetContent className="gs-widget__content body pl-4">*/}
          {/*        <div className="box-1">*/}
          {/*          <span className="box-title">*/}
          {/*            <p className="title">*/}
          {/*              {i18next.t(`page.setting.languages.${i18next.language}`)}*/}
          {/*            </p>*/}
          {/*            <p className="description pr-5">*/}
          {/*              <Trans i18nKey="page.setting.languages.rightdash" />*/}
          {/*            </p>*/}
          {/*          </span>*/}
          {/*          <GSButton dark onClick={() => setModalChangeDashboardLanguage(true)}>*/}
          {/*            <GSTrans t={"page.setting.languages.changetitle"} />*/}
          {/*          </GSButton>*/}
          {/*        </div>*/}
          {/*      </UikWidgetContent>*/}
          {/*    </UikWidget>*/}
          {/*  </GSLayoutCol12>*/}
          {/*</GSLayoutRow>*/}
        </GSContentBody>
      </GSContentContainer>
    </>
  );
};

export default withRouter(StoreLanguages);
