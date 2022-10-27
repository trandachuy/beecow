import React, {Component} from 'react';
import GSContentContainer from "../../../components/layout/contentContainer/GSContentContainer";
import GSContentBody from "../../../components/layout/contentBody/GSContentBody";
import GSWidget from "../../../components/shared/form/GSWidget/GSWidget";
import GSWidgetContent from "../../../components/shared/form/GSWidget/GSWidgetContent";
import GSCallHistoryTable from "../../../components/shared/GSCallHistoryTable/GSCallHistoryTable";
import i18next from "i18next";
import './CallCenterHistoryList.sass';
import GSContentHeader from "../../../components/layout/contentHeader/GSContentHeader";
import CallButton from "../../../components/shared/CallCenterModal/CallButton/CallButton";
import {NAV_PATH} from "../../../components/layout/navigation/Navigation";
import {RouteUtils} from "../../../utils/route";
import {CredentialUtils} from "../../../utils/credential";
import {connect} from "react-redux";
import HintPopupVideo from "../../../components/shared/HintPopupVideo/HintPopupVideo";

class CallCenterHistoryList extends Component{
    constructor(props) {
        super(props);
        this.state = {
            callCenterEnabled : false
        }
        this.reloadDataTable = this.reloadDataTable.bind(this);
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.callHistoryReload !== this.props.callHistoryReload) {
            this.reloadDataTable()
        }
    }

    componentDidMount() {
        const isOmiCallActive = CredentialUtils.getOmiCallEnabled()
        const isOmiCallExpire = CredentialUtils.getOmiCallExpired()
        const isOmiCallRenewing = CredentialUtils.getOmiCallRenewing()

        if(!isOmiCallActive && !isOmiCallExpire && !isOmiCallRenewing) {
            RouteUtils.redirectWithoutReload(this.props, NAV_PATH.callCenter.PATH_CALL_CENTER_INTRO);
        }
        this.setState({
            callCenterEnabled: true
        })
    }

    reloadDataTable() {
        this.refTable.outReloadPageCallBack && this.refTable.outReloadPageCallBack();
    }

    render() {
        return (
            <GSContentContainer className="call-center-page gsa-min-width--fit-content">
                <GSContentHeader className="call-center-header"
                                 title={i18next.t("component.navigation.callCenter.history")}>
                    <HintPopupVideo category={'CALL_CENTER'} title={'Call history '}/>
                    <CallButton
                     onCallDisconnected={this.reloadDataTable}
                     onCallAssigned={this.reloadDataTable}
                />
                </GSContentHeader>
                <GSContentBody className="call-center__list-body" size={GSContentBody.size.MAX}>
                    <GSWidget>
                        <GSWidgetContent className={'call-center-widget'}>
                            {
                                this.state.callCenterEnabled &&
                                <GSCallHistoryTable
                                    ref={(ref) => this.refTable = ref}
                                    filterSearch={true}
                                    optionSearch={true}
                                />
                            }
                        </GSWidgetContent>
                    </GSWidget>
                </GSContentBody>
            </GSContentContainer>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        callHistoryReload: state.callHistoryReload
    }
};

export default connect(mapStateToProps)(CallCenterHistoryList);
