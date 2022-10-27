import './CashbookSummary.sass'
import React, {useContext, useEffect, useState} from 'react'
import i18next from 'i18next'
import GSWidget from '../../../../components/shared/form/GSWidget/GSWidget'
import GSWidgetContent from '../../../../components/shared/form/GSWidget/GSWidgetContent'
import GSTooltip from '../../../../components/shared/GSTooltip/GSTooltip'
import {CashbookContext} from '../../context/CashbookContext'
import AnimatedNumber from '../../../../components/shared/AnimatedNumber/AnimatedNumber'
import Constants from '../../../../config/Constant'

const CashbookSummary = props => {
    const { state, dispatch } = useContext(CashbookContext.context)

    const convertData = (revenueSummary) => {
        return [
            {
                value: revenueSummary.openingBalance,
                label: i18next.t('page.cashbook.summary.openingBalance'),
                hint: i18next.t('page.cashbook.summary.hint.openingBalance')
            },
            {
                value: revenueSummary.totalRevenue,
                label: i18next.t('page.cashbook.summary.totalRevenue'),
                hint: i18next.t('page.cashbook.summary.hint.totalRevenue')
            },
            {
                value: revenueSummary.totalExpenditure,
                label: i18next.t('page.cashbook.summary.totalExpenditure'),
                hint: i18next.t('page.cashbook.summary.hint.totalExpenditure')
            },
            {
                value: revenueSummary.endingBalance,
                label: i18next.t('page.cashbook.summary.endingBalance'),
                hint: i18next.t('page.cashbook.summary.hint.endingBalance')
            }
        ]
    }

    const [stRevenueSummaries, setStRevenueSummaries] = useState(convertData(state.revenueSummary))
    const [stDefaultPrecision, setStDefaultPrecision] = useState()

    useEffect(() => {
        setStRevenueSummaries(convertData(state.revenueSummary))
    }, [state.revenueSummary])

    useEffect(() => {
        if(state.currency !== Constants.CURRENCY.VND.SYMBOL){
            setStDefaultPrecision(2)
        }else{
            setStDefaultPrecision(0)
        }
    },[])

    return (
        <>
            {
                stRevenueSummaries.map((x, index) => {
                    return (
                        <div key={ index } className="cashbook-summary col-6 col-md-3 item">
                            <GSWidget>
                                <GSWidgetContent className="pr-0">
                                    <div className="title text-uppercase font-weight-bold pb-3 color-gray white-space-nowrap">
                                        { x.label }
                                        {
                                            !!x.hint &&
                                            <GSTooltip message={ x.hint } placement={ GSTooltip.PLACEMENT.BOTTOM }/>
                                        }
                                    </div>
                                    <div className="detail">
                                        <span className="number font-weight-bold font-size-18">
                                            <AnimatedNumber 
                                                currency={ state.currency }
                                                precision={ stDefaultPrecision }
                                            >
                                                { x.value }
                                            </AnimatedNumber>
                                        </span>
                                    </div>
                                </GSWidgetContent>
                            </GSWidget>
                        </div>
                    )
                })
            }
        </>
    )
}

CashbookSummary.defaultProps = {}

CashbookSummary.propTypes = {}

export default CashbookSummary