import React from 'react'
import {animated, useSpring} from 'react-spring'
import {CurrencyUtils, NumberUtils} from '../../../utils/number-format'
import {bool, string} from 'prop-types'
import PropTypes from 'prop-types'
import Constants from '../../../config/Constant'

const AnimatedNumber = props => {
    const { children, currency, vnd, isNumber, hiddenCurrency, precision, thousand, ...others } = props
    const number = useSpring({
        from: {
            extraNumber: 0
        },
        to: {
            extraNumber: !isNaN(children) && _.isNumber(children) ? children : 0
        }
    })

    return (
        <>
            <animated.span { ...others }>
                { number.extraNumber.interpolate(x => {
                    let getReturnValue = x
                    if(currency && !hiddenCurrency){
                        getReturnValue = NumberUtils.formatThousandFixed(x, precision, true)
                        getReturnValue =  CurrencyUtils.formatMoneyByCurrencyWithPrecision(getReturnValue, currency, precision)
                    }else{
                        if(_.isNumber(precision) && precision !== 0){
                            getReturnValue = NumberUtils.formatThousandFixed(x, precision, true)
                        }else{
                            getReturnValue = NumberUtils.formatThousand(x.toFixed(0))
                        }
                    }
                    return getReturnValue
                }
                    
                ) }
            </animated.span>
        </>
    )
};

AnimatedNumber.defaultProps = {
    isNumber: true,
    precision: 0
};

AnimatedNumber.propTypes = {
    currency: string,
    isNumber: PropTypes.bool,
    precision: PropTypes.number
};

export default AnimatedNumber;
