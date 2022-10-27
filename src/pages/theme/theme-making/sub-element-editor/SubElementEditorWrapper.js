import './SubElementEditorWrapper.sass'

import React from 'react'
import GSTrans from "../../../../components/shared/GSTrans/GSTrans";
import {bool, string} from "prop-types";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import GSImg from "../../../../components/shared/GSImg/GSImg";

const SubElementEditorWrapper = (props) => {
    const {children, type, name, showTitle = true} = props

    const renderIcon = () => {
        let icon;
        switch (type.toLowerCase()) {
            case 'img':
            case 'slider_banner':
                icon = <FontAwesomeIcon icon="image"/>
                break
            case 'text':
                icon = <FontAwesomeIcon icon="font"/>
                break
            case 'link':
                icon = <FontAwesomeIcon icon="link"/>
                break
            case 'embedded_code':
                icon = <FontAwesomeIcon icon="code"/>
                break
            case 'collection':
            case 'item_collections':
                icon = <FontAwesomeIcon icon="th"/>
                break
            case 'blog_category':
                icon = <FontAwesomeIcon icon="layer-group"/>
                break
            case 'flash_sale_dates':
                icon = <FontAwesomeIcon icon="calendar-alt"/>
                break
            case 'pagination':
                icon = <GSImg src='/assets/images/theme/pagination.svg' height={12}/>
                break
            case 'dynamic_menu':
            case 'main_menu':
                icon = <FontAwesomeIcon icon="bars"/>
                break
        }

        if (icon) {
            return <span className="sub-element-editor-wrapper__icon">{icon}</span>
        }
    }

    return (
        <div>
            {
                showTitle && <div className='sub-element-editor-wrapper__label'>
                    {
                        renderIcon()
                    }
                    <span>
                    {
                        name || <GSTrans t={`component.themeEditor.subElement.${type}.title`}>{type}</GSTrans>
                    }
                </span>
                </div>
            }
            {children}
        </div>
    )
}

SubElementEditorWrapper.propTypes = {
    name: '',
    showTitle: true
}

SubElementEditorWrapper.propTypes = {
    type: string,
    name: string,
    showTitle: bool
}

export default SubElementEditorWrapper
