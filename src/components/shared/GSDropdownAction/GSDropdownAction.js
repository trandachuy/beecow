import './GSDropdownAction.sass'
import React from 'react'
import GSFakeLink from '../GSFakeLink/GSFakeLink';
import GSTrans from '../GSTrans/GSTrans';
import {arrayOf, bool, func, shape, string} from 'prop-types';

const GSDropdownAction = props => {
    const { toggle, actions, className, onToggle } = props

    const handleAction = (disabled, action) => {
        if (disabled) {
            return
        }

        action()
    }

    return (
        <div className={ ['gs-dropdown-action position-relative', className].join(' ') } tabIndex="0"
             onBlur={ () => onToggle(false) }>
            <GSFakeLink onClick={ () => onToggle(true) }>
                <GSTrans t="component.gsDropdownAction.action"/>
                <i className={ ['fa fa-caret-down ml-2 icon', toggle ? 'expand' : ''].join(' ') }
                   aria-hidden="true"></i>
            </GSFakeLink>
            {
                <div className={ ['actions', toggle ? 'expand' : ''].join(' ') }>
                    {
                        actions.map(({ label, disabled, hidden, onAction }, index) => {
                            return !hidden && <div
                                key={ index }
                                onClick={ () => handleAction(disabled, onAction) }
                                className={ disabled ? 'disabled' : '' }
                            >
                                { label }
                            </div>
                        })
                    }
                </div>
            }
        </div>
    )
}

GSDropdownAction.defaultProps = {
    toggle: false,
    actions: [],
    onToggle: () => {
    }
}

GSDropdownAction.propTypes = {
    toggle: bool,
    actions: arrayOf(shape({
        label: string,
        hidden: bool,
        disabled: bool,
        onAction: func
    })),
    className: string,
    onToggle: func
}

export default GSDropdownAction