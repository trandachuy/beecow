/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 18/10/2019
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import GSTrans from "../../../../components/shared/GSTrans/GSTrans";
import GSTab, {createItem} from "../../../../components/shared/form/GSTab/GSTab";
import './CustomizationThemeReview.sass'
import ContentLoader from "react-content-loader";
import {PACKAGE_FEATURE_CODES} from "../../../../config/package-features";
import {TokenUtils} from "../../../../utils/token";

const CustomizationThemeReview = props => {
    const {className, lstComponent, focusOn, ...other} = props
    const lsComponentWebsite = lstComponent.filter(cpn => cpn.platForm === 'WEB' || cpn.platForm === 'WEB_APP')
    const lsComponentMobile = lstComponent.filter(cpn => cpn.platForm === 'APP' || cpn.platForm === 'WEB_APP')

    const [stCurrentTab, setStCurrentTab] = useState('');

    const [hasWEB, setHasWEB] = useState(false);
    const [hasAPP, setHasAPP] = useState(false);
    const [lstTab, setLstTab] = useState([]);

    useEffect(() => {

        let TABS = []

        // has app package
        if(TokenUtils.hasAnyPackageFeatures([PACKAGE_FEATURE_CODES.FEATURE_0294])){

            TABS.push(createItem(
                <>
                    <img className="tab-logo" alt="website" src="/assets/images/theme/icon-mobile.svg" width="20" height="20"/>
                    <GSTrans t={ "page.customization.design.preview.header.mobile"}/>
                </>
                , 'APP'))


            setHasAPP(true)
            setStCurrentTab('APP')
        }

        // has web package
        if(TokenUtils.hasAnyPackageFeatures([PACKAGE_FEATURE_CODES.FEATURE_0293])){
            TABS.push(createItem(
                <>
                    <img className="tab-logo" alt="website" src="/assets/images/theme/icon-website.svg" width="20" height="20"/>
                    <GSTrans t={ "page.customization.design.preview.header.website"}/>
                </>
                , 'WEB'))
            setHasWEB(true)
            setStCurrentTab('WEB')
        }

        setLstTab(TABS)

    }, [])


    // trigger when focusOnchange
    useEffect(() => {
        // switch tab
        switch (props.focusOn.platform) {
            // => switching to website tab if current is not web
            case 'WEB':
                if (stCurrentTab !== 'WEB') {
                    setStCurrentTab('WEB')
                }
                break
            // => switching to mobile tab if current is not mobile
            case 'APP':
                if (stCurrentTab !== 'APP') {
                    setStCurrentTab('APP')
                }
                break
            default:
                break
        }
    }, [props.focusOn.platform])


    useEffect(() => {
        // scroll to element
        if (props.focusOn.order !== null && props.focusOn.scroll) {
            const elementId = stCurrentTab + '_' + props.focusOn.order
            const elementRef = document.getElementById(elementId)
            if (elementRef) {
                elementRef.scrollIntoView({ block: 'center',  behavior: 'smooth' })
            }
        }
    }, [stCurrentTab, props.focusOn.order])


    const onChangeTab = (tab) => {
        setStCurrentTab(tab)
    }


    return (
        <div className={["customization-theme-review", className].join(' ')} {...other}>
            <div className="theme-component__preview-header">
                <div className="theme-component__title">
                    <GSTrans t={"page.customization.design.preview.header.themeLayout"}/>
                </div>
                <GSTab
                    items={lstTab}
                    itemMaxWidth
                    className="theme-component__tabs-header"
                    onChangeTab={onChangeTab}
                    active={stCurrentTab}
                />
            </div>
            <div className="theme-component__preview-body"  id="cpn-preview">
                {lstComponent.length === 0 &&
                <ContentLoader
                    height={300}
                    width={400}
                    speed={1}
                    primaryColor="#f3f3f3"
                    secondaryColor="#ecebeb"
                    className="image-loader"
                >

                </ContentLoader>
                }

                {(lstComponent && (hasWEB || hasAPP)) &&
                    <div className="theme-component__cpn-container">
                        {/*WEB SITE*/}
                        {
                            hasWEB &&
                            lsComponentWebsite.map((cpn, index) => {
                                return (
                                        <img className={["theme-component__img-preview", cpn.order === focusOn.order? 'active':''].join(' ')}
                                             key={cpn.order}
                                             src={cpn.preview_web}
                                             alt={cpn.name}
                                             id={'WEB_' + cpn.order}
                                             hidden={stCurrentTab !== 'WEB'}
                                             onClick={() => props.onClickComponent(cpn.order, stCurrentTab)}
                                        />
                                )
                            })
                        }

                        {/*MOBILE */}
                        {
                            hasAPP &&
                            lsComponentMobile.map(cpn => {
                                return (
                                        <img className={["theme-component__img-preview", cpn.order === focusOn.order? 'active':''].join(' ')}
                                             key={cpn.order}
                                             src={cpn.preview_app}
                                             alt={cpn.name}
                                             id={'APP_' + cpn.order}
                                             hidden={stCurrentTab !== 'APP'}
                                             onClick={() => props.onClickComponent(cpn.order, stCurrentTab)}
                                        />
                                )
                            })
                        }
                    </div>
                }
            </div>
        </div>
    );
};

CustomizationThemeReview.propTypes = {
    className: PropTypes.string,
    lstComponent: PropTypes.arrayOf(PropTypes.shape({
        component_id: PropTypes.string,
        component_name: PropTypes.string,
        component_title: PropTypes.string,
        editable: PropTypes.bool,
        id: PropTypes.number,
        is_required_title: PropTypes.bool,
        order: PropTypes.number,
        platForm: PropTypes.oneOf(['WEB','WEB_APP','APP']),
        preview_web: PropTypes.string,
        preview_app: PropTypes.string,
    })).isRequired,
    focusOn: PropTypes.shape({
        order: PropTypes.number,
        platform: PropTypes.oneOf(['WEB','WEB_APP','APP']),
        scroll: PropTypes.bool,
    }),
    onClickComponent: PropTypes.func,
};

export default CustomizationThemeReview;
