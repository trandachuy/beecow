import React, {useContext, useEffect, useRef, useState} from 'react'
import './SubElementEditorMenu.sass'
import {ThemeMakingContext} from '../context/ThemeMakingContext'
import authenticate from '../../../../services/authenticate'
import menuService from '../../../../services/MenuService'
import {AvField, AvForm} from 'availity-reactstrap-validation'
import GSTrans from '../../../../components/shared/GSTrans/GSTrans'
import InlineColorPicker from './shared/InlineColorPicker'
import i18next from 'i18next'
import ThemeEngineUtils from '../ThemeEngineUtils'

/**
 * This editor for menu type
 * @param {} props
 * @param {*} ref
 */

const COLOR_SETTING = {
    MENU_BACKGROUND_COLOR: 'MENU_BACKGROUND_COLOR',
    MENU_TEXT_COLOR: 'MENU_TEXT_COLOR',
    MENU_HOVER_COLOR: 'MENU_HOVER_COLOR',
    MENU_DROPDOWN_BACKGROUND_COLOR: 'MENU_DROPDOWN_BACKGROUND_COLOR',
    MENU_DROPDOWN_TEXT_COLOR: 'MENU_DROPDOWN_TEXT_COLOR',
    MENU_DROPDOWN_HOVER_COLOR: 'MENU_DROPDOWN_HOVER_COLOR',
    MENU_DROPDOWN_HOVER_BACKGROUND_COLOR: 'MENU_DROPDOWN_HOVER_BACKGROUND_COLOR',
    MENU_DROPDOWN_BORDER_COLOR: 'MENU_DROPDOWN_BORDER_COLOR'
}

const SubElementEditorMenu = props => {
    const { state, dispatch } = useContext(ThemeMakingContext.context)

    const {
        menuId,
        menuBackgroundColor,
        menuTextColor,
        menuHoverColor,
        menuDropdownBackgroundColor,
        menuDropdownTextColor,
        menuDropdownHoverBackgroundColor,
        menuDropdownHoverColor,
        menuDropdownBorderColor,
        path
    } = props

    const [getListMenuModel, setListMenuModel] = useState([{ value: '', label: '' }])

    const [stStyle, setStStyle] = useState({
        menuId: menuId,
        menuBackgroundColor: menuBackgroundColor,
        menuTextColor: menuTextColor,
        menuHoverColor: menuHoverColor,
        menuDropdownBackgroundColor: menuDropdownBackgroundColor,
        menuDropdownTextColor: menuDropdownTextColor,
        menuDropdownHoverBackgroundColor: menuDropdownHoverBackgroundColor,
        menuDropdownHoverColor: menuDropdownHoverColor,
        menuDropdownBorderColor: menuDropdownBorderColor
    })

    const refFirstChange = useRef(true)

    useEffect(() => {
        // get list component here
        menuService.getMenuByBcStoreIdByPage({ sellerId: authenticate.getStoreId(), page: 0, size: 1000 }).then(res => {
            if (res.data) {
                const lstMenu = []
                res.data.forEach(menu => {
                    lstMenu.push({ value: menu.id, label: menu.name })

                    if (menu.name === 'Default Menu') {
                        if (!menuId) {
                            setStStyle(style => ({
                                ...style,
                                menuId: new Number(menu.id)
                            }))
                        }
                    }
                })


                setListMenuModel(lstMenu)
            }
        }).catch(e => {
        })

    }, [])

    useEffect(() => {
        if (refFirstChange.current) {
            refFirstChange.current = false
            return
        }

        if (state.controller.isTranslate) {
            return
        }

        dispatch(ThemeMakingContext.actions.editSubElementReturn({
            path,
            changes: stStyle
        }))

    }, [stStyle])

    const onChangeMenu = (menuId) => {
        setStStyle({
            ...stStyle,
            menuId: new Number(menuId)
        })
    }

    const handleStyle = (_style, type) => {
        if (state.controller.isTranslate) {
            return
        }

        _style = _style.replace(' !important', '')

        const style = {}

        switch (type) {
            case COLOR_SETTING.MENU_BACKGROUND_COLOR:
                style.menuBackgroundColor = ThemeEngineUtils.getStylesByKeys(_style, 'background-color')['background-color']
                break;
            case COLOR_SETTING.MENU_TEXT_COLOR:
                style.menuTextColor = ThemeEngineUtils.getStylesByKeys(_style, 'color')['color']
                break;
            case COLOR_SETTING.MENU_HOVER_COLOR:
                style.menuHoverColor = ThemeEngineUtils.getStylesByKeys(_style, 'hover-color')['hover-color']
                break;
            case COLOR_SETTING.MENU_DROPDOWN_BACKGROUND_COLOR:
                style.menuDropdownBackgroundColor = ThemeEngineUtils.getStylesByKeys(_style, 'background-color')['background-color']
                break;
            case COLOR_SETTING.MENU_DROPDOWN_TEXT_COLOR:
                style.menuDropdownTextColor = ThemeEngineUtils.getStylesByKeys(_style, 'color')['color']
                break;
            case COLOR_SETTING.MENU_DROPDOWN_HOVER_BACKGROUND_COLOR:
                style.menuDropdownHoverBackgroundColor = ThemeEngineUtils.getStylesByKeys(_style, 'hover-background-color')['hover-background-color']
                break;
            case COLOR_SETTING.MENU_DROPDOWN_HOVER_COLOR:
                style.menuDropdownHoverColor = ThemeEngineUtils.getStylesByKeys(_style, 'hover-color')['hover-color']
                break;
            case COLOR_SETTING.MENU_DROPDOWN_BORDER_COLOR:
                style.menuDropdownBorderColor = ThemeEngineUtils.getStylesByKeys(_style, 'border-color')['border-color']
                break;
        }

        setStStyle(s => ({
            ...s,
            ...style
        }))
    }

    return (
        <div className={ [
            'sub-element-editor-menu',
            state.controller.isTranslate ? 'disabled' : ''
        ].join(' ') }>
            <div className="dropdown-select-menu">
                <AvForm>
                    <AvField
                        className="input-field__hint"
                        type="select"
                        name="pickupMenu"
                        value={ stStyle.menuId }
                        onChange={ (e) => onChangeMenu(e.target.value) }
                    >
                        {
                            getListMenuModel.map((x, index) => {
                                return (<option
                                    value={ x.value }
                                    key={ 'menu' + x.value }
                                    defaultValue={ stStyle.menuId }>
                                    { x.label }
                                </option>)
                            })
                        }
                    </AvField>
                </AvForm>
            </div>

            <div className="sub-element-editor-menu__menu-items">
                <div className="sub-element-editor-menu__menu-items__name">
                    <GSTrans t="component.themeEditor.menuItems.title"/>
                </div>
            </div>
            <div className={ [
                'sub-element-editor-menu__menu-items__body',
                state.controller.isTranslate ? 'disabled' : ''
            ].join(' ') }>
                <InlineColorPicker
                    title={ i18next.t('component.themeEditor.menuItems.backgroundColor') }
                    defaultValue={ `background-color: ${ stStyle.menuBackgroundColor }` }
                    styleType="background-color"
                    onChange={changed => handleStyle(changed, COLOR_SETTING.MENU_BACKGROUND_COLOR)}
                />
                <InlineColorPicker
                    title={ i18next.t('component.themeEditor.menuItems.textColor') }
                    defaultValue={ `color: ${ stStyle.menuTextColor }` }
                    styleType="color"
                    onChange={changed => handleStyle(changed, COLOR_SETTING.MENU_TEXT_COLOR)}
                />
                <InlineColorPicker
                    title={ i18next.t('component.themeEditor.menuItems.hoverColor') }
                    defaultValue={ `hover-color: ${ stStyle.menuHoverColor }` }
                    styleType="hover-color"
                    onChange={changed => handleStyle(changed, COLOR_SETTING.MENU_HOVER_COLOR)}
                />
            </div>

            <div className="sub-element-editor-menu__sub-menu">
                <div className="sub-element-editor-menu__sub-menu__name">
                    <GSTrans t="component.themeEditor.subMenu.title"/>
                </div>
            </div>
            <div className={ [
                'sub-element-editor-menu__sub-menu__body',
                state.controller.isTranslate ? 'disabled' : ''
            ].join(' ') }>
                <InlineColorPicker
                    title={ i18next.t('component.themeEditor.subMenu.backgroundColor') }
                    defaultValue={ `background-color: ${ stStyle.menuDropdownBackgroundColor }` }
                    styleType="background-color"
                    onChange={changed => handleStyle(changed, COLOR_SETTING.MENU_DROPDOWN_BACKGROUND_COLOR)}
                />
                <InlineColorPicker
                    title={ i18next.t('component.themeEditor.subMenu.textColor') }
                    defaultValue={ `color: ${ stStyle.menuDropdownTextColor }` }
                    styleType="color"
                    onChange={changed => handleStyle(changed, COLOR_SETTING.MENU_DROPDOWN_TEXT_COLOR)}
                />
                <InlineColorPicker
                    title={ i18next.t('component.themeEditor.subMenu.textHoverBackgroundColor') }
                    defaultValue={ `hover-background-color: ${ stStyle.menuDropdownHoverBackgroundColor }` }
                    styleType="hover-background-color"
                    onChange={changed => handleStyle(changed, COLOR_SETTING.MENU_DROPDOWN_HOVER_BACKGROUND_COLOR)}
                />
                <InlineColorPicker
                    title={ i18next.t('component.themeEditor.subMenu.textHoverColor') }
                    defaultValue={ `hover-color: ${ stStyle.menuDropdownHoverColor }` }
                    styleType="hover-color"
                    onChange={changed => handleStyle(changed, COLOR_SETTING.MENU_DROPDOWN_HOVER_COLOR)}
                />
            </div>
        </div>
    )
}


export default SubElementEditorMenu