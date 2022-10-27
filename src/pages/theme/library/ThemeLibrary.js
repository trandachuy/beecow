import './ThemeLibrary.sass';

import React, {useEffect, useRef, useState} from 'react';
import GSTrans from "../../../components/shared/GSTrans/GSTrans";
import GSContentHeader from "../../../components/layout/contentHeader/GSContentHeader";
import i18next from "i18next";
import GSContentBody from "../../../components/layout/contentBody/GSContentBody";
import {Col, Row} from "reactstrap";
import GSContentContainer from "../../../components/layout/contentContainer/GSContentContainer";
import GSImg from "../../../components/shared/GSImg/GSImg";
import {ThemeEngineService} from "../../../services/ThemeEngineService";
import GSButton from "../../../components/shared/GSButton/GSButton";
import GSPagination from "../../../components/shared/GSPagination/GSPagination";
import { withRouter } from "react-router-dom";
import {NAV_PATH} from "../../../components/layout/navigation/Navigation";
import { generatePath } from "react-router-dom"
import {Trans} from "react-i18next";
import GSModalBootstrap from "../../../components/shared/GSModalBootstrap/GSModalBootstrap";
import {UikSelect} from '../../../@uik';
import {TokenUtils} from "../../../utils/token";
import {GSToast} from "../../../utils/gs-toast";
import ThemeEngineConstants from "../theme-making/ThemeEngineConstants";

const ThemeLibrary = () => {
    const refModalSwitch = useRef()
    const [stIsFetching, setStIsFetching] = useState(true)
    const [stMasterThemes, setStMasterThemes] = useState([])
    const [stStoreThemes, setStStoreThemes] = useState([])
    const [stSwitchStoreThemeId, setStSwitchStoreThemeId] = useState()
    const [stSwitchMasterThemeId, setStSwitchMasterThemeId] = useState()
    const [stPaging, setStPaging] = useState({
        page: 0,
        size: 15,
        sort: 'lastModifiedDate,desc',
        total: 0,
    })

    useEffect(() => {
        fetchData(stPaging)
    }, [stPaging.page, stPaging.size, stPaging.sort])

    useEffect(() => {
        ThemeEngineService.getStoreThemesForTransfer()
            .then((result) => {
                if (result.length > 0) {
                    setStSwitchStoreThemeId(result[0].id)
                    setStStoreThemes(result)
                }
            })
            .catch(() => {
                GSToast.commonError()
            })
            .finally(() => {
                setStIsFetching(false)
            })
    }, [])

    const fetchData = (options) => {
        ThemeEngineService.getAllMasterThemes(options)
            .then((result) => {
                const totalItem = parseInt(result.headers['x-total-count'])

                setStPaging(paging => ({
                    ...paging,
                    total: totalItem
                }))
                setStMasterThemes(result.data)
            })
            .catch(() => {
                GSToast.commonError()
            })
            .finally(() => {
                setStIsFetching(false)
            })
    }

    const handleEdit = (id) => {
        setStSwitchMasterThemeId(id)
        if (stStoreThemes.length > 0) {
            refModalSwitch.current.open()
        } else {
            moveToThemeMaking(id)
        }
    }

    const moveToThemeMaking = (id) => {
        const themeMakingPath = generatePath(NAV_PATH.themeEngine.making, {
            themeId: id,
            themeType: ThemeEngineConstants.THEME_TYPE.MASTER
        })
        window.open(themeMakingPath, '_blank')
    }

    const moveToSwitchThemeMaking = (id, switchStoreThemeId) => {
        const themeMakingPath = generatePath(NAV_PATH.themeEngine.making, {
            themeId: id,
            themeType: ThemeEngineConstants.THEME_TYPE.MASTER
        })
        window.open(themeMakingPath + '?switchStoreThemeId=' + switchStoreThemeId, '_blank')
    }

    const handleView = (id) => {
        const themePreviewPath = generatePath(NAV_PATH.themeEngine.preview, {themeId: id})

        window.open(themePreviewPath, "_blank")
    }

    const handlePage = () => {
        setStPaging(paging => ({
            ...paging,
            page: paging.page + 1
        }))
    }

    const doEdit = () => {
        moveToThemeMaking(stSwitchMasterThemeId);
        refModalSwitch.current.close()
    }

    const doTransferAndEdit = () => {
        moveToSwitchThemeMaking(stSwitchMasterThemeId, stSwitchStoreThemeId);
        refModalSwitch.current.close()
    }

    const handleCategory = () => {
        fetchData({
            page: 0,
            size: stPaging.size,
            sort: stPaging.sort
        })
    }

    return (
        <GSContentContainer className="theme-library" isLoading={stIsFetching}>
            <GSContentHeader title={i18next.t("page.themeEngine.library.title")} size={GSContentBody.size.MAX}
                             className='theme-library__title'/>
            <GSContentBody size={GSContentBody.size.MAX}>
                <Row className='mt-4'>
                    <span className='theme-library-category' onClick={handleCategory}><GSTrans
                        t='page.themeEngine.library.category.all'/></span>
                </Row>
                <Row className='mt-3'>
                    <span className='theme-library-template__title'><GSTrans t='page.themeEngine.library.category.all'/></span>
                </Row>
                <Row hidden={!stMasterThemes.length} className='mt-3'>{
                    stMasterThemes.map(theme => (
                        <Col md={4} key={theme.id} className='theme-library-template__item'>
                            <div className='position-relative'>
                                <GSImg src={theme.thumbnail} alt='master theme'/>
                                <div className='theme-library-template__item__actions'>
                                    <GSButton success onClick={() => handleEdit(theme.id)}
                                              disabled={!TokenUtils.hasThemeEnginePermission()}>
                                        <GSTrans t={"page.themeEngine.library.button.edit"}/>
                                    </GSButton>
                                    <GSButton className='ml-2' onClick={() => handleView(theme.id)}>
                                        <GSTrans t={"page.themeEngine.library.button.view"}/>
                                    </GSButton>
                                </div>
                            </div>
                            <span className='font-weight-bold mt-auto mb-5 d-block font-size-16px'>{theme.name}</span>
                        </Col>
                    ))
                }
                </Row>
                <Row className='mt-3 justify-content-center'>
                    <GSPagination currentPage={stPaging.page + 1} pageSize={stPaging.size} totalItem={stPaging.total}
                                  onChangePage={handlePage}/>
                </Row>
            </GSContentBody>
            <GSModalBootstrap
                className={'modal-switch'}
                showClose={true}
                ref={refModalSwitch}
                header={i18next.t("page.themeEngine.modal.switch.resource")}
                footer={<div className="container">
                    <div className="row justify-content-center">
                        <GSButton success outline
                                  onClick={doEdit}>
                            <GSTrans t={"page.themeEngine.modal.switch.button.edit"}/>
                        </GSButton>
                        <GSButton success marginLeft
                                  onClick={doTransferAndEdit}>
                            <GSTrans t={"page.themeEngine.modal.switch.button.transferAndEdit"}/>
                        </GSButton>
                    </div>
                </div>}>

                <div className="container">
                    <div className="row justify-content-start p-0 m-0">
                        <div className="col-12">
                            <p className="font-weight-bold font-size-_9em">
                                <Trans i18nKey="page.themeEngine.modal.switch.description"/>
                            </p>
                        </div>
                    </div>
                    <div className="row justify-content-center p-0 m-0">
                        <div className="col-8">
                            <UikSelect
                                className="w-100"
                                defaultValue={stSwitchStoreThemeId}
                                options={stStoreThemes.map(x => {
                                    return {
                                        value: x.id,
                                        label: x.customName || x.masterTheme.name,
                                    }
                                })}
                            />
                        </div>
                    </div>
                </div>
            </GSModalBootstrap>
        </GSContentContainer>
    )
}

export default withRouter(ThemeLibrary)
