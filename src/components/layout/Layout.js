import React, {Component} from 'react';
import {UikContainerHorizontal, UikContainerVertical} from '../../@uik';
import '../../components/layout/Layout.sass';
import Navigation from "../../components/layout/navigation/Navigation";
import Header from "./header/Header";
import {Trans} from "react-i18next";
import LoadingOverlay from 'react-loading-overlay'
import BounceLoader from 'react-spinners/BounceLoader'
import AlertModal, {AlertModalType} from "../shared/AlertModal/AlertModal";
import i18next from "../../config/i18n";
import NavigationLeft from "./navigation/navigationLeft/NavigationLeft";
import {connect} from "react-redux";
import PrivateComponent from "../shared/PrivateComponent/PrivateComponent";

function mapStateToProps(state) {
    return {
        collapsedMenu: state.collapsedMenu
    }
}

export default function wrapperLayout(ChildComponent, navigateName, OverlayBody = null) {


    return connect(mapStateToProps)(class extends Component {
        constructor(props) {
            super(props);

            this.setLoading = this.setLoading.bind(this);
            this.cancelLoading = this.cancelLoading.bind(this);
            this.showServerError = this.showServerError.bind(this);
            this.handleScroll = this.handleScroll.bind(this);
            this.cancelScrolling = this.cancelScrolling.bind(this);
            this.onClickLeftMenu = this.onClickLeftMenu.bind(this);
            this.onCloseLeftMenu = this.onCloseLeftMenu.bind(this);

            this.state = {
                nav: navigateName,
                isLoading: false,
                page: 0,
                isScrolling: false,
                isShowLeftMenu: false
            };
        }

        handleScroll(e) {

        }

        cancelScrolling(){
            this.setState({isScrolling: false});
        }

        setLoading(){
            this.setState({isLoading: true});
        }

        cancelLoading(){
            this.setState({isLoading: false});
        }

        showServerError(message){
            if (!this.alertModal.isOpen()) {
                this.alertModal.openModal({
                    type: AlertModalType.ALERT_TYPE_DANGER,
                    messages: i18next.t(message ? message : 'common.message.server.response')
                });
            }
        }

        onClickLeftMenu() {
            this.setState({
                isShowLeftMenu: true
            })
        }

        onCloseLeftMenu() {
            this.setState({
                isShowLeftMenu: false
            })
        }

        showServerWarning(message){
            if (!this.alertModal.isOpen()) {
                this.alertModal.openModal({
                    type: AlertModalType.ALERT_TYPE_WARNING,
                    messages: i18next.t(message ? message : 'common.message.server.response')
                });
            }
        }

        render() {
            return (
                <LoadingOverlay
                    active={this.state.isLoading}
                    spinner={<BounceLoader />}
                    text={<Trans i18nKey="common.message.loading"></Trans>}>
                    <UikContainerVertical className="layout-main">

                        <Header onClickLeftMenu={this.onClickLeftMenu}/>

                        <UikContainerHorizontal>

                            {/*DESKTOP*/}
                            <div className={['layout__navigation-panel d-mobile-none  d-tablet-none d-desktop-exclude-tablet-flex', this.props.collapsedMenu? "layout__navigation-panel--closed":"layout__navigation-panel--opened"].join(' ')}>
                                <Navigation active={this.state.nav}
                                />
                            </div>


                            {/*MOBILE*/}
                            {this.state.isShowLeftMenu &&
                                <NavigationLeft active={this.state.nav}
                                                className="d-mobile-block d-tablet-block d-desktop-exclude-tablet-none nav-left-mobile"
                                                onClose={this.onCloseLeftMenu}
                            />}


                            <UikContainerVertical className="layout-body"
                                                  Component={'div'}
                                                  id={'app-body'}
                                                  onScroll={this.handleScroll}
                                                    style={{
                                                        overflow: OverlayBody? 'hidden':'auto'
                                                    }}
                            >
                                <UikContainerHorizontal>
                                    {OverlayBody &&
                                        <div className="layout__overlay">
                                            {OverlayBody}
                                        </div>

                                    }
                                    <PrivateComponent public={!OverlayBody} wrapperDisplay={"flex"} wrapperStyle={{width: '100%'}}>
                                        <ChildComponent
                                            setLoading={this.setLoading}
                                            cancelLoading={this.cancelLoading}
                                            showServerError={this.showServerError}
                                            loadMore={this.state.page}
                                            cancelScrolling={this.cancelScrolling}
                                            {...this.props}
                                        />
                                    </PrivateComponent>

                                </UikContainerHorizontal>
                            </UikContainerVertical>
                        </UikContainerHorizontal>
                        {/* <Learning/> */}
                    </UikContainerVertical>
                    <AlertModal ref={(el) => { this.alertModal = el }} />
                </LoadingOverlay>
            );
        }
    })
}
