import './ElementList.sass'

import React, {useContext, useEffect, useState} from 'react';
import {ThemeMakingContext} from "../context/ThemeMakingContext";
import {ThemeEngineService} from "../../../../services/ThemeEngineService";
import GSTrans from "../../../../components/shared/GSTrans/GSTrans";
import i18n from '../../../../config/i18n';

const ElementList = (props) => {
    const {currentComponent, currentPage} = props

    const {dispatch} = useContext(ThemeMakingContext.context);

    // list element type
    const [getListElementTypeModel, setListElementTypeModel] = useState([]);

    const sortElementsForUser = (elements) => {
        const indexedElements = elements.map(element => {
            let indexedElement = {
                name: element
            }
            switch (element) {
                case 'HEADER':
                    indexedElement.sortIndex = 1
                    break

                case 'BANNER':
                    indexedElement.sortIndex = 2
                    break

                case 'SLIDER':
                    indexedElement.sortIndex = 3
                    break

                case 'SLIDESHOW_PRODUCTS_SERVICES':
                    indexedElement.sortIndex = 4
                    break

                case 'PRODUCTS_SERVICES':
                    indexedElement.sortIndex = 5
                    break

                case 'PRODUCT_SERVICE_COLLECTIONS':
                    indexedElement.sortIndex = 6
                    break

                case 'SLIDESHOW_IMAGE':
                    indexedElement.sortIndex = 7
                    break

                case 'OTHERS':
                    indexedElement.sortIndex = 99

                case 'FOOTER':
                    indexedElement.sortIndex = 100
                    break

                default:
                    indexedElement.sortIndex = 50
            }

            return indexedElement
        })

        return _.sortBy(indexedElements, [element => element.sortIndex]).map(element => element.name)
    }

    useEffect(() => {
        /* if (!TokenUtils.hasThemeEnginePermission()) {
            return
        } */

        //-----------------------------------//
        // get element list
        //-----------------------------------//
        ThemeEngineService.getComponentMasterType("WEB", true, currentPage.type).then(result => {
            if (result && result.length) {
                const sortedElements = sortElementsForUser(result)

                setListElementTypeModel(sortedElements);
            }
        })
    }, []);

    const onElementClick = (data) => {
        dispatch(ThemeMakingContext.actions.setCurrentComponent({
            ...currentComponent,
            componentType: data,
            isChooseStyle: true
        }))
    }

    return (
        <div className="element-list">
            <section className="all-setting">
                <div className="title-element label-pdl">
                    <span>{i18n.t("page.themeEngine.editor.tab.element")}</span>
                </div>
                <div className='element-list__scroll gs-atm__scrollbar-1'>
                    {
                        getListElementTypeModel.map((data, index) => (
                            <div key={index}
                                 className={[
                                     "setting-element",
                                     currentComponent && currentComponent.componentType === data ? "setting-element--active" : ''
                                 ].join(' ')}
                                 onClick={() => onElementClick(data)}
                            >
                                <div className="label-pdl element-header">
                                    <span><GSTrans
                                        t={`component.themeEditor.element.${data}.title`}>{data}</GSTrans></span>
                                </div>
                            </div>
                        ))
                    }
                </div>
            </section>
        </div>
    )
}

export default ElementList
