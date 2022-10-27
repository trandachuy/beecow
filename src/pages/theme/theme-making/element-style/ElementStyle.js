import './ElementStyle.sass'

import React, {useContext, useEffect, useState} from 'react';
import {ThemeMakingContext} from "../context/ThemeMakingContext";
import {ThemeEngineService} from "../../../../services/ThemeEngineService";
import ThemeEngineUtils from "../ThemeEngineUtils";
import {TokenUtils} from "../../../../utils/token";
import i18n from '../../../../config/i18n';
import {bool, object} from "prop-types";

const ElementStyle = (props) => {
    const {dispatch} = useContext(ThemeMakingContext.context);

    const {currentComponent, currentPage, disabled} = props

    const [stElements, setStElements] = useState([]);

    useEffect(() => {
        ThemeEngineService.getComponentMasterByType("WEB", currentComponent.componentType, true, currentPage.type)
            .then(res => {
                setStElements(res);
            })
    }, []);

    useEffect(() => {
        if (!currentComponent || !stElements.length) {
            return
        }

        const elementStyleEl = $(`#element-style-${currentComponent.componentId}`)

        if (!elementStyleEl || !elementStyleEl.length) {
            return
        }

        elementStyleEl[0].scrollIntoView({
            behavior: "smooth",
            block: "center",
            inline: "nearest"
        })
    }, [currentComponent, stElements])

    const onStyleClick = (data) => {
        if (disabled) {
            return
        }

        dispatch(ThemeMakingContext.actions.setReturnComponent({
            componentSchema: ThemeEngineUtils.parseString(data.schema),
            componentValue: {},
            componentType: data.cpType,
            componentDefaultValue: data.defaultValue,
            componentContent: data
        }));
    }

    const renderElementStyleRow = (data) => {
        return (
            <div className="detail">
                <div className="image"
                     style={{backgroundImage: `url('${data.thumbnail}')`}}
                     onClick={() => onStyleClick(data)}>
                </div>
            </div>
        );
    }

    return (
        <div className={[
            "element-wrapper",
            disabled ? 'disabled' : ''
        ].join(' ')}>
            {
                !TokenUtils.hasThemeEnginePermission() &&
                <div className="elemnent-curtain">
                    <span>{i18n.t("component.themeEditor.element.list.upgrade.title")}</span>
                </div>
            }
            <div className="element-style gs-atm__scrollbar-1">
                {
                    !!stElements.length && stElements.map((data, index) => (
                        <div
                            id={`element-style-${data.nameId}`}
                            className={["row-detail", currentComponent && data.nameId === currentComponent.componentId ? 'active' : ''].join(' ')}
                            key={data.nameId}
                        >
                            {renderElementStyleRow(data)}
                        </div>
                    ))
                }
            </div>
        </div>
    );
};

ElementStyle.defaultProps = {
    currentComponent: {},
    currentPage: {},
    disabled: false
}

ElementStyle.propTypes = {
    currentComponent: object,
    currentPage: object,
    disabled: bool
}

export default ElementStyle
