/*
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 29/3/2019
 * Author: Dai Mai <email: dai.mai@mediastep.com>
 */

import React, {Component} from 'react';
import GSContentContainer from "../../../components/layout/contentContainer/GSContentContainer";
import GSContentHeader from "../../../components/layout/contentHeader/GSContentHeader";
import GSContentBody from "../../../components/layout/contentBody/GSContentBody";
import i18next from "i18next";
import GSContentHeaderRightEl
    from "../../../components/layout/contentHeader/ContentHeaderRightEl/GSContentHeaderRightEl";
import {Trans} from "react-i18next";
import GSWidget from "../../../components/shared/form/GSWidget/GSWidget";
import GSWidgetContent from "../../../components/shared/form/GSWidget/GSWidgetContent";
import AvFieldCountable from "../../../components/shared/form/CountableAvField/AvFieldCountable";
import {AvForm} from 'availity-reactstrap-validation'
import Label from "reactstrap/es/Label";
import './Domain.sass'
import {StoreUtils} from "../../../utils/store";
import {cancelablePromise} from "../../../utils/promise";
import AlertInline, {AlertInlineType} from "../../../components/shared/AlertInline/AlertInline";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import storeService from "../../../services/StoreService";
import storageService from "../../../services/storage";
import Constants from "../../../config/Constant";
import LoadingScreen from "../../../components/shared/LoadingScreen/LoadingScreen";
import {GSToast} from "../../../utils/gs-toast";
import GSLearnMoreFooter from "../../../components/shared/GSLearnMoreFooter/GSLearnMoreFooter";
import GSContentFooter from "../../../components/layout/GSContentFooter/GSContentFooter";
import GSButton from "../../../components/shared/GSButton/GSButton";
import {FormValidate} from "../../../config/form-validate";
import {PACKAGE_FEATURE_CODES} from "../../../config/package-features";
import PrivateComponent from "../../../components/shared/PrivateComponent/PrivateComponent";

class Domains extends Component {
    GUIDE_LINK = 'http://bit.ly/thietlaptenmiengosell'
    ORL_URL = ''
    NEW_DOMAIN_ID = null

    state = {
        subDomain: '',
        newDomain: '',
        isSubDomainValid: true,
        isFetching: true,
        isSaving: false,
        isSubDomainUpdateSuccess: false,
        isNewDomainUpdateSuccess: false,
        messageResponseAPI: ""
    }

    constructor(props) {
        super(props);

        this.onChangeSubDomain = this.onChangeSubDomain.bind(this)
        this.onClickSave = this.onClickSave.bind(this);
        this.onValidSubmit = this.onValidSubmit.bind(this);
        this.handleNewDomainChange = this.handleNewDomainChange.bind(this);
    }

    onClickSave() {

        this.refBtnSubmit.click()


        // this.setState({
        //     isSaving: true
        // })

        // this.pmUpdateSubDomain = cancelablePromise( storeService.updateSubDomain())
    }

    onValidSubmit(event, values) {
        const subDomain = values.subDomain
        const newDomain = values.newDomain

        // detect change
        // console.log(newDomain, this.state.newDomain, subDomain, this.state.subDomain)
        if ( newDomain === this.state.newDomain && subDomain === this.ORL_URL) return

        this.setState({
            isNewDomainUpdateSuccess: false,
            isSubDomainUpdateSuccess: false
        })

        this.pmCheckDuplicate = cancelablePromise(StoreUtils.checkDuplicateURL(`${subDomain.toLowerCase()}`,  this.ORL_URL))
        this.pmCheckDuplicate.promise
            .then( result => {
                if (result.isValidLink) { // => Link is fine, start saving
                    this.setState({
                        isSubDomainValid: true,
                        isSaving: true,
                        messageResponseAPI: result.message
                    })

                    let promiseArr = []
                    // console.log(subDomain, this.ORL_URL)
                    if (subDomain !== this.ORL_URL) {
                        this.pmUpdateSubDomain = storeService.updateSubDomain(subDomain)
                        promiseArr.push(this.pmUpdateSubDomain)
                    }

                    // if new domain change
                    // console.log('newDMID ', this.NEW_DOMAIN_ID)
                    if (newDomain !== this.state.newDomain) {
                        if (newDomain === '' && this.NEW_DOMAIN_ID) { // remove
                            this.pmUpdateNewDomain = storeService.removeNewDomain(this.NEW_DOMAIN_ID)
                            promiseArr.push(this.pmUpdateNewDomain)
                        } else {
                            if (this.NEW_DOMAIN_ID) { // update
                                this.pmUpdateNewDomain = storeService.updateNewDomain(newDomain, this.NEW_DOMAIN_ID)
                                promiseArr.push(this.pmUpdateNewDomain)
                            } else { // create new
                                this.pmUpdateNewDomain = storeService.postNewDomain(newDomain)
                                promiseArr.push(this.pmUpdateNewDomain)
                            }
                        }
                    }

                    this.pmSaveDomain = cancelablePromise(Promise.all(promiseArr))
                    this.pmSaveDomain.promise
                        .then( results => {
                            let subDomainResult = results[0]
                            let newDomainResult = results[1]

                            if (results[0].urlType ) { // only update new domain
                                newDomainResult = results[0]
                                subDomainResult = undefined
                            }

                            if (!results[0].urlType && !results[0].url) { // only remove new domain
                                // console.log('===> remove')
                                this.NEW_DOMAIN_ID = null
                                newDomainResult = {
                                    id: null
                                }
                                subDomainResult = undefined
                            }

                            let newState = {}

                            // update subdomain
                            if (subDomainResult) {
                                newState.isSaving= false
                                newState.isSubDomainUpdateSuccess=true
                                this.ORL_URL = subDomain
                            }

                            // update newdomain
                            if (newDomainResult) {
                                // console.log(newDomainResult)
                                newState.isSaving= false
                                newState.isNewDomainUpdateSuccess = true
                                newState.newDomain = newDomain
                                this.NEW_DOMAIN_ID = newDomainResult.id
                            }

                            if (subDomainResult || newDomainResult) {
                                this.setState(newState)
                                // console.log('update ', this.NEW_DOMAIN_ID)
                            } else {
                                this.setState({
                                    isSaving: false
                                })
                            }
                        })
                        .catch( e => {
                            console.log(e)
                            GSToast.commonError()
                            this.setState({
                                isSaving: false,
                                messageResponseAPI: e.message
                            })
                        })


                } else {
                    this.setState({
                        isSubDomainValid: result.isValidLink,
                        messageResponseAPI: result.message
                    })
                }
            })
    }

    componentDidMount() {
        this.pmStoreInfo = cancelablePromise(
            storeService.getStoreInfo(storageService.getFromLocalStorage(Constants.STORAGE_KEY_STORE_ID)))
        this.pmStoreInfo.promise
            .then( res => {
                this.ORL_URL  = res.url
                this.setState({
                    isFetching: false,
                    subDomain: res.url
                })
            })
            .catch(e => {
                // GSToast.commonError()
            })


        this.pmStoreUrl = cancelablePromise(
            storeService.getStoreUrl(Constants.StoreUrlType.STOREFRONT)
        )
        this.pmStoreUrl.promise
            .then( res => {
                this.NEW_DOMAIN_ID  = res.id
                this.setState({
                    isFetching: false,
                    newDomain: res.url
                })
            })
            .catch( e => {
                // GSToast.commonError()
            })
    }


    onChangeSubDomain(e) {
        const subDomain = e.currentTarget.value
        this.setState({
            subDomain: subDomain,
            isSubDomainUpdateSuccess: false
        })

        // this.pmCheckDuplicate = cancelablePromise(StoreUtils.checkDuplicateURL(`${subDomain}`,  this.ORL_URL))
        // this.pmCheckDuplicate.promise
        //     .then( result => {
        //         if (result.isValidLink) {
        //             this.setState({
        //                 isSubDomainValid: true
        //             })
        //         } else {
        //             this.setState({
        //                 isSubDomainValid: false
        //             })
        //         }
        //     })
        //     .catch(console.log)

    }

    componentWillUnmount() {
        if (this.pmCheckDuplicate) this.pmCheckDuplicate.cancel()
        if (this.pmStoreInfo) this.pmStoreInfo.cancel()
        if (this.pmSaveDomain) this.pmSaveDomain.cancel()
        if (this.pmStoreUrl) this.pmStoreUrl.cancel()
    }

    handleNewDomainChange() {
        this.setState({
            isNewDomainUpdateSuccess: false
        })
    }

    render() {
        return (
            <GSContentContainer className="domain" isLoading={this.state.isFetching}>
                {this.state.isSaving && <LoadingScreen/>}

                <GSContentHeader title={i18next.t("page.storeFront.domain.title")}>
                    <GSContentHeaderRightEl className="gss-content-header--action-btn">
                        <GSButton success onClick={this.onClickSave}>
                            <Trans i18nKey="common.btn.save"/>
                        </GSButton>
                    </GSContentHeaderRightEl>
                </GSContentHeader>
                <GSContentBody size={GSContentBody.size.LARGE}>
                    <GSWidget>
                        <GSWidgetContent>
                            <AvForm onValidSubmit={this.onValidSubmit} autoComplete="off">
                                <button hidden ref={el=> this.refBtnSubmit = el}>Submit</button>
                                {/*SUBDOMAIN*/}
                                <Label className="gs-frm-control__title sub-domain-title" for="subDomain">
                                    <span>
                                        <Trans i18nKey="page.storeFront.domain.currentTab.basicShopAddress"/>
                                    </span>
                                    <span className="sub-domain__sample d-mobile-none d-desktop-inline">
                                        <Trans i18nKey="page.storeFront.domain.currentTab.default"
                                        values={{
                                            subDomain: this.state.subDomain
                                        }}/>
                                        {process.env.STOREFRONT_DOMAIN}
                                    </span>
                                </Label>
                                <PrivateComponent hasAnyPackageFeature={[PACKAGE_FEATURE_CODES.FEATURE_0333]}
                                              wrapperDisplay={"block"}
                                >
                                <AvFieldCountable minLength={3} maxLength={150} name="subDomain" onChange={this.onChangeSubDomain}
                                                  value={this.state.subDomain}
                                                  validate={{
                                    ...FormValidate.pattern.letterOrNumberOrHyphen()
                                }}
                                />
                                </PrivateComponent>
                                <span className="mobile-sub-domain__sample d-mobile-block d-desktop-none">
                                        <Trans i18nKey="page.storeFront.domain.currentTab.default"
                                               values={{
                                                   subDomain: this.state.subDomain
                                               }}/>
                                    {process.env.STOREFRONT_DOMAIN}
                                </span>
                                {!this.state.isSubDomainValid &&
                                    <div className="error-msg">
                                        <AlertInline
                                            nonIcon
                                            text={i18next.t("page.storeFront.domain.currentTab."+`${this.state.messageResponseAPI}`)} type={AlertInlineType.ERROR}
                                        />
                                    </div>
                                }
                                {this.state.isSubDomainUpdateSuccess &&
                                <div className="error-msg">
                                    <AlertInline
                                        nonIcon
                                        text={i18next.t("page.storeFront.domain.sub.updateSuccess", {
                                            subDomain: this.state.subDomain + `.${process.env.STOREFRONT_DOMAIN}`
                                        })} type={AlertInlineType.SUCCESS}
                                    />
                                </div>
                                }

                                {/*NEW DOMAIN*/}
                                <Label className="gs-frm-control__title sub-domain-title" for="newDomain">
                                    <span>
                                        <Trans i18nKey="page.storeFront.domain.customize.newDomain"/>
                                    </span>
                                </Label>
                                <PrivateComponent wrapperStyle={{"width": "100%"}} hasAnyPackageFeature={[PACKAGE_FEATURE_CODES.FEATURE_0332]}>
                                <AvFieldCountable minLength={0} maxLength={150} name="newDomain" isRequired={false}
                                                  value={this.state.newDomain}
                                                  placeholder={i18next.t('page.home.wg.example')}
                                                  onChange={this.handleNewDomainChange}
                                                  validate={{
                                                      ...FormValidate.pattern.letterOrNumberOrHyphenOrDot()
                                                  }}/>
                                </PrivateComponent>
                                {this.state.isNewDomainUpdateSuccess &&
                                <div className="error-msg">
                                    <AlertInline
                                        nonIcon
                                        text={i18next.t("page.storeFront.domain.new.updateSuccess", {
                                            newDomain: this.state.newDomain
                                        })} type={AlertInlineType.SUCCESS}
                                    />
                                </div>
                                }

                                {/*USER GUIDE*/}
                                <Label className="gs-frm-control__title sub-domain-title" for="userGuide">
                                    <span>
                                        <Trans i18nKey="page.storeFront.domain.customize.userGuide"/>
                                    </span>
                                </Label>
                                <a href={this.GUIDE_LINK} target="_blank">
                                    <Trans i18nKey="page.storeFront.domain.customize.userGuide.link"/>
                                    {' '}
                                    <FontAwesomeIcon icon="long-arrow-alt-right"/>
                                </a>
                            </AvForm>
                        </GSWidgetContent>
                    </GSWidget>
                </GSContentBody>

                <GSContentFooter>
                    <GSLearnMoreFooter
                        text={i18next.t("component.navigation.domains")}
                        linkTo={Constants.UrlRefs.LEARN_MORE_CUSTOM_DOMAIN}/>
                </GSContentFooter>

            </GSContentContainer>
        );
    }
}

export default Domains;
