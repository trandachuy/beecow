import './PlatformSelector.sass'

import React from 'react'
import GSComponentTooltip from "../../../../../components/shared/GSComponentTooltip/GSComponentTooltip";
import i18next from "i18next";
import GSTooltip from "../../../../../components/shared/GSTooltip/GSTooltip";
import GSButton from "../../../../../components/shared/GSButton/GSButton";
import ThemeEngineConstants from "../../../../theme/theme-making/ThemeEngineConstants";
import GSImg from "../../../../../components/shared/GSImg/GSImg";
import {bool, func, oneOf, shape} from "prop-types";

const PlatformSelector = props => {
    const {platform, onChange, hiddenResponsive} = props

    return (
        <div className={"d-flex justify-content-center platform-selector"}>
            <GSComponentTooltip message={i18next.t('component.toolbarView.tooltip.desktop')}
                                theme={GSTooltip.THEME.LIGHT}>
                <GSButton
                    className={"view-button"}
                    onClick={e => {
                        onChange(ThemeEngineConstants.PLATFORM_TYPE.DESKTOP);
                    }}>
                    <GSImg
                        className={"view-icon"}
                        src={`/assets/images/icon-desktop-${(platform === ThemeEngineConstants.PLATFORM_TYPE.DESKTOP) ? "active" : "inactive"}.png`}
                        height={30}>
                    </GSImg>
                </GSButton>
            </GSComponentTooltip>
            {!hiddenResponsive && <GSComponentTooltip message={i18next.t('component.toolbarView.tooltip.mobile')}
                                theme={GSTooltip.THEME.LIGHT}>
                <GSButton marginLeft
                          className={"view-button"}
                          onClick={e => {
                              onChange(ThemeEngineConstants.PLATFORM_TYPE.RESPONSIVE);
                          }}>
                    <GSImg
                        className={"view-icon"}
                        src={`/assets/images/icon-responsive-${(platform === ThemeEngineConstants.PLATFORM_TYPE.RESPONSIVE) ? "active" : "inactive"}.png`}
                        height={30}>
                    </GSImg>
                </GSButton>
            </GSComponentTooltip>}
            <span className='toolbar-view-indicator'></span>
            <GSComponentTooltip message={i18next.t('component.toolbarView.tooltip.app')}
                                theme={GSTooltip.THEME.LIGHT}>
                <GSButton marginLeft
                          className={"view-button"}
                          onClick={e => {
                              onChange(ThemeEngineConstants.PLATFORM_TYPE.MOBILE);
                          }}>
                    <GSImg
                        className={"view-icon"}
                        src={`/assets/images/icon-app-${(platform === ThemeEngineConstants.PLATFORM_TYPE.MOBILE) ? "active" : "inactive"}.png`}
                        height={30}>
                    </GSImg>
                </GSButton>
            </GSComponentTooltip>
        </div>
    )
}

PlatformSelector.defaultProps = {
    platform: ThemeEngineConstants.PLATFORM_TYPE.DESKTOP,
    onChange: () => {
    },
    hiddenResponsive: false
}

PlatformSelector.propTypes = {
    platform: oneOf(Object.values(ThemeEngineConstants.PLATFORM_TYPE)),
    onChange: func,
    hiddenResponsive: bool,
}

export default PlatformSelector