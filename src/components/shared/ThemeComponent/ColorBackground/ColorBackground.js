import React from "react";
import './ColorBackground.sass'
import GSWidget from "../../form/GSWidget/GSWidget";
import GSWidgetHeader from "../../form/GSWidget/GSWidgetHeader";
import GSWidgetContent from "../../form/GSWidget/GSWidgetContent";
import {Trans} from "react-i18next";
import _ from "lodash";
import authenticate from "../../../../services/authenticate";
import colorService from "../../../../services/ColorService";
import beehiveService from "../../../../services/BeehiveService";
import {cancelablePromise} from "../../../../utils/promise";
import PropTypes from "prop-types";
import Constants from "../../../../config/Constant";
import ColorPickerRow from "./ColorPickerRow/ColorPickerRow";
import GSTrans from "../../GSTrans/GSTrans";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";


export default class ColorBackground extends React.Component {

    constructor(props) {
        super(props);

        this.storeId = authenticate.getStoreId();

        this.const = {
            BUNDLE_ID_PREFIX: 'com.mediastep.'
        };

        this.state = {
            validColor: false,
            isShowMore: this.props.isShowMore,
            isLoading: false,
            colors: [],
            mobileConfig: {
                id: null,
                shopName: null,
                colorPrimary: null,
                colorSecondary: null,
                shopId: this.storeId,
                bundleId: this.const.BUNDLE_ID_PREFIX + this.storeId // temporary hardcode
            }
        };

        this.showOrOffContent = this.showOrOffContent.bind(this);
        this.handleSelectColor = this.handleSelectColor.bind(this);
        this.checkColorValue = this.checkColorValue.bind(this);
    }

    renderSupportedDevices() {
        return (
            <div className="device-wrapper">
                <img alt="desktop" className="device-icon" src="/assets/images/theme/icon-website.svg"/>
                <img alt="mobile" className="device-icon" src="/assets/images/theme/icon-mobile.svg"/>
            </div>
        )
    }

    componentDidMount() {
        let colorsAPI = colorService.getColors({});
        let mobileConfigAPI = beehiveService.getMobileConfig(this.storeId);

        this.getStoreInfo = cancelablePromise(Promise.all([colorsAPI, mobileConfigAPI]));
        this.setState({
            isLoading: true
        });
        this.getStoreInfo.promise.then((values) => {
                let colors = values[0];
                this.setState({colors: colors});

                let mobileConfig = values[1];
                if (!_.isEmpty(mobileConfig)) {
                    this.setState({
                        mobileConfig: mobileConfig,
                        oldColorPrimary: mobileConfig.colorPrimary
                    });
                    this.colorPicker.setDefaultColor(mobileConfig.colorPrimary);
                } else {
                    let firstColor = colors[0];
                    let mobileConfig = this.state.mobileConfig;
                    mobileConfig.colorPrimary = firstColor.primary;
                    mobileConfig.colorSecondary = firstColor.secondary;
                    this.setState({
                        mobileConfig: mobileConfig
                    });
                    this.colorPicker.setDefaultColor(firstColor.primary);
                }
                this.checkColorValue();
            },
            () => {
                this.setState({
                    isLoading: false
                });
            });
    }

    showOrOffContent() {
        this.setState(pre => ({
            isShowMore: !pre.isShowMore
        }))
    }

    hexToRgb(hex) {
        var bigint = parseInt(hex, 16);
        var r = (bigint >> 16) & 255;
        var g = (bigint >> 8) & 255;
        var b = bigint & 255;

        return {
            r,g,b
        }
    }

    handleSelectColor(selectedColor) {
        let mobileConfig = this.state.mobileConfig;
        mobileConfig.colorPrimary = selectedColor.primary;
        mobileConfig.colorSecondary = selectedColor.secondary;
        this.setState({
            mobileConfig: mobileConfig
        });
        this.props.onChange(mobileConfig);
        this.checkColorValue();
    }

    checkColorValue(){
        this.setState({
            validColor: _.includes(Constants.DEFAULT_COLOR, this.state.mobileConfig.colorPrimary)
        });
    }

    render() {
        return (
            <GSWidget className="theme-component__colorBackground">
                <GSWidgetHeader showCollapsedButton defaultOpen={this.state.isShowMore} onChangeCollapsedState={this.showOrOffContent}>
                    <div className="com-header">
                        <span className="com-name">
                            <Trans i18nKey="component.theme.color.background.name">Color</Trans>
                        </span>
                        {/*{this.renderSupportedDevices()}*/}
                    </div>
                </GSWidgetHeader>
                <GSWidgetContent hidden={!this.state.isShowMore}>
                    <div className="gs-frm-input__label row">
                        <div className="col-12">
                            <GSTrans t={"component.storefront.customization.logo.preview"}/>
                        </div>
                    </div>
                    <div className="com-content row" >


                        {
                        <div className=" col-12">
                            <div className="color__picker-present">

                                <div className="preview-website__wrapper">
                                    <div className="gs-frm-input__label">
                                        <GSTrans t={"page.customization.design.preview.header.website"}/>
                                    </div>
                                    <div className="preview-website">
                                        {this.state.mobileConfig.colorSecondary &&
                                        <div className="header-mobile"
                                             style={{
                                                 backgroundColor: '#'+ this.state.mobileConfig.colorPrimary
                                             }}>
                                            <img src={'/assets/images/gosell-logo-white.svg'} height={20} alt={'logo'}/>
                                            <div style={{
                                                backgroundColor: '#'+ this.state.mobileConfig.colorSecondary,
                                                borderRadius: 99999,
                                                height: 20,
                                                width: 50,
                                                transitionDuration: '.5s',
                                                transitionProperty: 'background-color',
                                                transitionTimingFunction: 'ease-out'
                                            }} />
                                        </div>
                                        }
                                    </div>
                                </div>

                                <div className="preview-mobile__wrapper">
                                    <div className="gs-frm-input__label">
                                        <GSTrans t={"page.customization.design.preview.header.mobile"}/>
                                    </div>
                                    <div className="preview-mobile">
                                        {this.state.mobileConfig.colorPrimary&&
                                            <div className="header-mobile"
                                                 style={{
                                                     backgroundColor: '#'+ this.state.mobileConfig.colorPrimary
                                                 }}>
                                                <img src={'/assets/images/gosell-logo-white.svg'} height={20} alt={'logo'}/>
                                                <FontAwesomeIcon icon="bars" color="white"/>
                                            </div>
                                        }
                                    </div>
                                </div>

                            </div>
                            {/*<img className="present" src="/assets/images/own_design.png"/>*/}

                            {/*{this.state.validColor &&*/}
                            {/*<span>*/}
                            {/*                        <img className="header-web"*/}
                            {/*                             src={'/assets/images/color_picker/' + this.state.mobileConfig.colorPrimary.replace('#', '').toUpperCase() + '.jpg'}/>*/}
                            {/*                        <img className="header-mobile"*/}
                            {/*                             src={'/assets/images/color_picker/' + this.state.mobileConfig.colorPrimary.replace('#', '').toUpperCase() + '.jpg'}/>*/}
                            {/*                    </span>*/}
                            {/*}*/}
                        </div>}
                    </div>
                    <div className="row mb-4">
                        <div className="col-12">
                            <p className="gsa__color--gray">
                                <Trans i18nKey="component.theme.color.background.description">
                                    These are colors that work
                                well with the other colors in your theme
                                </Trans>
                            </p>
                            <ColorPickerRow
                                colors={this.state.colors}
                                onChange={this.handleSelectColor}
                                value={this.state.mobileConfig.colorPrimary}
                            />
                        </div>
                    </div>
                </GSWidgetContent>
            </GSWidget>

        )
    }

}

ColorBackground.propTypes = {
  onChange: PropTypes.func,
    isShowMore: PropTypes.bool,
}
