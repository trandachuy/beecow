/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 24/02/2020
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import React, {useEffect, useRef, useState} from 'react';
import PropTypes from 'prop-types';
import TranslateModal from '../../../../components/shared/productsModal/TranslateModal';
import TitleTranslate from '../../../../components/shared/productsModal/TitleTranslate';
import i18next from 'i18next';
import {AvField} from 'availity-reactstrap-validation';
import {FormValidate} from '../../../../config/form-validate';
import AvFieldCountable from '../../../../components/shared/form/CountableAvField/AvFieldCountable';
import SEOTranslateElement from '../../../../components/shared/productsModal/shared/SEOTranslateElement';
import beehiveService from '../../../../services/BeehiveService';
import {GSToast} from '../../../../utils/gs-toast';
import Constants from '../../../../config/Constant'
import {ItemUtils} from '../../../../utils/item-utils'

const BlogCategoryTranslateModal = props => {

    const [stLangCode, setStLangCode] = useState(null);
    const [stLanguagePack, setStLanguagePack] = useState([]);
    const [stCurrentLanguage, setStCurrentLanguage] = useState(null);
    const [stSEO, setStSEO] = useState({});

    const refSEOUrl = useRef()

    useEffect(() => {
        if (props.categoryId) {
            fetchCategory()
        }
    }, [props.categoryId])

    useEffect(() => {
        if (stLangCode) {
            pickCurrentLanguage(stLanguagePack)
        }
    }, [stLangCode])


    const fetchCategory = () => {
        beehiveService.getCategoryLanguages(props.categoryId)
            .then(languagePack => {
                setStLanguagePack(languagePack)
                if (!stCurrentLanguage) {
                    pickCurrentLanguage(languagePack)
                }
            })
    }

    const pickCurrentLanguage = (stLanguagePack) => {
        /**
         * @type {BlogCategoryLanguageDTOModel}
         */
        const currentLanguage = stLanguagePack.find(lang => lang.language === stLangCode)
        if (currentLanguage) {
            setStCurrentLanguage(currentLanguage);
            setStSEO({
                seoDescription: currentLanguage.seoDescription,
                seoTitle: currentLanguage.seoTitle,
                seoKeywords: currentLanguage.seoKeywords,
                seoUrl: currentLanguage.seoUrl
            })
        }

    }
    /**
     *
     * @param {StoreLanguageDTOModel} dataLang
     */
    const onDataLanguageChange = (dataLang) => {
        const currentLanguage = stLanguagePack.find(lang => lang.language === dataLang.langCode)
        if (currentLanguage) {
            setStSEO({
                seoDescription: currentLanguage.seoDescription,
                seoTitle: currentLanguage.seoTitle,
                seoKeywords: currentLanguage.seoKeywords,
                seoUrl: currentLanguage.seoUrl
            })
        }

        setStLangCode(dataLang.langCode)
    }

    const onSubmit = async (values) => {
        const isSEOUrlValidRes = refSEOUrl.current && await refSEOUrl.current.isValid()

        if (!isSEOUrlValidRes) {
            return
        }

        const requestBody = createRequestBody(values)
        await beehiveService.updateCategoryLanguages(requestBody)
        fetchCategory()
        GSToast.commonUpdate()
    }

    const createRequestBody = (values) => {
        return ([
            {
                id: stCurrentLanguage.id,
                blogCategoryId: props.categoryId,
                title: values.title,
                description: values.description,
                seoTitle: values.seoTitle,
                seoDescription: values.seoDescription,
                seoKeywords: values.seoKeywords,
                seoUrl:  ItemUtils.changeNameToLink(values.seoUrl),
                language: stLangCode
            }
        ])
    }

    return (
        <TranslateModal onDataLanguageChange={ onDataLanguageChange }
                        onDataFormSubmit={ onSubmit }
                        buttonTranslateStyle={ { marginRight: '7px' } }
        >
            { stCurrentLanguage &&
                <>
                    <TitleTranslate title={ i18next.t`page.blogCategoryEditor.translateModal.categoryInformation` }/>
                    <AvField
                        name="title"
                        label={ i18next.t('page.storeFront.blog.category.formEditor.categoryName') }
                        validate={ { ...FormValidate.maxLength(50), ...FormValidate.required() } }
                        value={ stCurrentLanguage.title }
                        onChange={ e => setStCurrentLanguage(lang => ({ ...lang, title: e.currentTarget.value })) }
                    />

                    <AvFieldCountable className="blog-category-form-editor__description-text"
                                      name="description"
                                      label={ i18next.t('page.storeFront.blog.category.formEditor.description') }
                                      validate={ { ...FormValidate.maxLength(200) } }
                                      type="textarea"
                                      maxLength="200"
                                      minLength="0"
                                      isRequired={ false }
                                      value={ stCurrentLanguage.description }
                    />
                    <SEOTranslateElement
                        ref={ refSEOUrl }
                        key={ stLangCode }
                        langKey={ stLangCode }
                        seoDescription={ stSEO.seoDescription || '' }
                        seoKeywords={ stSEO.seoKeywords || '' }
                        seoTitle={ stSEO.seoTitle || '' }
                        seoUrl={ stSEO.seoUrl || '' }
                        seoLinkType={ Constants.SEO_DATA_TYPE.BLOG }
                        seoLinkData={ props.categoryId }
                        prefix="blog/"
                        postfix={ props.categoryId ? `-ct${ props.categoryId }` : '' }
                        itemName={ stCurrentLanguage.title }
                        enableLetterOrNumberOrHyphen={ false }
                        onBlur={ setStSEO }
                    />
                </>
            }

        </TranslateModal>
    );
};

BlogCategoryTranslateModal.propTypes = {
    categoryId: PropTypes.number
};

export default BlogCategoryTranslateModal;
