import React, {useEffect, useRef, useState} from 'react';
import ReactDOM from 'react-dom';
import "./TranslateServiceModal.sass"
import {Modal, ModalBody, ModalFooter, ModalHeader} from 'reactstrap';
import GSButton from "../../../components/shared/GSButton/GSButton";
import {Trans} from "react-i18next";
import {UikSelect} from "../../../@uik";
import {AvForm} from "availity-reactstrap-validation";
import GSTrans from "../../../components/shared/GSTrans/GSTrans";
import storeService from "../../../services/StoreService";
import {GSToast} from "../../../utils/gs-toast";
import PropTypes from "prop-types";
import InformationTranslateElement from "../productsModal/shared/InformationTranslateElement";
import SEOTranslateElement from "../productsModal/shared/SEOTranslateElement";
import i18next from "i18next";

const translateModalRoot = document.getElementById('translate-modal-root');

function TranslateServiceModal(props) {
    const refForm = useRef(null);
    const { onDataFormSubmit, onDataLanguageChange, languages } = props;

    const [modal, setModal] = useState(false);
    const [stLanguages, setStLanguages] = useState([]);
    const [stCheckButton, SetStCheckButton] = useState(true);
    const [stCurrentLangCode, setStCurrentLangCode] = useState(null);

    useEffect(() => {
        if (!modal || !stLanguages.length) {
            return
        }

        handleSelectedLanguages({
            data: stLanguages[0] // FIXME: this could not be matched when BlogArticleEditorForm fetches content
        })
    }, [modal, stLanguages])

    useEffect(() => {
        storeService.getListLanguages()
            .then(result => {
                if (result.length > 1) {
                    setStLanguages(result);
                    SetStCheckButton(false)
                }
            })
            .catch(GSToast.commonError);


        if (Boolean(languages) && Boolean(languages.length)) {
            setStLanguages(languages);
        }
        else {
            storeService.getLanguages({hasInitial: false})
                .then(result => {
                    if (result) {
                        setStLanguages(result)
                    }
                })
                .catch(GSToast.commonError);
        }
    }, [])

    const handleSelectedLanguages = (e) => {
        const prevChangeValues = (refForm.current)? refForm.current.getValues():{};
        onDataLanguageChange(e.data, prevChangeValues)
        setStCurrentLangCode(e.data.langCode)
    }


    const handleValidSubmit = (event, values) => {
        onDataFormSubmit(values)
        //Don't close modal because user need to edit other language, Mr.BAO confirmed
    }

    const onClickCancel = (e) => {
        e.preventDefault(); // avoid fire submit action
        setModal(!modal)
    };

    const toggle = (e) => {
        e.preventDefault() // avoid fire submit action
        setModal(!modal)
    };

    const renderModal = () => {
        const modalNode = (
            <Modal isOpen={modal} toggle={toggle} className="product-translate" size={props.size || ''}>
                <ModalHeader toggle={toggle}>
                    <div className="product-translate__titleHeader">
                        <p>Translate</p>
                        <div style={{
                            width: "150px"
                        }}>
                            {stLanguages.length &&
                            <UikSelect
                                className='w-100'
                                defaultValue={stLanguages[0].id}
                                options={stLanguages.map(item => (
                                    {
                                        data: item,
                                        value: item.id,
                                        label: (
                                            <span>
                                                    <Trans i18nKey={`page.setting.languages.${item.langCode}`}/>
                                                </span>
                                        )
                                    }))}
                                onChange={e => handleSelectedLanguages(e)}
                            />
                            }
                        </div>
                    </div>
                </ModalHeader>
                {/*force avform get new UI when avfield key changed*/}
                <AvForm onValidSubmit={handleValidSubmit}
                        key={"frm-" + stCurrentLangCode}
                        autoComplete="off"
                        ref={refForm}>
                    <ModalBody>
                        {props.children}
                    </ModalBody>
                    <ModalFooter>
                        <GSButton default onClick={onClickCancel} key={"btn-cancel-" + stCurrentLangCode}>
                            <GSTrans t={"common.btn.cancel"}/>
                        </GSButton>
                        <GSButton success marginLeft key={"btn-add-" + stCurrentLangCode} name="submit-translate" onClick={e => {
                            e.preventDefault()
                            refForm.current.submit()
                        }}>
                            <GSTrans t={"common.btn.save"}/>
                        </GSButton>
                    </ModalFooter>
                </AvForm>

            </Modal>
        )


        return ReactDOM.createPortal(
            modalNode,
            translateModalRoot
        )
    }


    return (
        <>
            <GSButton secondary outline onClick={toggle} hidden={stCheckButton} style={props.buttonTranslateStyle}>
                {i18next.t("common.btn.editTranslation")}
            </GSButton>
            {renderModal()}
        </>
    )
}

TranslateServiceModal.defaultValue = {
    buttonTranslateStyle: {}
}

TranslateServiceModal.propTypes = {
    onDataFormSubmit: PropTypes.func,
    onDataLanguageChange: PropTypes.func,
    onAfterSubmit: PropTypes.func,
    buttonTranslateStyle: PropTypes.object,
}

TranslateServiceModal.Information = InformationTranslateElement
TranslateServiceModal.SEO = SEOTranslateElement

export default TranslateServiceModal;
