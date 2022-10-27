import React, {useEffect, useRef, useState} from 'react';
import PrivateComponent from '../../../../components/shared/PrivateComponent/PrivateComponent.js';
import InformationTranslateElement
    from '../../../../components/shared/productsModal/shared/InformationTranslateElement.js';
import SEOTranslateElement from '../../../../components/shared/productsModal/shared/SEOTranslateElement.js';
import TranslateModal from '../../../../components/shared/productsModal/TranslateModal.js';
import {PACKAGE_FEATURE_CODES} from '../../../../config/package-features.js';
import articleTranslateService from '../../../../services/ArticleTranslateService.js';
import storeService from '../../../../services/StoreService.js';
import {CredentialUtils} from '../../../../utils/credential.js';
import {GSToast} from '../../../../utils/gs-toast.js';
import {FeatureText} from './BlogArticleFormEditor.js';
import Constants from '../../../../config/Constant'
import {ItemUtils} from '../../../../utils/item-utils'

export default function ArticleTranslateModal({ articleId, initialContent }) {
    const [articleTrans, setArticleTrans] = useState({});
    const [languages, setLanguages] = useState([]);
    const [isNewContent, setIsNewContent] = useState(false);
    const [selectedLang, setSelectedLang] = useState(null);

    const refSEOUrl = useRef()

    useEffect(() => {
        storeService.getLanguages({ hasInitial: false })
            .then(result => {
                if (result) {
                    setLanguages(result);
                }
            }, GSToast.commonError);
    }, []);

    useEffect(() => {
        setIsNewContent(!Boolean(articleTrans.language));
    }, [articleTrans]);

    useEffect(() => {
        if (Boolean(languages) && Boolean(languages.length)) {
            setSelectedLang(languages[0]);
        }
    }, [languages]);

    useEffect(() => {
        if (selectedLang) {
            fetchTranslatedContent(selectedLang.langCode);
        }
    }, [selectedLang, initialContent]);

    const fetchTranslatedContent = langCode => {
        const storeId = CredentialUtils.getStoreId();
        articleTranslateService.getTranlatedArticle(storeId, articleId, langCode)
            .then(setArticleTrans)
            .catch(e => {
                if (e.message === 'article.lang.not.found') {
                    const data = {
                        title: initialContent.title,
                        content: initialContent.content,
                        featureText: initialContent.featuredText,
                        seoTitle: initialContent.seoTitle,
                        seoDescription: initialContent.seoDescription,
                        seoKeyword: initialContent.seoKeywords,
                        seoUrl: initialContent.seoUrl,
                        language: initialContent.language,
                        blogArticleId: initialContent.id
                    };
                    setArticleTrans(data);
                } else {
                    GSToast.commonError();
                }
            });
    };

    const submitForm = async (values) => {
        const isSEOUrlValidRes = refSEOUrl.current && await refSEOUrl.current.isValid()

        if (!isSEOUrlValidRes) {
            return
        }

        const data = {
            blogArticleId: articleTrans.blogArticleId,
            language: selectedLang.langCode,
            storeId: selectedLang.storeId,
            title: values.informationName,
            content: values.informationDescription,
            featureText: values.featuredText,
            seoTitle: values.seoTitle,
            seoDescription: values.seoDescription,
            seoKeyword: values.seoKeywords,
            seoUrl: ItemUtils.changeNameToLink(values.seoUrl)
        };

        if (isNewContent) {
            articleTranslateService.createTranslatedArticle(data)
                .then(data => {
                    setArticleTrans(data);
                    setIsNewContent(false);
                    GSToast.commonCreate();
                })
                .catch(GSToast.commonError);
        } else {
            articleTranslateService.updateTranslatedArticle({ ...data, id: articleTrans.id })
                .then(GSToast.commonUpdate, GSToast.commonError);
        }
    };

    return (
        <TranslateModal
            onDataFormSubmit={ submitForm }
            onDataLanguageChange={ setSelectedLang }
            languages={ languages }
            buttonTranslateStyle={ { marginRight: '7px' } }
        >
            <InformationTranslateElement name={ articleTrans.title } description={ articleTrans.content }
                                         onNameChange={ e => setArticleTrans(article => ({
                                             ...article,
                                             title: e.currentTarget.value
                                         })) }/>
            <FeatureText value={ articleTrans.featureText }/>
            <PrivateComponent
                wrapperDisplay={ 'block' }
                hasAnyPackageFeature={ [PACKAGE_FEATURE_CODES.FEATURE_0310] }
            >
                <SEOTranslateElement
                    ref={ refSEOUrl }
                    key={ articleTrans.language } // need this key to force react rebuild this component
                    langKey={ selectedLang?.langCode }
                    seoTitle={ articleTrans.seoTitle }
                    seoDescription={ articleTrans.seoDescription }
                    seoKeywords={ articleTrans.seoKeyword }
                    seoUrl={ articleTrans.seoUrl }
                    seoLinkType={ Constants.SEO_DATA_TYPE.ARTICLE }
                    seoLinkData={ articleId }
                    prefix="article/"
                    postfix={ articleId ? `-b${ articleId }` : '' }
                    itemName={ articleTrans.title }
                    assignDefaultValue={ false }
                    enableLetterOrNumberOrHyphen={ false }
                />
            </PrivateComponent>
        </TranslateModal>
    );
}
