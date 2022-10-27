import "./ServiceTranslateModal.sass"
import React, {useEffect, useRef, useState} from 'react';
import {AvField} from "availity-reactstrap-validation";
import TranslateModal from "../../../../components/shared/productsModal/TranslateModal";
import TitleTranslate from "../../../../components/shared/productsModal/TitleTranslate";
import {array, func, object, string} from "prop-types";
import {CredentialUtils} from "../../../../utils/credential";
import {AgencyService} from "../../../../services/AgencyService";
import {GSToast} from "../../../../utils/gs-toast";
import {ItemService} from "../../../../services/ItemService";
import Loading, {LoadingStyle} from "../../../../components/shared/Loading/Loading";
import i18next from "i18next";
import GSTrans from "../../../../components/shared/GSTrans/GSTrans";
import ServiceModal from "../../SelectServiceModal/ServiceModal";
import TranslateServiceModal from "../../../../components/shared/ServiceModal/TranslateServiceModal";
import SEOEditor from "../../../seo/SEOEditor";
import Constants from '../../../../config/Constant'
import {ItemUtils} from '../../../../utils/item-utils'

function ServiceTranslateModal(props) {
    const {dataLanguages, dataModels, onSuccess, dataService, dataSeoUrl} = props;

    const labelMapRef = useRef(new Map());
    const nameMapRef = useRef({});

    const [stItemTranslate, setStItemTranslate] = useState({});
    const [stModelTranslate, setStModelTranslate] = useState([]);
    const [stVariationTranslate, setStVariationTranslate] = useState([]);
    const [stVariationDefaultTranslate, setStVariationDefaultTranslate] = useState([]);
    const [stLanguages, setStLanguages] = useState([]);
    const [stAllModalTranslate, setStAllModalTranslate] = useState([]);
    const [stIsLoading, setStIsLoading] = useState(false);
    const [stError, setStError] = useState(new Set());
    const [stModelNameError, setStModelNameError] = useState({});
    const [stCheckValidationItem, setStCheckValidationItem] = useState(true);
    const [stCheckValidationModel, setStCheckValidationModel] = useState(true);
    const [listDataService,setListDataService]=useState([]);

    const refSEOUrl = useRef();

    useEffect(()=>{
        setListDataService(dataService)
    },[dataService])

    const dataForm = async (data) => {
        const isSEOUrlValidRes = refSEOUrl.current && await refSEOUrl.current.isValid()

        if (!isSEOUrlValidRes) {
            return
        }

        if(!data.itemId){
            data.itemId=dataService[0].itemId
        }
        const dataItem = {
            "description": data.informationDescription,
            "itemId": data.itemId,
            "language": stLanguages,
            "name": data.informationName,
            "seoDescription": data.seoDescription,
            "seoKeywords": data.seoKeywords,
            "seoTitle": data.seoTitle,
            "seoUrl": ItemUtils.changeNameToLink(data.seoUrl)
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

                return data[label]
            }).join('|')
            const modelTranslated=[];
            var list=[];
            const updatedModelNames = modelNames.map(name =>
            {
                list=stModelTranslate;
                if(data[name]) {
                    list.map((item, index) => {
                        if (name == item) {

                            list[index] = data[name]
                        }
                    })
                }
                return data.hasOwnProperty(name) ? data[name] : name
            }
                ).join('|')
            setStModelTranslate(list)
            return {
                ...itemLanguage,
                description: "",
                language: stLanguages,
                label: 'location|timeslot',
                name: updatedModelNames,
                versionName:null
            }

        })
        if(stCheckValidationItem && stCheckValidationModel){
            setStIsLoading(true)
            Promise.all([
                ItemService.updateItemLanguage(dataItem).then(result=>{
                    let list=listDataService
                    list.map((item,index)=>{
                        if(item.itemId==result.itemId){
                            list[index]=result
                        }
                    })
                    setListDataService(list)
                }),

                ItemService.updateBulkOfItemModelLanguages(updatedItemModels)
            ])
                .then(([updatedItemLanguages, updatedModelsLanguages]) => {
                    onSuccess(updatedItemLanguages, updatedModelsLanguages)
                    setStIsLoading(false)
                    GSToast.commonUpdate()
                })
                .catch(() => {
                    setStIsLoading(false)
                    GSToast.commonError()
                })
        }
    }

    const dataLanguage = async (data) => {
        setStLanguages(data.langCode)
        // const itemTranslate = dataLanguages.filter((item) => item.langCode === data.langCode)
        const itemTranslate=listDataService.find((item)=>item.language==data.langCode);
        setStItemTranslate(itemTranslate)
        // if (itemTranslate.length > 0) {
        //     setStItemTranslate(itemTranslate[0])
        // } else {
        //     setStItemTranslate(dataLanguages.filter((item) => item.langCode === 'vi')[0])
        // }

        // variation

        let modalTranslate = await dataModels.filter((item) => {
            return item.languages.filter((item2) => {
                return item2.language == data.langCode
            }).length != 0
        })

        let variationRow = {}
        let variation = []
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
            setStVariationDefaultTranslate(modalTranslate[0].label.split("|"))
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
            setStVariationDefaultTranslate(dataModels[0].label.split("|"))
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

        setStVariationTranslate(variation)
        setStModelTranslate(Array.from(variationRow.location))
    }

    const onModelLabelChanged = _.debounce((key, label) => {
        const error = _.clone(stError)

        labelMapRef.current.set(key, label)
        error.delete(key)
        for (const entry of labelMapRef.current.entries()) {
            if (entry[0] !== '[d3p0s1t]'){
                const [k, v] = entry
                if (k === key) {
                    continue
                }

                if (v === label) {
                    error.add(key)
                    setStCheckValidationItem(false)
                }else{
                    setStCheckValidationItem(true)
                }
            }
        }

        setStError(error)
    }, 300)

    const hasError = (key) => {
        return stError.has(key)
    }



    const onNameLabelChanged = _.debounce((key, oldValue, newValue) => {
        const modelNameError = _.cloneDeep(stModelNameError)


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
            }else {
                setStCheckValidationModel(true)
            }
        }
        setStModelNameError(modelNameError)
    }, 300)

    const hasModelNameError = (key, oldValue) => {
        return stModelNameError.hasOwnProperty(key) && stModelNameError[key].has(oldValue)
    }

    return (
        <TranslateServiceModal
            onDataFormSubmit={dataForm}
            onDataLanguageChange={dataLanguage}
            buttonTranslateStyle={{marginRight: '7px'}}
        >
            {stIsLoading &&
            <Loading style={LoadingStyle.DUAL_RING_GREY}
                     className="loading-list"
            />
            }
            <div className="product-translate-modal">
                <AvField name="itemId" value={stItemTranslate && stItemTranslate.itemId ? stItemTranslate.itemId : ''}
                         hidden/>
                {/*INFORMATION*/}

                <TranslateModal.Information
                    description={stItemTranslate && stItemTranslate.description ? stItemTranslate.description : ''}
                    name={stItemTranslate && stItemTranslate.name ? stItemTranslate.name : ''}
                    onNameChange={e => setStItemTranslate(item => ({...item, name: e.currentTarget.value}))}
                />

                {/*VARIATION*/}

                <TitleTranslate
                    title={"Location"}
                />
                {stVariationTranslate.map((label, index) => {
                    if (label == 'location' ) {
                        const dataShow = []
                        stModelTranslate.forEach(item=>dataShow.push(item))
                        // if (stModelTranslate[stVariationDefaultTranslate[index]]) {
                        //     for (let name of stModelTranslate[stVariationDefaultTranslate[index]]) {
                        //         dataShow.push(name)
                        //     }
                        // }
                        return (
                            <div className="row">
                                {/*<div className="col-4">*/}
                                {/*    <AvField*/}
                                {/*        name={label}*/}
                                {/*        value={label}*/}
                                {/*        onChange={(e, value) => onModelLabelChanged(label, value)}*/}
                                {/*        validate={{*/}
                                {/*            required: {*/}
                                {/*                value: true,*/}
                                {/*                errorMessage: i18next.t('common.validation.required')*/}
                                {/*            }*/}
                                {/*        }}*/}
                                {/*    />*/}
                                {/*    {hasError(label) && <span className='error'><GSTrans t='component.product.addNew.variations.duplicatedName'>error</GSTrans></span>}*/}
                                {/*</div>*/}
                                <div className="col-12 pl-0">
                                    {
                                        dataShow.map((name, index) => {
                                            return (
                                                <>
                                                    <AvField
                                                        key={stLanguages}
                                                        name={name}
                                                        value={name}
                                                        onChange={(e, value) => onNameLabelChanged(label, name, value)}
                                                        validate={{
                                                            required: {
                                                                value: true,
                                                                errorMessage: i18next.t('common.validation.required')
                                                            }
                                                        }}
                                                    />
                                                    {hasModelNameError(label, name) && <span className='error'><GSTrans t='component.product.addNew.variations.duplicatedName'>error</GSTrans></span>}
                                                </>
                                            )
                                        })
                                    }
                                </div>
                            </div>
                        )
                    }
                })}

                {stItemTranslate && <TranslateModal.SEO
                    ref={refSEOUrl}
                    langKey={stItemTranslate.language}
                    seoUrl={stItemTranslate.seoUrl ? stItemTranslate.seoUrl : ''}
                    seoTitle={stItemTranslate.seoTitle ? stItemTranslate.seoTitle : ''}
                    seoDescription={stItemTranslate.seoDescription ? stItemTranslate.seoDescription : ''}
                    seoKeywords={stItemTranslate.seoKeywords ? stItemTranslate.seoKeywords : ''}
                    seoLinkType={Constants.SEO_DATA_TYPE.SERVICE}
                    seoLinkData={stItemTranslate.itemId}
                    postfix={ stItemTranslate.itemId ? `-p${ stItemTranslate.itemId }` : '' }
                    itemName={ stItemTranslate.name }
                    enableLetterOrNumberOrHyphen={ false }
                    assignDefaultValue={false}
                    isShowUrl={true}
                />}

            </div>
        </TranslateServiceModal>

    )
}

ServiceTranslateModal.defaultProps = {
    dataModels: [],
    dataLanguages: [],
    dataService:{},
    onSuccess: () => {
    },
    dataSeoUrl:''
}

ServiceTranslateModal.propTypes = {
    dataModels: array,
    dataLanguages: array,
    dataService: object,
    onSuccess: func,
    dataSeoUrl: string
}


export default ServiceTranslateModal;
