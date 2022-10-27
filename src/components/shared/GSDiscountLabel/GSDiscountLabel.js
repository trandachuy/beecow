import './GSDiscountLabel.sass'
import React, {useEffect, useState} from 'react'
import GSImg from '../GSImg/GSImg'
import {oneOf} from 'prop-types'
import i18next from 'i18next'
import GSTooltip from '../GSTooltip/GSTooltip'
import GSComponentTooltip, {GSComponentTooltipPlacement} from '../GSComponentTooltip/GSComponentTooltip'
import AnimatedNumber from '../AnimatedNumber/AnimatedNumber'

const COLOR = {
    BLUE: 'BLUE',
    YELLOW: 'YELLOW'
}

const GSDiscountLabel = props => {
    const { color, children } = props

    const [stIcon, setStIcon] = useState(color)

    useEffect(() => {
        switch (color) {
            case COLOR.BLUE:
                setStIcon('/assets/images/affiliate/icon_commission_rate_active.png')
                break
            case COLOR.YELLOW:
                setStIcon('/assets/images/affiliate/icon_commission_rate_inactive.png')
                break
            default:
                setStIcon('/assets/images/affiliate/icon_commission_rate_active.png')
                break
        }
    }, [color])

    //default return BLUE color
    return (
        <div>
            <GSComponentTooltip className="w-fit-content"
                                message={ i18next.t('component.gsDiscountLabel.tooltip.discountEqualZero') }
                                theme={ GSTooltip.THEME.DARK }
                                placement={ GSComponentTooltipPlacement.BOTTOM }
                                disabled={ children || children > 0 }>
                <div className="gs-discount-label">
                    <GSImg className="icon" src={ stIcon }/>
                    <span className={ [
                        'label',
                        color.toLowerCase()
                    ].join(' ') }>{
                        <AnimatedNumber
                            precision={props.precision}
                        >
                            { children }
                        </AnimatedNumber>
                    }%</span>
                </div>
            </GSComponentTooltip>
        </div>
    )
}


GSDiscountLabel.propDefaults = {
    color: COLOR.BLUE
}

GSDiscountLabel.propTypes = {
    color: oneOf(Object.values(COLOR))
}

GSDiscountLabel.COLOR = COLOR

export default GSDiscountLabel