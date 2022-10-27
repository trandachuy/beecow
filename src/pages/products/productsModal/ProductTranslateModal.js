import './ProductTranslateModal.sass'
import React, {useRef, useState} from 'react';
import {AvField} from 'availity-reactstrap-validation';
import TranslateModal from '../../../components/shared/productsModal/TranslateModal';
import TitleTranslate from '../../../components/shared/productsModal/TitleTranslate';
import {array, bool, func} from 'prop-types';
import {GSToast} from '../../../utils/gs-toast';
import {ItemService} from '../../../services/ItemService';
import i18next from 'i18next';
import GSTrans from '../../../components/shared/GSTrans/GSTrans';
import {FormValidate} from '../../../config/form-validate';
import LoadingScreen from '../../../components/shared/LoadingScreen/LoadingScreen';
import Constants from '../../../config/Constant'
import {ItemUtils} from '../../../utils/item-utils'

function ProductTranslateModal(props) {
    const {dataLanguages, dataModels, onSuccess} = props;

    const [stItemTranslate, setStItemTranslate] = useState({});
    const [stModelTranslate, setStModelTranslate] = useState({});
    const [stVariationTranslate, setStVariationTranslate] = useState([]);
    const [stLanguages, setStLanguages] = useState([]);
    const [stAllModalTranslate, setStAllModalTranslate] = useState([]);
    const [stIsLoading, setStIsLoading] = useState(false);
    const [stError, setStError] = useState(new Set());
    const [stModelNameError, setStModelNameError] = useState({});
    const [stCheckValidationItem, setStCheckValidationItem] = useState(true);
    const [stCheckValidationModel, setStCheckValidationModel] = useState(true);
    const [stNameVariation, setStNameVariation] = useState([]);
    const [stUpdatedNameVariation, setStUpdatedNameVariation] = useState([]);
    const [stUpdatedLabelVariation, setStUpdatedLabelVariation] = useState([]);

    const labelMapRef = useRef(new Map());
    const nameMapRef = useRef({});
    const refSEOUrl = useRef();

    const handleSubmit = async (data) => {
        const isSEOUrlValidRes = refSEOUrl.current && await refSEOUrl.current.isValid()

        if (!isSEOUrlValidRes) {
            return
        }

        const dataItem = {
            description: data.informationDescription,
            itemId: data.itemId,
            language: stLanguages,
            name: data.informationName,
            seoDescription: data.seoDescription,
            seoKeywords: data.seoKeywords,
            seoTitle: data.seoTitle,
            seoUrl: ItemUtils.changeNameToLink(data.seoUrl)
        }

        const updatedItemModels = stAllModalTranslate.map(item => {
            let itemLanguage = item.languages.find(language => language.language === stLanguages)
            if (!itemLanguage) {
                itemLanguage = item.languages.find(language => language.language === 'vi')
            }

            const modelLabels = itemLanguage.label.split('|')
            const modelNames = itemLanguage.name.split('|')
            const updatedModelLabel = modelLabels.map(label => {
                if (label === '[d3p0s1t]') {
                    return data['d3p0s1t']
                }

                if (data.hasOwnProperty(label)) {
                    return data[label]
                }

                return label
            }).join('|')
            const updatedModelNames = modelNames.map(name => data.hasOwnProperty(name) ? data[name] : name).join('|')

            return {
                ...itemLanguage,
                language: stLanguages,
                label: updatedModelLabel,
                name: updatedModelNames
            }
        })

        if (stCheckValidationItem && stCheckValidationModel) {
            setStIsLoading(true)
            try {
                const updatedItemLanguages = await ItemService.updateItemLanguage(dataItem);
                const updatedModelsLanguages = await ItemService.updateBulkOfItemModelLanguages(updatedItemModels);
                onSuccess(updatedItemLanguages, updatedModelsLanguages);
                setStIsLoading(false)
                GSToast.commonUpdate()
            } catch (e) {
                setStIsLoading(false)
                GSToast.commonError()
            }

        }
    }

    const handleLanguageChanged = async (data) => {
        setStLanguages(data.langCode)
        setStError(new Set())
        setStModelNameError({})
        const itemTranslate = dataLanguages.filter((item) => item.language === data.langCode)
        if (itemTranslate.length > 0) {
            setStItemTranslate(itemTranslate[0])
        } else {
            setStItemTranslate(dataLanguages.filter((item) => item.language === 'vi')[0])
        }

        // variation
        let modalTranslate = await dataModels.filter((item) => {
            return item.languages.filter((item2) => {
                return item2.language == data.langCode
            }).length != 0
        })

        let variationRow = {}
        let variation = []
        let variationName = []
        if (modalTranslate.length !== 0) {
            for (let label of modalTranslate[0].label.split("|")) {
                variationRow[label] = []
            }
            for (let model of modalTranslate) {
                model.label.split("|").forEach((name, index) => {
                    variationRow[name] = new Set([...variationRow[name], model.languages.filter(item => item.language === data.langCode)[0].name.split("|")[index]])
                })
            }
            const language = await modalTranslate[0].languages.filter((item) => {
                return item.language == data.langCode
            })
            variation = await language[0].label.split("|")
            variationName = dataModels[0].label.split("|")
            setStAllModalTranslate(modalTranslate)
        } else {
            for (let label of dataModels[0].label.split("|")) {
                variationRow[label] = []
            }
            for (let model of dataModels) {
                model.label.split("|").forEach((name, index) => {
                    variationRow[name] = new Set([...variationRow[name], model.languages.filter(item => item.language === 'vi')[0].name.split("|")[index]])
                })
            }
            const language = await dataModels[0].languages.filter((item) => {
                return item.language == 'vi'
            })
            variation = await language[0].label.split("|")
            variationName = dataModels[0].label.split("|")
            setStAllModalTranslate(dataModels)
        }
        variation.forEach(v => {
            labelMapRef.current.set(v, v)
        })

        for (const key in variationRow) {
            nameMapRef.current[key] = new Map()

            for (const entry of variationRow[key].entries()) {
                const [k, v] = entry
                nameMapRef.current[key].set(k, v)
            }
        }


        const nameVariation = variation.map((label, index) => {
            const dataShow = []
            if (variationRow[variationName[index]]) {
                for (let name of variationRow[variationName[index]]) {
                    dataShow.push(name)
                }
            }
            return dataShow
        })

        setStNameVariation(nameVariation)
        setStUpdatedNameVariation(_.cloneDeep(nameVariation))
        setStUpdatedLabelVariation(_.cloneDeep(variation))
        setStVariationTranslate(variation)
        setStModelTranslate(variationRow)
    }

    const onModelLabelChanged = _.debounce((key, label, index) => {

        const valueLabel = label.replace(/[|]/g, '')
        if (valueLabel) {
            setStUpdatedLabelVariation(names => {
                names[index] = valueLabel

                return _.cloneDeep(names)
            })
        }



        const error = _.clone(stError)
        labelMapRef.current.set(key, label)
        error.delete(key)
        for (const entry of labelMapRef.current.entries()) {
            if (entry[0] !== '[d3p0s1t]') {
                const [k, v] = entry
                if (k === key) {
                    continue
                }

                if (v === label) {
                    error.add(key)
                    setStCheckValidationItem(false)
                } else {
                    setStCheckValidationItem(true)
                }
            }
        }

        setStError(error)
    }, 300)

    const hasError = (key) => {
        return stError.has(key)
    }

    const onNameLabelBlur = _.debounce((key, oldValue, newValue, indexLabel, indexName) => {
        const modelNameError = _.cloneDeep(stModelNameError)

        const valueLabel = newValue.replace(/[|]/g, '')
        if (valueLabel) {
            setStUpdatedNameVariation(names => {
                names[indexLabel][indexName] = valueLabel

                return _.cloneDeep(names)
            })
        }

        if (!modelNameError.hasOwnProperty(key)) {
            modelNameError[key] = new Set()
        }

        nameMapRef.current[key].set(oldValue, newValue)
        modelNameError[key].delete(oldValue)

        for (const entry of nameMapRef.current[key].entries()) {
            const [k, v] = entry

            if (k === oldValue) {
                continue
            }

            if (v === newValue) {
                setStCheckValidationModel(false)
                modelNameError[key].add(oldValue)
            } else {
                setStCheckValidationModel(true)
            }
        }
        setStModelNameError(modelNameError)
    }, 300)

    const hasModelNameError = (key, oldValue) => {
        return stModelNameError.hasOwnProperty(key) && stModelNameError[key].has(oldValue)
    }

    return (
        <TranslateModal
            onDataFormSubmit={handleSubmit}
            onDataLanguageChange={handleLanguageChanged}
            buttonTranslateStyle={{marginRight: '7px'}}
        >
            {stIsLoading &&
            <LoadingScreen/>
            }
            <div className="product-translate-modal">
                <AvField name="itemId" value={stItemTranslate && stItemTranslate.itemId ? stItemTranslate.itemId : ''}
                         hidden/>
                {/*INFORMATION*/}

                <TranslateModal.Information
                    description={stItemTranslate && stItemTranslate.description ? stItemTranslate.description : ''}
                    name={stItemTranslate && stItemTranslate.name ? stItemTranslate.name : ''}
                    onNameChange={e => setStItemTranslate(trans => ({...trans, name: e.currentTarget.value}))}
                />

                {/*VARIATION*/}
                {
                    stVariationTranslate.filter(item => item !== '[d3p0s1t]').length > 0 &&
                    <TitleTranslate
                        title={i18next.t('component.variationDetail.selection.title')}
                    />
                }
                {stVariationTranslate.map((label, indexLabel) => {
                    if (label !== '[d3p0s1t]') {
                        return (
                            <div className="row">
                                <div className="col-4">
                                    <AvField
                                        name={label}
                                        value={stUpdatedLabelVariation[indexLabel]}
                                        onChange={(e, value) => onModelLabelChanged(label, value, indexLabel)}
                                        validate={{
                                            ...FormValidate.required(),
                                            ...FormValidate.maxLength(14),
                                        }}
                                        className={props.disabledVariation? 'disabled':''}

                                    />
                                    {<div className='error'>{hasError(label) && <GSTrans
                                        t='component.product.addNew.variations.duplicatedName'>error</GSTrans>}</div>}
                                </div>
                                <div className="col-8 pl-0">
                                    {
                                        stNameVariation[indexLabel].map((name, indexName) => {
                                            return (
                                                <>
                                                    <AvField
                                                        key={stLanguages}
                                                        name={name}
                                                        value={stUpdatedNameVariation[indexLabel][indexName]}
                                                        onBlur={(e, value) => onNameLabelBlur(label, name, value, indexLabel, indexName)}
                                                        validate={{
                                                            ...FormValidate.required(),
                                                            ...FormValidate.maxLength(20),
                                                        }}
                                                        className={props.disabledVariation? 'disabled':''}
                                                    />
                                                    {<div className='error'>{hasModelNameError(label, name) && <GSTrans
                                                        t='component.product.addNew.variations.duplicatedName'>error</GSTrans>}</div>}
                                                </>
                                            )
                                        })
                                    }
                                </div>
                            </div>
                        )
                    }


                })}

                {/*DEPOSIT*/}
                {stVariationTranslate.find(item => item === '[d3p0s1t]') &&
                <TitleTranslate
                    title={i18next.t('page.product.create.variation.deposit')}
                />
                }

                {stVariationTranslate.map((label, indexLabel) => {
                    if (label === '[d3p0s1t]') {
                        const dataShow = []
                        if (stModelTranslate[label]) {
                            for (let name of stModelTranslate[label]) {
                                dataShow.push(name)
                            }
                        }
                        return (
                            <div className="row">
                                <AvField
                                    name={'[d3p0s1t]'}
                                    value={label}
                                    hidden

                                />
                                <div className="col-12">
                                    {
                                        stNameVariation[indexLabel].map((name, indexName) => {
                                            if (name !== '[100P3rc3nt]'){
                                                return (
                                                    <>
                                                        <AvField
                                                            key={stLanguages}
                                                            name={name}
                                                            value={stUpdatedNameVariation[indexLabel][indexName]}
                                                            onBlur={(e, value) => onNameLabelBlur(label, name, value, indexLabel, indexName)}
                                                            validate={{
                                                                ...FormValidate.required(),
                                                                ...FormValidate.maxLength(20),
                                                            }}
                                                            className={props.disabledVariation? 'disabled':''}
                                                        />
                                                        {<div className='error'>{hasModelNameError(label, name) && <GSTrans
                                                            t='component.product.addNew.variations.duplicatedName'>error</GSTrans>}</div>}
                                                    </>
                                                )
                                            }
                                        })
                                    }
                                </div>
                            </div>
                        )
                    }
                })}

                {/*SEO SETTINGS*/}
                {stItemTranslate && <TranslateModal.SEO
                    ref={refSEOUrl}
                    key={stItemTranslate.language}
                    langKey={stItemTranslate.language}
                    seoUrl={stItemTranslate.seoUrl || ''}
                    seoTitle={stItemTranslate.seoTitle || ''}
                    seoDescription={stItemTranslate.seoDescription || ''}
                    seoKeywords={stItemTranslate.seoKeywords || ''}
                    isShowUrl={true}
                    seoLinkType={Constants.SEO_DATA_TYPE.BUSINESS_PRODUCT}
                    seoLinkData={stItemTranslate.itemId}
                    postfix={ stItemTranslate.itemId ? `-p${ stItemTranslate.itemId }` : '' }
                    itemName={ stItemTranslate.name }
                    enableLetterOrNumberOrHyphen={ false }
                    onBlur={data => setStItemTranslate({
                        ...stItemTranslate,
                        seoTitle: data.seoTitle,
                        seoDescription: data.seoDescription,
                        seoKeywords: data.seoKeywords,
                        seoUrl: data.seoUrl,
                    })}
                />}
            </div>
        </TranslateModal>

    )
}

ProductTranslateModal.defaultProps = {
    dataModels: [],
    dataLanguages: [],
    onSuccess: () => {
    }
}

ProductTranslateModal.propTypes = {
    dataModels: array,
    dataLanguages: array,
    onSuccess: func,
    disabledVariation: bool,
}


export default ProductTranslateModal;