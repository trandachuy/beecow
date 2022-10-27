/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 24/02/2020
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import TranslateModal from "../../../../components/shared/productsModal/TranslateModal";
import TitleTranslate from "../../../../components/shared/productsModal/TitleTranslate";
import i18next from "i18next";
import {AvField} from "availity-reactstrap-validation";
import {FormValidate} from "../../../../config/form-validate";
import {ItemService} from "../../../../services/ItemService";
import {GSToast} from "../../../../utils/gs-toast";

const MenuTranslateModal = props => {

    const [stMenuItemLanguageList, setStMenuItemLanguageList] = useState([]);
    const [stLangCode, setStLangCode] = useState(null);

    useEffect(() => {
        if (props.menuId) {
            fetchLanguagePack()
        }
    }, [props.menuId, props.menuItemAsTree])

    const fetchLanguagePack = () => {
        ItemService.getMenuItemLanguagesByMenuId(props.menuId)
            .then(menuItemLanguageList => {
                setStMenuItemLanguageList(menuItemLanguageList)
            })
    }

    /**
     * onLanguageChange
     * @param {StoreLanguageDTOModel} lang
     */
    const onLanguageChange = (lang) => {
        const langCode = lang.langCode
        setStLangCode(langCode)
    }

    const onSubmit = async (values) => {
        const requestBody = createRequestBody(values);
        // update language pack
        await ItemService.updateMenuItemLanguages(requestBody)
        fetchLanguagePack()
        GSToast.commonUpdate()
    }

    const createRequestBody = (values) => {
        /**
         * @type {MenuItemLanguageDTOModel[]}
         */
        let requestBody = []
        for (const ipName in values) {
            const [_, menuItemId, langId] = ipName.split('-')
            requestBody.push({
                id: langId === 'undefined'? undefined:langId,
                menuItemId: menuItemId,
                language: stLangCode,
                name: values[ipName]
            })
        }
        return requestBody
    }

    const resolveMenuItemLanguage = (menuItem) => {
        /**
         * @type {MenuItemLanguageDTOModel}
         */
        const menuItemLanguage = stMenuItemLanguageList.find(menuItemLang => menuItemLang.menuItemId === menuItem.id && menuItemLang.language === stLangCode)
        return menuItemLanguage || {id: null, name: menuItem.name, language: stLangCode, menuItemId: menuItem.id}
    }



    const renderMenuItems = (menuItemAsTree) => {
        menuItemAsTree.sort((previous, current) => previous.order - current.order);
        return (
            menuItemAsTree.length > 0 && (menuItemAsTree.map((item, index) => {
                const menuItemLang = resolveMenuItemLanguage(item)


                return (
                    <>
                        <div key={item.id + '-' + stLangCode} style={{
                            marginLeft: `calc( ${item.level} * 2rem)`
                        }}>
                            <AvField
                                name={`menu_item-${item.id}-${menuItemLang.id}`}
                                value={menuItemLang.name}
                                validate={{
                                    ...FormValidate.maxLength(150),
                                    ...FormValidate.required()
                                }}
                            />

                        </div>
                        {item.menuItems ?
                            renderMenuItems(item.menuItems)
                            : null
                        }
                    </>
                )
            }))
        )
    }

    return (
        <TranslateModal onDataLanguageChange={onLanguageChange}
                        onDataFormSubmit={onSubmit}
        >
            <TitleTranslate title={i18next.t`tbl.th.menu.items`}/>
            {renderMenuItems(props.menuItemAsTree)}
        </TranslateModal>
    );
};

MenuTranslateModal.propTypes = {
    menuItemAsTree: PropTypes.any,
    menuId: PropTypes.number,
    onSubmit: PropTypes.func,
};

export default MenuTranslateModal;
