import React, {useEffect, useMemo, useRef, useState} from 'react';
import {bool, func, oneOf, shape} from 'prop-types';
import ModalHeader from 'reactstrap/es/ModalHeader';
import GSTrans from '../GSTrans/GSTrans';
import ModalBody from 'reactstrap/es/ModalBody';
import ModalFooter from 'reactstrap/es/ModalFooter';
import GSButton from '../GSButton/GSButton';
import Modal from 'reactstrap/es/Modal';
import {UikSelect, UikToggle} from '../../../@uik';
import {
    KEY_PRINT_A4,
    KEY_PRINT_K57,
    KEY_PRINT_K80
} from '../../../pages/order/instorePurchase/complete/OrderInStorePurchaseComplete';
import i18next from 'i18next';

import './GSSelectPrintSizeModal.sass'
import Label from 'reactstrap/es/Label';
import {Trans} from 'react-i18next';
import {AvField, AvForm, AvRadio, AvRadioGroup} from 'availity-reactstrap-validation';
import AvFieldCountable from '../form/CountableAvField/AvFieldCountable';
import {CredentialUtils} from '../../../utils/credential';
import AvCheckbox from 'availity-reactstrap-validation/lib/AvCheckbox'
import AvCheckboxGroup from 'availity-reactstrap-validation/lib/AvCheckboxGroup'
import Constants from '../../../config/Constant'

const SUPPORT_LANGUAGE = [Constants.LanguageKey.VIETNAMESE, Constants.LanguageKey.ENGLISH]

const GSSelectPrintSizeModal = props => {
    const {
        printA4Template,
        isToggle,
        selectedPrintSize,
        selectedLanguage,
        config,
        onClose,
        onPrint
    } = props

    const MEMO_LANGUAGE_OPTIONS = useMemo(() => SUPPORT_LANGUAGE.map(langKey => ({
        label: i18next.t(`page.setting.languages.${ langKey }`),
        value: langKey
    })), [])

    const [stSelectedLanguage, setStSelectedLanguage] = useState(Constants.LanguageKey.VIETNAMESE)
    const [stSelectedPrintSize, setStSelectedPrintSize] = useState(KEY_PRINT_K80)
    const [stAdditionalInformation, setStAdditionalInformation] = useState('')
    const [stCustomContent, setStCustomContent] = useState([
        {
            name: 'storeInformation',
            allow: true,
            check: true
        }, {
            name: 'orderInformation',
            allow: true,
            check: true
        }, {
            name: 'customerInformation',
            allow: true,
            check: true
        }, {
            name: 'orderSummary',
            allow: true,
            check: true
        }, {
            name: 'deliveryInformation',
            allow: true,
            check: true
        }, {
            name: 'serviceProviderName',
            allow: true,
            check: true
        }, {
            name: 'orderNote',
            allow: true,
            check: true
        }
    ])

    const [isCheckCustomContent, setIsCheckCustomContent] = useState(false)
    const [stPrintEnabled, setPrintEnabled] = useState(false)
    const refPrintReceiptModal = useRef()

    useEffect(() => {
        if (!isToggle) {
            return
        }

        if (!config.saveLocalStorage) {
            return
        }

        const data = CredentialUtils.getPrintSizeData(config.localStorageKey)

        if (!data) {
            return
        }

        const {
            languageSelect,
            printSizeRadioGroup,
            additionalInformation,
            printEnabled,
            ...rest
        } = data

        setStSelectedLanguage(languageSelect || selectedLanguage)
        setStSelectedPrintSize(printSizeRadioGroup)
        setPrintEnabled(printEnabled)
        setStCustomContent(contents => contents.map(c => {
            if (rest.hasOwnProperty(c.name)) {
                c.check = rest[c.name]
            }

            return c
        }))
        setStAdditionalInformation(additionalInformation)
    }, [isToggle, selectedLanguage])

    useEffect(() => {
        if (!selectedPrintSize) {
            return
        }

        setStSelectedPrintSize(selectedPrintSize)
    }, [selectedPrintSize])

    useEffect(() => {
        if (stCustomContent.every(element => !element.check)) {
            setIsCheckCustomContent(true)
        } else {
            setIsCheckCustomContent(false)
        }
    }, [stCustomContent])

    const toggle = () => {
        onClose()
    }

    const handleValidSubmit = (e, data) => {
        onPrint(data)
        if (config.saveLocalStorage) {
            CredentialUtils.setPrintSizeData(config.localStorageKey, data)
        }
    }

    const handleCheckCustomContent = e => {
        const { checked, name } = e.target;

        setStCustomContent(contents => contents.map(content => {
            if (content.name === name && content.allow) {
                content.check = checked
            }

            return content
        }))
    }

    const togglePrintEnabled = (e) => {
        const checked = e.target.checked
        setPrintEnabled(checked)
    }

    return (
        <Modal isOpen={ isToggle } toggle={ toggle } className="gs-select-print-size-modal">
            <ModalHeader toggle={ toggle }>
                <Trans i18nKey="page.order.detail.btn.print.order_receipt"></Trans>
            </ModalHeader>
            <ModalBody>
                <AvForm autoComplete="off" className="d-flex text-left"
                        onValidSubmit={ handleValidSubmit } ref={ ref => refPrintReceiptModal.current = ref }>
                    <div className={['d-flex flex-column w-100', config.localStorageKey === 'POS' ? 'modalPrintPos' : ''].join(' ')}>
                        {
                            config.localStorageKey === 'POS' &&
                            <>
                                <div className="section-wrapper align-items-center">
                                    <Label className="gs-frm-control__title">
                                        <GSTrans t="page.order.create.printOrder"/>
                                    </Label>
                                    <UikToggle
                                        name="printEnabled"
                                        className="print-order__toggle"
                                        checked={ stPrintEnabled }
                                        onChange={ (e) => togglePrintEnabled(e) }
                                    />
                                    <AvField
                                        hidden
                                        name="printEnabled"
                                        value={ stPrintEnabled }
                                    />
                                </div>
                            </>
                        }
                        <div className="section-wrapper align-items-center">
                            <Label className="gs-frm-control__title">
                                <GSTrans t="page.order.list.modal.orderReceipt.language"/>
                            </Label>
                            <UikSelect
                                key={ stSelectedLanguage }
                                className="w-100"
                                defaultValue={ stSelectedLanguage }
                                options={ MEMO_LANGUAGE_OPTIONS }
                                placeholder={ i18next.t('common.text.selectLanguage') }
                                onChange={ ({ value }) => setStSelectedLanguage(value) }
                            />
                            <AvField
                                hidden
                                name="languageSelect"
                                value={ stSelectedLanguage }
                            />
                        </div>
                        <div className="section-wrapper align-items-center">
                            <Label className="gs-frm-control__title">
                                <GSTrans t="page.order.list.modal.orderReceipt.paperSize"/>
                            </Label>
                            <AvRadioGroup
                                name="printSizeRadioGroup"
                                className="size-wrapper"
                                value={ stSelectedPrintSize }>
                                <AvRadio customInput
                                         className="font-weight-500 mt-2"
                                         label={ i18next.t('page.order.create.complete.print.size.K57') }
                                         value={ KEY_PRINT_K57 }/>
                                <AvRadio customInput
                                         className="font-weight-500 mt-2"
                                         label={ i18next.t('page.order.create.complete.print.size.K80') }
                                         value={ KEY_PRINT_K80 }/>
                                { printA4Template && <AvRadio customInput
                                                              className="font-weight-500 mt-2"
                                                              label={ i18next.t('page.order.create.complete.print.size.A4') }
                                                              value={ KEY_PRINT_A4 }/> }
                            </AvRadioGroup>
                        </div>
                        {
                            config.showCustomContent && <div className="section-wrapper">
                                <Label className="gs-frm-control__title">
                                    <GSTrans t="page.order.list.modal.orderReceipt.customContent"/>
                                </Label>
                                <div className="box-custom-content">
                                    <AvCheckboxGroup name="customContent" className="custom-content-wrapper">
                                        {
                                            stCustomContent.map(({ name, allow, check }, index) => {
                                                return (
                                                    <>
                                                        <div className="box-check-content" key={index}>
                                                            <AvCheckbox
                                                                key={ name }
                                                                customInput
                                                                disabled={ !allow }
                                                                id={ name }
                                                                name={ name }
                                                                label={ i18next.t(`page.order.list.modal.orderReceipt.${ name }`) }
                                                                checked={ check }
                                                                onChange={ handleCheckCustomContent }
                                                            />
                                                            <p>{ i18next.t(`page.order.list.modal.orderReceipt.content.${ name }`) }</p>
                                                        </div>
                                                    </>
                                                )
                                            })
                                        }
                                    </AvCheckboxGroup>
                                    {
                                        isCheckCustomContent &&
                                        <span
                                            className="title-error">{ i18next.t(`page.order.list.modal.orderReceipt.content.error`) }</span>
                                    }
                                </div>
                                {
                                    // Need to get data for submit
                                    stCustomContent.map(({ name, check }) => <AvField
                                        hidden
                                        name={ name }
                                        value={ check }
                                    />)
                                }
                            </div>
                        }

                        <div className="section-wrapper">
                            <Label for="additionalInformation" className="gs-frm-control__title">
                                <Trans i18nKey="page.order.create.print.additional.title">
                                    Additional Information
                                </Trans>
                            </Label>
                            <AvFieldCountable
                                classNameWrapper="w-100"
                                name="additionalInformation"
                                type="textarea"
                                minLength={ 0 }
                                maxLength={ 500 }
                                rows={ 3 }
                                placeholder={ i18next.t('page.order.create.print.additional.placeholder') }
                                value={ stAdditionalInformation }
                            />
                        </div>
                    </div>
                </AvForm>
            </ModalBody>
            <ModalFooter>
                <GSButton default onClick={ toggle }>
                    <GSTrans t={ 'common.btn.cancel' }/>
                </GSButton>
                <GSButton success marginLeft onClick={ () => refPrintReceiptModal.current.submit() }
                          disabled={ isCheckCustomContent }>
                    <GSTrans t={ 'common.btn.ok' }/>
                </GSButton>
            </ModalFooter>
        </Modal>
    );
};

GSSelectPrintSizeModal.defaultProps = {
    isToggle: false,
    selectedPrintSize: KEY_PRINT_K80,
    selectedLanguage: Constants.LanguageKey.VIETNAMESE,
    config: {
        showCustomContent: false,
        saveLocalStorage: false
    },
    onClose: () => {
    },
    onPrint: () => {
    }
}

GSSelectPrintSizeModal.LOCAL_STORAGE_KEY = Constants.PRINT_SIZE_DATA_LOCAL_STORAGE_KEY

GSSelectPrintSizeModal.propTypes = {
    isToggle: bool,
    selectedPrintSize: oneOf([KEY_PRINT_A4, KEY_PRINT_K80, KEY_PRINT_K57]),
    selectedLanguage: oneOf(SUPPORT_LANGUAGE),
    config: shape({
        showCustomContent: bool,
        saveLocalStorage: bool,
        localStorageKey: oneOf(Object.values(Constants.PRINT_SIZE_DATA_LOCAL_STORAGE_KEY))
    }),
    onClose: func,
    onPrint: func
}

export default GSSelectPrintSizeModal;
