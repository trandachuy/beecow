import React, {useEffect, useRef, useState} from 'react';
import './ShopeeAccountManagement.sass';
import GSContentContainer from "../../../components/layout/contentContainer/GSContentContainer";
import GSContentHeader from "../../../components/layout/contentHeader/GSContentHeader";
import i18next from "i18next";
import {UikCheckbox, UikWidget, UikWidgetContent} from "../../../@uik";
import GSButton from "../../../components/shared/GSButton/GSButton";
import GSTrans from "../../../components/shared/GSTrans/GSTrans";
import GSContentHeaderTitleWithExtraTag
    from "../../../components/layout/contentHeader/HeaderExtraTag/GSContentHeaderTitleWithExtraTag";
import GSContentHeaderRightEl
    from "../../../components/layout/contentHeader/ContentHeaderRightEl/GSContentHeaderRightEl";
import GSTable from "../../../components/shared/GSTable/GSTable";
import GSActionButton, {GSActionButtonIcons} from "../../../components/shared/GSActionButton/GSActionButton";
import {Trans} from "react-i18next";
import {Modal, ModalBody, ModalFooter, ModalHeader} from "reactstrap";
import {GSToast} from "../../../utils/gs-toast";
import shopeeService from "../../../services/ShopeeService";
import {RouteUtils} from '../../../utils/route';
import {NAV_PATH} from '../../../components/layout/navigation/Navigation';
import _ from 'lodash';
import moment from "moment";
import ShopeeConnector from './ShopeeConnector';
import ConfirmModal from '../../../components/shared/ConfirmModal/ConfirmModal';
import i18n from '../../../config/i18n';
import LoadingScreen from '../../../components/shared/LoadingScreen/LoadingScreen';
import storageService from "../../../services/storage";
import Constants from "../../../config/Constant";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';

function ShopeeAccountManagement(props) {
    const [modal, setModal] = useState(false);
    const [modalDelete, setModalDelete] = useState(false);
    const [numberPackage, setNumberPackage] = useState(1);
    const [numberAccount,setNumberAccount] = useState(0);
    const [stDeleteOpt, setStDeleteOpt] = useState({"SHOP": null, "DELOPT": false});

    const [shopAccounts, setShopAccounts] = useState([]);
    const [expiredDate , setExpiredDate] = useState(null)
    const [stCheckedDelete,] = useState(null);
    const [stLoading, setStLoading] = useState(false);
    const [stDeleting, setStDeleting] = useState(false);

    let refShopeeConnector = useRef(null);
    let refConfirmModal = useRef(null);

    const ACTION_STATUS = {
        DELETING: "DELETING",
        NONE: "NONE"
    }

    const CONNECTION_STATUS = {
        CONNECTED: "CONNECTED",
        DISCONNECTED: "DISCONNECTED"
    }

    useEffect(() => {
        lastActiveOrderPackage();
        getManageAccounts();
    }, [])

    const toggle = () => {
        setModal(!modal)
    };

    const toggleModalDelete = (id = null) => {
        setStDeleteOpt({
            ...stDeleteOpt,
            SHOP: id,
        })
        setModalDelete(!modalDelete);
    };

    const lastActiveOrderPackage = () => {
        shopeeService.getLastOrderByStoreId()
            .then((result) => {
                setNumberPackage((result.numberPackage || 0) + 1)
                setExpiredDate(result.expiredDate)
            })
            .catch(() => GSToast.commonError())
    }

    const onChangeDeleteOption = (e) => {
        const {name, checked} = e.target;
        setStDeleteOpt({
            ...stDeleteOpt,
            [name]: checked,
        });
    }

    const acceptDeleteShop = () => {
        toggleModalDelete();
        setStLoading(true);
        const opt = {...stDeleteOpt};
        shopeeService.deleteShopeeAccount(opt.SHOP, opt.DELOPT)
        .then((resp) => {
            //GSToast.commonDelete();
        })
        .catch(() => GSToast.commonError())
        .finally(() => {
            setStLoading(false);
            getManageAccounts();
        })
    }

    const getManageAccounts = () => {
        setStLoading(true);
        shopeeService.getManageAccountsByBcStoreId()
            .then(response => {
                setShopAccounts(response);
                setNumberAccount(response.length)
                if(_.isEmpty(response)) {
                    RouteUtils.redirectWithoutReload(props, NAV_PATH.shopeeAccountIntro);
                }
                const shopDeleting = response.find(s => s.shopActionStatus === ACTION_STATUS.DELETING);
                if(shopDeleting) {
                    setStDeleting(true);
                }
            })
            .catch(e =>{
                GSToast.commonError();
            })
            .finally(() => {
                setStLoading(false);
            })
    }

    const connectShopee = () => {
        storageService.removeSessionStorage(Constants.STORAGE_KEY_RECONNECT_SHOPEE_SHOP_ID);
        storageService.removeSessionStorage(Constants.STORAGE_KEY_RECONNECT_SHOPEE_SHOP_NAME);
        storageService.removeSessionStorage(Constants.STORAGE_KEY_RECONNECT_SHOPEE_BRANCH_ID);
        refShopeeConnector.current.openShopee();
    }

    const reconnectShopee = (id, shopeeId, branchId, shopName) => {
        storageService.setToSessionStorage(Constants.STORAGE_KEY_RECONNECT_SHOPEE_SHOP_ID, shopeeId);
        storageService.setToSessionStorage(Constants.STORAGE_KEY_RECONNECT_SHOPEE_SHOP_NAME, shopName);
        storageService.setToSessionStorage(Constants.STORAGE_KEY_RECONNECT_SHOPEE_BRANCH_ID, branchId);
        //refShopeeConnector.current.openShopee();
        shopeeService.reconnectShopeeAccount(id, shopeeId, branchId).finally(() => getManageAccounts())
    }

    const updateConnection = (id, shopeeId, branchId) => {
        shopeeService.disconnectShopeeAccount(id, shopeeId, branchId)
            .finally(() => {
                getManageAccounts();
            });
    }

    const openDisconnectedModal = (id, shopId, branchId) => {
        refConfirmModal.current.openModal({
            modalBtnOk: i18n.t("common.txt.alert.modal.btn"),
            modalBtnCancel: i18n.t("common.btn.cancel"),
            messageHtml: true,
            messages: (<div>
                <GSTrans t="shopee.account.disconnect.modal.description"><p></p></GSTrans>
            </div>),
            okCallback: function() {
                updateConnection(id, shopId, branchId);
            }
        });
    }

    return (
        <>
            <ConfirmModal ref={refConfirmModal}/>
            {stLoading && <LoadingScreen zIndex={1056}/>}
            <GSContentContainer className="ShopeeAccountManagement">

                <GSContentHeader
                    title={
                        <GSContentHeaderTitleWithExtraTag title={i18next.t("page.shopee.account.title")}/>
                    }
                    style={{
                        paddingBottom: "1em"
                    }}>
                    <GSContentHeaderRightEl className="d-flex">
                        <GSButton
                            success
                            onClick={() => {
                                if (numberAccount >= numberPackage) {
                                    return toggle();
                                }
                                return connectShopee();
                            }}>
                            <GSTrans t={"page.shopee.account.addAccount"}/>
                        </GSButton>
                    </GSContentHeaderRightEl>
                </GSContentHeader>


                <Modal isOpen={modal} toggle={toggle} className={`addAccountModal`}>
                    <ModalHeader toggle={toggle}><Trans
                        i18nKey="page.shopee.account.delete.title"></Trans></ModalHeader>
                    <ModalBody>
                        <p><Trans i18nKey="page.shopee.account.addAccount.description"
                                  values={{x: numberPackage}}></Trans></p>
                        <p><Trans i18nKey="page.shopee.account.addAccount.description2"></Trans></p>
                    </ModalBody>
                    <ModalFooter>
                        <GSButton default onClick={toggle}>
                            <GSTrans t={"common.btn.cancel"}/>
                        </GSButton>
                        <GSButton success marginLeft
                                  onClick={() => {
                                      RouteUtils.redirectWithoutReload(props, NAV_PATH.shopeePlans);
                                  }}>
                            <GSTrans t={"common.btn.buynow"}/>
                        </GSButton>
                    </ModalFooter>
                </Modal>

                <Modal isOpen={modalDelete} toggle={toggleModalDelete} className={`modalDeleteAccount`}>
                    <ModalHeader className={`text-danger`} toggle={toggleModalDelete}>
                        <Trans i18nKey="common.txt.confirm.modal.title"></Trans>
                    </ModalHeader>
                    <ModalBody>
                        <p><Trans i18nKey="page.shopee.account.DeleteAccount.title2"></Trans></p>
                        <div className={`boxCheckedDelete`}>
                            <UikCheckbox
                                checked={stCheckedDelete}
                                name={"DELOPT"}
                                onChange={e => onChangeDeleteOption(e)}
                                className="custom-check-box"
                            />
                            <span>{i18next.t("page.shopee.account.DeleteAccount.option")}</span>
                        </div>
                        <div className={"common-note mt-1 font-size-_9rem"}>
                            {i18next.t('common.txt.notice')}: {i18next.t('product.delete.notice.incomplete.transfer')}
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <GSButton default onClick={toggleModalDelete}>
                            <GSTrans t={"common.btn.cancel"}/>
                        </GSButton>
                        <GSButton danger marginLeft onClick={acceptDeleteShop}>
                            <GSTrans t={"page.shopee.account.DeleteAccount.delete"}/>
                        </GSButton>
                    </ModalFooter>
                </Modal>


                <UikWidget className="gs-widget pt-3 ">
                    {/* <PrivateComponent> */}
                    <GSContentHeaderRightEl className="d-flex justify-content-end align-items-center">
                        {stDeleting &&
                            <div className="deleting-status">
                                <FontAwesomeIcon className="image-status__grey image-rotate" icon="sync-alt"/>
                                <span class="synchronize-status-text">{i18next.t('page.shopee.account.action.delete.message')}</span>
                            </div>
                        }
                        <div className="add-account">
                            <Trans i18nKey="page.shopee.account.info"
                                   values={{numAccount: numberAccount, totalAccount: numberPackage}}>
                                <span></span>
                            </Trans>
                        </div>
                        <GSButton
                            success
                            className="ml-3 mr-3"
                            onClick={() => {
                                RouteUtils.redirectWithoutReload(props, NAV_PATH.shopeePlans);
                            }}
                        >
                            <GSTrans t={"upgrade.channel.btn.upgrade"}/>
                        </GSButton>
                    </GSContentHeaderRightEl>

                    <UikWidgetContent
                        className="gs-widget__content body">
                        <div className={"branch-list-desktop d-mobile-none d-desktop-flex"}>
                            <GSTable>
                                <thead>
                                <tr>
                                    <th>
                                        <GSTrans t={"page.shopee.account.column.title"}/>
                                    </th>
                                    <th>
                                        <GSTrans t={"page.shopee.branch.column.title"}/>
                                    </th>
                                    <th>
                                        <GSTrans t={"page.shopee.expiryDate.column.title"}/>
                                    </th>
                                    <th>
                                        <GSTrans t={"page.shopee.status.column.title"}/>
                                    </th>
                                    <th>
                                        <GSTrans t={"page.shopee.action.column.title"}/>
                                    </th>
                                </tr>
                                </thead>
                                <tbody>
                                {shopAccounts.map((shop, index) => {
                                    let date = _.isEmpty(expiredDate) || moment(expiredDate).format('YYYY-MM-DD') < moment(new Date()).format('YYYY-MM-DD');
                                    let connectStatus = shop.connectStatus === CONNECTION_STATUS.CONNECTED ? '' : date ? 'disconnected' : 'connected';
                                    return (
                                        <tr key={shop.id}>
                                            <td className={connectStatus}>{shop.shopName}</td>
                                            <td className={connectStatus}>{shop.branchName}</td>
                                            <td className={connectStatus}>
                                                {shop.shopType === 'FREE' ? 'N/A'
                                                    : date ? 'Expired'
                                                        : moment(expiredDate).format('YYYY-MM-DD')}
                                            </td>
                                            <td className={connectStatus}>{shop.connectStatus}</td>

                                            <td>
                                                {shop.shopActionStatus === ACTION_STATUS.DELETING && <div className="d-flex">
                                                    <GSActionButton disabled={true} icon={GSActionButtonIcons.BROKEN_UNLINK}/>
                                                    <GSActionButton disabled={true} icon={GSActionButtonIcons.DELETE}
                                                    />
                                                </div>}
                                                {shop.shopActionStatus !== ACTION_STATUS.DELETING && <div className="d-flex">

                                                    {shop.connectStatus === CONNECTION_STATUS.CONNECTED?
                                                    <GSActionButton icon={GSActionButtonIcons.BROKEN_LINK}
                                                                    onClick={() => {
                                                                        openDisconnectedModal(shop.id, shop.shopId, shop.branchId);
                                                                    }}/>
                                                    : <GSActionButton icon={GSActionButtonIcons.BROKEN_UNLINK}
                                                                        onClick={() => {
                                                                            reconnectShopee(shop.id, shop.shopId, shop.branchId, shop.shopName);
                                                                        }}/>
                                                    }

                                                    <GSActionButton
                                                        hidden={shop.connectStatus === CONNECTION_STATUS.CONNECTED? true : false}
                                                        icon={GSActionButtonIcons.DELETE}
                                                        onClick={() => toggleModalDelete(shop.id)}
                                                    />
                                                </div>}
                                            </td>
                                        </tr>);
                                })}
                                </tbody>
                            </GSTable>
                        </div>
                    </UikWidgetContent>
                    {/* </PrivateComponent> */}
                </UikWidget>
            </GSContentContainer>
            <ShopeeConnector ref={refShopeeConnector}/>
        </>
    )
}


export default ShopeeAccountManagement;




