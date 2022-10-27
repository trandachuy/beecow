import React, {useEffect, useRef, useState} from 'react';
import {AvField} from 'availity-reactstrap-validation';
import TranslateModal from '../../../../components/shared/productsModal/TranslateModal';
import TitleTranslate from '../../../../components/shared/productsModal/TitleTranslate';
import {FormValidate} from '../../../../config/form-validate';
import SEOEditor from '../../../seo/SEOEditor';
import {ItemService} from '../../../../services/ItemService';
import PropTypes, {any} from 'prop-types';
import {GSToast} from '../../../../utils/gs-toast';
import Constants from '../../../../config/Constant'
import HocSEOEditor from '../../../seo/hoc/HocSEOEditor'
import {ItemUtils} from '../../../../utils/item-utils'

function CollectionTranslateModal(props) {
    const {dataLanguage} = props;
    const collectionId = dataLanguage.collectionId;
    const [stLanguages, setStLanguages] = useState([]);
    const [stSelectedLang, setStSelectedLang] = useState({});

    const refSEOUrl = useRef()

    useEffect(() => {
        if (!collectionId){
            return
        }
        getLanguagesByCollectionId(collectionId)
    }, [collectionId])

    const getLanguagesByCollectionId = (id) => {
            ItemService.getLanguagesByCollectionId(id)
            .then(languages => {
                setStLanguages(languages)
            })
            .catch(error => {
                console.log(error)
            })
    }

    const handleSubmit = async (values) => {
        const isSEOUrlValidRes = refSEOUrl.current && await refSEOUrl.current.isValid()

        if (!isSEOUrlValidRes) {
            return
        }

        const {name, seoTitle, seoDescription, seoKeywords, seoUrl} = values
        const request = {
            collectionId: collectionId,
            language: stSelectedLang.language,
            name: name,
            seoDescription: seoDescription,
            seoKeywords: seoKeywords,
            seoTitle: seoTitle,
            seoUrl: ItemUtils.changeNameToLink(seoUrl)
        }

        return ItemService.upsertCollectionLanguage(request)
            .then(() => {
                GSToast.commonUpdate()
                return getLanguagesByCollectionId(collectionId)
            })
            .catch(() => {
                GSToast.commonError()
            })
    }

    const handleChanged = (language) =>{
        const {langCode} = language

        const selectLang = stLanguages.find(lang => lang.language == langCode)

        if (!selectLang) {
            return setStSelectedLang({
                language: langCode,
                name: dataLanguage.name,
                seoTitle: dataLanguage.seoTitle,
                seoDescription: dataLanguage.seoDescription,
                seoKeywords: dataLanguage.seoKeywords,
                seoUrl: dataLanguage.seoUrl
            })
        }

        setStSelectedLang(selectLang)
    }

    return (
        <TranslateModal
            onDataFormSubmit={handleSubmit}
            onDataLanguageChange={handleChanged}
            buttonTranslateStyle={{marginRight: '7px'}}
        >
            <div>
                {/*INFORMATION*/}
                <TitleTranslate
                    title={"Information"}
                />

                {stSelectedLang && <AvField
                    label='name'
                    name='name'
                    value={stSelectedLang.name || dataLanguage.name}
                    validate={{
                        ...FormValidate.maxLength(100),
                        ...FormValidate.required(),
                        ...FormValidate.minLength(0)
                    }}
                    onChange={e => setStSelectedLang(lang => ({...lang, name: e.currentTarget.value}))}
                />}
                {/*SEO SETTINGS*/}
                {
                    stSelectedLang && <HocSEOEditor ref={ refSEOUrl }
                                                    langKey={ stSelectedLang.language }
                                                    type={ props.itemType === Constants.COLLECTION_ITEM_TYPE.PRODUCT
                                                        ? Constants.SEO_DATA_TYPE.COLLECTION_PRODUCT
                                                        : Constants.SEO_DATA_TYPE.COLLECTION_SERVICE }
                                                    data={ collectionId }>
                        <SEOEditor key={ stSelectedLang.language } defaultValue={ {
                            seoTitle: stSelectedLang.seoTitle || '',
                            seoDescription: stSelectedLang.seoDescription || '',
                            seoKeywords: stSelectedLang.seoKeywords || '',
                            seoUrl: stSelectedLang.seoUrl || ''
                        } }
                                   prefix={ stSelectedLang.language + '/collection/' + props.itemType.toLowerCase() + '/' }
                                   middleSlug={ ItemUtils.changeNameToLink(stSelectedLang.name || '') }
                                   postfix={ props.dataLanguage ? `-c${ props.dataLanguage.collectionId }` : '' }
                                   enableLetterOrNumberOrHyphen={ false }
                                   assignDefaultValue={false}
                        />
                    </HocSEOEditor>
                }
            </div>
        </TranslateModal>

    )
}


CollectionTranslateModal.propTypes = {
    dataLanguage: any,
    itemType: PropTypes.oneOf(Object.values(Constants.COLLECTION_ITEM_TYPE)).isRequired
}



export default CollectionTranslateModal;