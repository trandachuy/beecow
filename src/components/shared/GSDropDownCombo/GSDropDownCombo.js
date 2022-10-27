import './GSDropDownCombo.sass'
import React from 'react'
import PropTypes, {any, bool, func, string} from "prop-types";
import GSButton from "../GSButton/GSButton";
import GSDropDownButton from "../GSButton/DropDown/GSDropdownButton";

const GSDropDownCombo = props => {
    const {icon, title, className, theme, disabled, children} = props

    const handleClick = () => {
        if (disabled) {
            return
        }

        props.onClick()
    }

    return (
        <div className={['gs-dropdown-combo', disabled ? 'disabled' : ''].join(' ')}>
            <GSDropDownButton className={className} button={
                ({onClick}) => (
                    <div className='d-flex align-items-center'>
                        <GSButton className='action' theme={theme} onClick={handleClick}>
                            <span className='white-space-pre'>{title}</span>
                        </GSButton>
                        <GSButton className='icon' theme={theme} onClick={onClick}>
                            {icon}
                        </GSButton>
                    </div>
                )
            } className='ml-auto'>
                {children}
            </GSDropDownButton>
        </div>
    )
}

GSDropDownCombo.defaultProps = {
    theme: GSButton.THEME.DEFAULT,
    disabled: false,
    onClick: () => {
    }
}

GSDropDownCombo.propTypes = {
    icon: any,
    title: string,
    className: string,
    theme: PropTypes.oneOf(Object.values(GSButton.THEME)),
    disabled: bool,
    onClick: func,
}

export default GSDropDownCombo