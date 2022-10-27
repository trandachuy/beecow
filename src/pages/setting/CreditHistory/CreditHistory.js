import React, {Component} from 'react';
import i18next from "i18next";
import './CreditHistory.sass'
import {Trans} from "react-i18next";
import {UikWidget, UikWidgetContent, UikWidgetHeader} from "../../../@uik";
import GSContentContainer from "../../../components/layout/contentContainer/GSContentContainer";
import FacebookService from "../../../services/FacebookService";
import moment from 'moment';
import {CurrencyUtils} from "../../../utils/number-format";

class CreditHistory extends Component {

    constructor(props) {
        super(props);

        this.state = {
            isProcessing : false,
            isShowOrOffHistory : false,
            lstHistory: [],
            currentBalance: '0'
        };

        this.showOrOffHistory = this.showOrOffHistory.bind(this)
    }

    componentDidMount() {
        this.setState({
            isProcessing : true
        })

        let recentHistory = FacebookService.getRecentCreditHistory()
        let currentBalance = FacebookService.getCurrentBalance()

        Promise.all([recentHistory, currentBalance]).then(lstResponse => {
            
            // recent history
            const histories = lstResponse[0]
            if(histories && histories.length > 0){
                this.setState({
                    lstHistory : histories
                })
            }

            // current balance
            const currentBalance = lstResponse[1]
            this.setState({
                currentBalance : currentBalance
            })


        }).catch(err =>{

        })
    }


    showOrOffHistory(){
        this.setState(pre => ({
            isShowOrOffHistory : !pre.isShowOrOffHistory
        }))
    }

    render() {
        return (
            <GSContentContainer className="credit-history__information"  isLoading={this.state.isFetching} isSaving={this.state.isSaving}>
                {/* Current balance */}
                <UikWidget className="gs-widget">
                    <UikWidgetContent className="gs-widget__content">
                        <div className="current-balance">
                            <div className="current-balance__left">
                                <div>
                                    <Trans i18nKey="page.setting.credit_history.current_balance">
                                        Current Balance
                                    </Trans>
                                </div>
                                <div className="ballance-money">
                                    <i></i>
                                    <span className="ballance-money__format">{CurrencyUtils.formatThousand(this.state.currentBalance)}đ</span>
                                </div>
                            </div>
                            <div className="current-balance__right" hidden={!(this.state.lstHistory && this.state.lstHistory.length > 0)}>
                                <i 
                                    className={this.state.isShowOrOffHistory ?  "icon-expand" : "icon-collapse"}
                                    onClick={this.showOrOffHistory}
                                ></i>
                            </div>
                        </div>
                    </UikWidgetContent>
                </UikWidget>

                {/* History */}
                <UikWidget className="gs-widget" hidden={!this.state.isShowOrOffHistory}>
                    <UikWidgetHeader className="gs-widget__header">
                        <Trans i18nKey="page.setting.credit_history.recent_history">
                            Recent History
                        </Trans>
                    </UikWidgetHeader>

                    <UikWidgetContent hidden={!(this.state.lstHistory && this.state.lstHistory.length > 0)} className="gs-widget__content">
                        {
                            this.state.lstHistory.map((his , index) =>{
                                return (
                                    <div className="row-of__history" key={index}>
                                        <div className="left-col">
                                            <span className="history-number">#{index + 1}</span>
                                            <span className="history-time">{moment(his.time).format('YYYY/MM/DD HH:mm A')}</span>
                                        </div>
                                        <div className="right-col">
                                            <span className="history-type">
                                                {
                                                    his.type === 'TOP_UP'
                                                    ? i18next.t('page.setting.credit_history.top_up')
                                                    : his.type === 'RETARGETING'
                                                    ? i18next.t('page.setting.credit_history.automatic_ads')
                                                    : ""
                                                }
                                            </span>
                                            <span>
                                                    {
                                                        his.status === 'IN_COME'
                                                        ?
                                                            <span className="history-amount green">
                                                                +{CurrencyUtils.formatThousand(his.amount)}đ
                                                            </span>
                                                        : his.status === 'OUT_COME'
                                                        ?
                                                            <span className="history-amount red">
                                                                -{CurrencyUtils.formatThousand(his.amount)}đ
                                                            </span>
                                                        :   his.status === 'PENDING'
                                                        ?
                                                            <span className="history-amount">
                                                                <span className="pending">({i18next.t('page.setting.credit_history.pending')}) </span>{CurrencyUtils.formatThousand(his.amount)}đ
                                                            </span>
                                                        :
                                                            <>
                                                            </>
                                                    }
                                                
                                            </span>
                                        </div>
                                    </div>
                                );
                            })

                            
                        }
                        {/* <div className="view-all__history">
                            <a href="#"></a>
                            View all history <span></span>&rarr;
                        </div> */}
                        
                    </UikWidgetContent>
                </UikWidget>
            </GSContentContainer>
        )
    }
}

export default CreditHistory;
