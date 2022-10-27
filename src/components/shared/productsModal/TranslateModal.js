import React, {useEffect, useRef, useState} from 'react';
import ReactDOM from 'react-dom';
import './TranslateModal.sass'
import {Modal, ModalBody, ModalFooter, ModalHeader} from 'reactstrap';
import GSButton from '../../../components/shared/GSButton/GSButton';
import {Trans} from 'react-i18next';
import {UikSelect} from '../../../@uik';
import {AvForm} from 'availity-reactstrap-validation';
import GSTrans from '../../../components/shared/GSTrans/GSTrans';
import storeService from '../../../services/StoreService';
import {GSToast} from '../../../utils/gs-toast';
import PropTypes from 'prop-types';
import InformationTranslateElement from './shared/InformationTranslateElement';
import SEOTranslateElement from './shared/SEOTranslateElement';
import i18next from 'i18next';
import ConfirmModal from '../ConfirmModal/ConfirmModal';

const translateModalRoot = document.getElementById('translate-modal-root');

function TranslateModal(props) {
    const refForm = useRef(null);
    const { onDataFormSubmit, onDataLanguageChange, languages } = props;

    const [modal, setModal] = useState(false);
    const [stLanguages, setStLanguages] = useState([]);
    const [stDefaultLanguages, setStDefaultLanguages] = useState(null);
    const [stCurrentLangCode, setStCurrentLangCode] = useState(null);
    const refConfirmModal = useRef(null);
    const [stCheckCancelHint, SetStCheckCancelHint] = useState(false);


    useEffect(() => {
        if (!modal || !stLanguages.length) {
            return
        }

        handleSelectedLanguages({
            data: stLanguages[0] // FIXME: this could not be matched when BlogArticleEditorForm fetches content
        })
    }, [modal, stLanguages])

    useEffect(() => {
        if (languages?.length) {
            setStLanguages(languages);
        } else {
            storeService.getLanguages({ hasInitial: false })
                .then(result => {
                    if (result) {
                        setStLanguages(result)
                    }
                })
                .catch(GSToast.commonError);
        }
    }, [languages])

    const handleChangeLanguages = (e) => {
        const prevChangeValues = refForm.current ? refForm.current.getValues() : {};
        setStDefaultLanguages(e.data.id)
        setStCurrentLangCode(e.data.langCode)
        onDataLanguageChange(e.data, prevChangeValues)
    }

    const handleSelectedLanguages = (e) => {
        if (stCheckCancelHint) {
            if (_.isEmpty(refForm.current.state.touchedInputs)) {
                return handleChangeLanguages(e)
            }

            return refConfirmModal.current.openModal({
                messages: i18next.t('component.product.addNew.cancelHint'),
                okCallback: () => handleChangeLanguages(e)

            })
        }

        handleChangeLanguages(e)
        SetStCheckCancelHint(true)
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
        SetStCheckCancelHint(false)
        setModal(!modal)
    };

    const renderModal = () => {
        const modalNode = (
            <Modal isOpen={ modal } toggle={ toggle } className="product-translate" size={ props.size || '' }>
                <ModalHeader toggle={ toggle }>
                    <div className="product-translate__titleHeader">
                        <p>{ i18next.t('common.btn.editTranslation') }</p>
                        <div style={ {
                            width: '150px'
                        } }>
                            {
                                stLanguages.length &&
                                <UikSelect
                                    className="w-100"
                                    value={ [{ value: stDefaultLanguages }] }
                                    options={ stLanguages.map(item => (
                                        {
                                            data: item,
                                            value: item.id,
                                            label: (
                                                <span>
                                                    <Trans i18nKey={ `page.setting.languages.${ item.langCode }` }/>
                                                </span>
                                            )
                                        })) }
                                    onChange={ e => {
                                        handleSelectedLanguages(e)
                                    } }
                                />
                            }
                        </div>
                    </div>
                </ModalHeader>
                {/*force avform get new UI when avfield key changed*/ }
                <AvForm onValidSubmit={ handleValidSubmit }
                        key={ 'frm-' + stCurrentLangCode }
                        autoComplete="off"
                        ref={ refForm }>
                    <ModalBody>
                        { props.children }
                    </ModalBody>
                    <ModalFooter>
                        <GSButton default onClick={ onClickCancel } key={ 'btn-cancel-' + stCurrentLangCode }>
                            <GSTrans t={ 'common.btn.cancel' }/>
                        </GSButton>
                        <GSButton success marginLeft key={ 'btn-add-' + stCurrentLangCode } name="submit-translate"
                                  onClick={ e => {
                                      e.preventDefault()
                                      refForm.current.submit()
                                      SetStCheckCancelHint(false)
                                  } }>
                            <GSTrans t={ 'common.btn.save' }/>
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
            <GSButton secondary outline onClick={ toggle } hidden={ !stLanguages.length }
                      style={ props.buttonTranslateStyle }>
                { i18next.t('common.btn.editTranslation') }
            </GSButton>
            <ConfirmModal ref={ refConfirmModal }/>
            { renderModal() }
        </>
    )
}

TranslateModal.defaultValue = {
    buttonTranslateStyle: {}

}

TranslateModal.propTypes = {
    onDataFormSubmit: PropTypes.func,
    onDataLanguageChange: PropTypes.func,
    onAfterSubmit: PropTypes.func,
    buttonTranslateStyle: PropTypes.object

}

TranslateModal.Information = InformationTranslateElement
TranslateModal.SEO = SEOTranslateElement

export default TranslateModal;
