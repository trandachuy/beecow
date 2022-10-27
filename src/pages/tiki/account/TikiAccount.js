import './TikiAccount.sass'
import moment from "moment"
import {v4 as uuidv4} from 'uuid'
import PropTypes from "prop-types"
import {Trans} from "react-i18next"
import i18next from "../../../config/i18n"
import {GSToast} from "../../../utils/gs-toast"
import {UikAvatar, UikWidget} from "../../../@uik"
import tikiService from "../../../services/TikiService"
import React, {useRef, useState, useEffect} from 'react'
import {CredentialUtils} from "../../../utils/credential"
import GSImg from "../../../components/shared/GSImg/GSImg"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import GSButton from "../../../components/shared/GSButton/GSButton"
import GSFakeLink from "../../../components/shared/GSFakeLink/GSFakeLink"
import TikiShopModel from "../../../components/shared/model/TikiShopModel"
import GSContentBody from "../../../components/layout/contentBody/GSContentBody"
import GSContentHeader from "../../../components/layout/contentHeader/GSContentHeader"
import GSContentContainer from "../../../components/layout/contentContainer/GSContentContainer"
import ConfirmModalCheckBox from "../../../components/shared/ConfirmModalCheckBox/ConfirmModalCheckBox"
import ConfirmModalChildren from "../../../components/shared/ConfirmModalChildren/ConfirmModalChildren"
import ContentBreakcrum, {Breakcrum} from "../../../components/layout/contentBreakcrum/ContentBreakcrum"
import Loading from "../../../components/shared/Loading/Loading";

const LABEL = {
    INTRO: {
        TITLE: i18next.t('tiki.account.intro.title'),
        CONTENT: i18next.t('tiki.account.intro.content'),
        INSTRUCTION: i18next.t('tiki.account.intro.content.instruction'),
        ENABLE: i18next.t('tiki.account.intro.enable'),
        DESCRIPTION: {
            FIRST: i18next.t('tiki.account.intro.description.first'),
            SUB_FIRST: i18next.t('tiki.account.intro.description.first.sub'),
            SECOND: i18next.t('tiki.account.intro.description.second'),
            SUB_SECOND: i18next.t('tiki.account.intro.description.second.sub'),
            THIRD: i18next.t('tiki.account.intro.description.third'),
            SUB_THIRD: i18next.t('tiki.account.intro.description.third.sub'),
        }
    },
    ACCOUNT: {
        DESCRIPTION: i18next.t('tiki.account.author.description'),
        DISCONNECT: i18next.t('tiki.account.author.disconnect')
    },
    PRODUCT: {
        TITLE: i18next.t('tiki.account.product.title'),
        DESCRIPTION: i18next.t('tiki.account.product.description'),
        SYNCHRONIZE: i18next.t('tiki.account.product.synchronize'),
        WARNING: i18next.t('tiki.account.product.warning'),
        SYNC_TITLE: i18next.t('tiki.account.product.synchronized.time'),
        NEVER_SYNC: i18next.t('tiki.account.product.synchronized.time.never'),
        STATUS: {
            SYNCHRONIZING: i18next.t('tiki.account.product.status.synchronizing'),
            SYNCHRONIZED: i18next.t('tiki.account.product.status.synchronized'),
            NOT_SYNC: i18next.t('tiki.account.product.status.not_synced'),
        }
    }
}

const PRODUCT_IMAGE_STATUS = {
    PRODUCT_IMAGE_SYNCHRONIZE_ERROR: 'SYNCHRONIZE_ERROR',
    PRODUCT_IMAGE_NOTHING: 'NOTHING',
    PRODUCT_IMAGE_SYNCHRONIZING: 'SYNCHRONIZING',
    PRODUCT_IMAGE_SYNCHRONIZED: 'SYNCHRONIZIED',
    ORDER_IMAGE_FETCHED: 'FETCHED',
    ORDER_IMAGE_FETCHING: 'FETCHING',
}

const TikiAccount = (props) => {
    const [stShop, setStShop] = useState(props.shop)
    const [stBreakcrums, setStBreakcrums] = useState(props.breakcrums || [
        new Breakcrum('component.button.selector.saleChannel.tiki', '/channel/tiki/account'),
        new Breakcrum('component.navigation.account', '/channel/tiki/account'),
    ])
    const [stProductImageStatus, setStProductImageStatus] = useState(PRODUCT_IMAGE_STATUS.PRODUCT_IMAGE_NOTHING)
    const [stProductImportStatus, setStProductImportStatus] = useState(i18next.t('common.message.loading'))
    const [stProductImportTime, setStProductImportTime] = useState(i18next.t('common.message.loading'))
    const [stNumberOfFetch, setStNumberOfFetch] = useState(null)
    const [stNumberOfSync, setStNumberOfSync] = useState(null)
    const [stProductButtonEnabled, setStProductButtonEnabled] = useState(false)
    const [stIsLoading, setStIsLoading] = useState(true)

    const refConfirmModalCheckbox = useRef(null)
    const refConfirmModalChildren = useRef(null)

    useEffect(() => {
        if (!stShop) {
            tikiService.getShopAccounts()
                .then((shopAccounts) => {
                    if (shopAccounts.length) {
                        setStShop(shopAccounts[0])
                    }
                })
                .finally(() => {
                    setStIsLoading(false);
                })
        } else {
            setStIsLoading(false);
        }
    }, [])

    useEffect(() => {
        CredentialUtils.setTikiShopAccount(stShop)

        if (stShop) {
            getProductStatus()
        }
    }, [stShop])

    const authorization = () => {
        window.location.href = `https://${process.env.TIKI_OAUTH_URI}/sc/oauth2/auth?response_type=code&client_id=${process.env.TIKI_CLIENT_ID}&redirect_uri=${process.env.TIKI_REDIRECT_URI}&scope=offline%20all&state=${uuidv4()}`
    }

    const disconnect = () => {
        refConfirmModalCheckbox.current.openModal({
            messages: i18next.t('tiki.account.author.confirm.remove.synced.hint'),
            modalTitle: i18next.t('tiki.account.author.confirm.disconnect.hint'),
            okCallback: () => {
                tikiService.disconnect()
                    .then(() => {
                        setStShop(null)
                    })
            }
        })
    }

    const runFetchWarning = () => {
        refConfirmModalChildren.current.openModal({
            okCallback: () => fetchOrSync(true),
            cancelCallback: () => fetchOrSync(false)
        })
    }

    const fetchOrSync = (overwrite) => {
        setStProductImportStatus(LABEL.PRODUCT.STATUS.SYNCHRONIZING)
        setStProductImageStatus(PRODUCT_IMAGE_STATUS.PRODUCT_IMAGE_SYNCHRONIZING)
        setStProductButtonEnabled(false)
        setStNumberOfFetch(null)
        setStNumberOfSync(null)

        tikiService.syncProduct(overwrite)
            .catch((e) => GSToast.commonError())
    }

    const getProductStatus = () => {
        tikiService.getProductSyncStatus()
            .then(response => {
                const {code, error, numberOfFetch, numberOfSync, zoneTime} = response
                let productButtonEnabled = true

                if (response) {
                    setStNumberOfFetch(numberOfFetch)
                    setStNumberOfSync(numberOfSync)

                    if (code === PRODUCT_IMAGE_STATUS.PRODUCT_IMAGE_SYNCHRONIZING) {
                        setStProductImportStatus(LABEL.PRODUCT.STATUS.SYNCHRONIZING)
                        productButtonEnabled = false
                        setStProductImageStatus(PRODUCT_IMAGE_STATUS.PRODUCT_IMAGE_SYNCHRONIZING)
                    } else {
                        if (error && zoneTime) {
                            setStProductImportStatus(LABEL.PRODUCT.STATUS.SYNCHRONIZED)
                            setStProductImageStatus(PRODUCT_IMAGE_STATUS.PRODUCT_IMAGE_SYNCHRONIZED)
                        } else {
                            setStProductImportStatus(LABEL.PRODUCT.STATUS.NOT_SYNC)
                            setStProductImageStatus(PRODUCT_IMAGE_STATUS.PRODUCT_IMAGE_NOTHING)
                        }
                    }
                } else {
                    setStProductImportStatus(LABEL.PRODUCT.STATUS.NOT_SYNC)
                    setStProductImageStatus(PRODUCT_IMAGE_STATUS.PRODUCT_IMAGE_NOTHING)
                }

                // time
                if (!zoneTime) {
                    setStProductImportTime(`${LABEL.PRODUCT.SYNC_TITLE} : ${LABEL.PRODUCT.NEVER_SYNC}`)
                } else {
                    const locale = CredentialUtils.getLangKey()

                    setStProductImportTime(`${LABEL.PRODUCT.SYNC_TITLE} : ${moment(zoneTime).locale(locale).fromNow()}`);
                }

                setStProductButtonEnabled(productButtonEnabled);
            })
    }

    const renderDisconnectedState = () => (
        <>
            <GSContentContainer className="d-flex flex-column">
                <GSContentBody size={GSContentBody.size.MAX} className='tiki-intro'>
                    <div className='tiki-intro-header'>
                        <h1>{LABEL.INTRO.TITLE}</h1>
                        <span>{LABEL.INTRO.CONTENT}<br/></span>
                        <GSFakeLink className='text-decoration-underline'>
                            {LABEL.INTRO.INSTRUCTION}
                        </GSFakeLink>
                        <GSButton primary className="tiki-intro__button mt-5" onClick={authorization}>
                            {LABEL.INTRO.ENABLE}
                        </GSButton>
                    </div>
                    <div className='row justify-content-center pt-5 pb-5'>
                        <div className='col-xl-5 col-lg-6 d-flex justify-content-center'>
                            <GSImg src='/assets/images/tiki/intro.png' className='d-none d-lg-block w-75'/>
                        </div>
                        <div
                            className='col-xl-5 col-lg-6 col-10 d-flex flex-column justify-content-around tiki-intro-description'>
                            <div className='d-flex'>
                                <i className="fa fa-star" aria-hidden="true"></i>
                                <div>
                                    <h3>{LABEL.INTRO.DESCRIPTION.FIRST}</h3>
                                    <p>{LABEL.INTRO.DESCRIPTION.SUB_FIRST}</p>
                                </div>
                            </div>
                            <div className='d-flex'>
                                <i className="fa fa-star" aria-hidden="true"></i>
                                <div>
                                    <h3>{LABEL.INTRO.DESCRIPTION.SECOND}</h3>
                                    <p>{LABEL.INTRO.DESCRIPTION.SUB_SECOND}</p>
                                </div>
                            </div>
                            <div className='d-flex'>
                                <i className="fa fa-star" aria-hidden="true"></i>
                                <div>
                                    <h3>{LABEL.INTRO.DESCRIPTION.THIRD}</h3>
                                    <p>{LABEL.INTRO.DESCRIPTION.SUB_THIRD}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </GSContentBody>
            </GSContentContainer>
        </>
    )

    const renderConnectedState = () => {
        const {tkName, logo, registrationStatus} = stShop

        return (<GSContentContainer className='sp-account'>
            <GSContentHeader children={<ContentBreakcrum breakcrumList={stBreakcrums}/>}/>
            <GSContentBody className='sp-account__body' size={GSContentBody.size.MAX} className='sp-account__body'>
                <UikWidget className='gs-widget sp-connected'>
                    <div className='sp-connected__content'>
                            <span className='left'>
                                <p className='title'>
                                    <Trans i18nKey="component.navigation.account"/>
                                </p>
                                <p className='description'>{LABEL.ACCOUNT.DESCRIPTION}</p>
                            </span>
                        <span className='right'>
                                <UikAvatar
                                    className="avatar"
                                    imgUrl={logo}
                                    size='larger'
                                    margin='true'/>
                                <span className='info'>
                                    <span className='title'>{tkName}</span>
                                    <br/>
                                    <span>
                                        Status: <span className='status'>{registrationStatus}</span>
                                    </span>
                                </span>
                                <GSButton success className='btn-disconnect'
                                          onClick={disconnect}>{LABEL.ACCOUNT.DISCONNECT}</GSButton>
                            </span>
                    </div>
                    {/* PRODUCT */}
                    <div className='sp-connected__content'>
                            <span className='left'>
                                <p className='title'>{LABEL.PRODUCT.TITLE}</p>
                                <p className='description'>{LABEL.PRODUCT.DESCRIPTION}</p>
                            </span>
                        <span className='right'>
                            {
                                stProductImageStatus == PRODUCT_IMAGE_STATUS.PRODUCT_IMAGE_SYNCHRONIZE_ERROR &&
                                <FontAwesomeIcon className="avatar image-status__red" icon="sync-alt"/>
                            }
                            {
                                stProductImageStatus == PRODUCT_IMAGE_STATUS.PRODUCT_IMAGE_NOTHING &&
                                <FontAwesomeIcon className="avatar image-status__grey" icon="sync-alt"/>
                            }
                            {
                                stProductImageStatus == PRODUCT_IMAGE_STATUS.PRODUCT_IMAGE_SYNCHRONIZING &&
                                <FontAwesomeIcon className="avatar image-status__grey image-rotate" icon="sync-alt"/>
                            }
                            {
                                stProductImageStatus == PRODUCT_IMAGE_STATUS.PRODUCT_IMAGE_SYNCHRONIZED &&
                                <FontAwesomeIcon className="avatar image-status__green" icon="check-circle"/>
                            }
                            <span className='info'>
                                    <span className='synch-title'>
                                        {stProductImportStatus}
                                        {stNumberOfSync !== null && stNumberOfFetch !== null
                                        && <span>
                                                {`(${stNumberOfSync}/${stNumberOfFetch})`}
                                            </span>
                                        }
                                    </span>
                                    <br/>
                                    <span className='synch-status'>
                                        {stProductImportTime}
                                    </span>
                                </span>
                                <GSButton
                                    success
                                    className={'btn-disconnect ' + (stProductButtonEnabled == false ? 'gs-atm--disable' : '')}
                                    onClick={runFetchWarning}
                                >
                                    {LABEL.PRODUCT.SYNCHRONIZE}
                                </GSButton>
                            </span>
                    </div>
                </UikWidget>
            </GSContentBody>
            <ConfirmModalCheckBox ref={(el) => {
                refConfirmModalCheckbox.current = el
            }}/>
            <ConfirmModalChildren
                ref={(el) => {
                    refConfirmModalChildren.current = el
                }}
                btnOkName={i18next.t('common.btn.yes')}
                btnCancelName={i18next.t('common.btn.no')}
            >
                {LABEL.PRODUCT.WARNING}
            </ConfirmModalChildren>
        </GSContentContainer>)
    }

    return stIsLoading ? <Loading/> : (stShop ? renderConnectedState() : renderDisconnectedState())
}

TikiAccount.propTypes = {
    shop: PropTypes.instanceOf(TikiShopModel),
    breakcrums: PropTypes.arrayOf(PropTypes.instanceOf(Breakcrum))
}

export default TikiAccount