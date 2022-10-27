import React, {useEffect, useState} from 'react';
import {any, array, number, objectOf, shape} from 'prop-types';
import TranslateModal from "../../../../components/shared/productsModal/TranslateModal";
import {ItemService} from "../../../../services/ItemService";
import {GSToast} from "../../../../utils/gs-toast";

const VariationTranslateModal = props => {
    const {dataLanguage} = props;
    const {modelItemId} = props;
    const [stLanguages, setStLanguages] = useState([]);
    const [stSelectedLang, setStSelectedLang] = useState({});

    useEffect(() => {
        if (!modelItemId){
            return
        }
        getLanguagesByCollectionId(modelItemId)
    }, [modelItemId])

    const getLanguagesByCollectionId = (id) => {
        ItemService.getItemModelLanguage(id)
            .then(languages => {
                setStLanguages(languages)
            })
            .catch(error => {
                console.log(error)
            })
    }

    const handleSubmit = (values) => {
        const {informationName, informationDescription} = values

        const request = {
            ...stSelectedLang,
            description: informationDescription,
            versionName: informationName,
        }

        return ItemService.upsertItemModelLanguage(request)
            .then(() => {
                GSToast.commonUpdate()
                return getLanguagesByCollectionId(modelItemId)
            })
            .catch(() => {
                GSToast.commonError()
            })
    }

    const handleChanged = (language) =>{
        const {langCode} = language
        const selectLang = stLanguages.find(lang => lang.language == langCode)
        setStSelectedLang(selectLang)
    }

    return (
        <TranslateModal
            onDataFormSubmit={handleSubmit}
            onDataLanguageChange={handleChanged}
            buttonTranslateStyle={{marginRight: '7px'}}
        >
            {stSelectedLang && <TranslateModal.Information
                name={stSelectedLang.versionName || dataLanguage.name}
                description={stSelectedLang.description || dataLanguage.description}
            />}

        </TranslateModal>
    );
};

VariationTranslateModal.propTypes = {
    modeItemId: number,
    dataLanguage: any
};

export default VariationTranslateModal;
