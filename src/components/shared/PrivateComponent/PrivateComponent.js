/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 05/02/2020
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import React from 'react'
import PropTypes from 'prop-types'
import {TokenUtils} from '@utils/token'
import {ROLES} from '@config/user-roles'

const PrivateComponent = props => {

    const isAllowAccess = props.hasAnyPackageFeature.length > 0 ? TokenUtils.hasAnyPackageFeatures(props.hasAnyPackageFeature) : TokenUtils.hasAllPackageFeatures(props.hasAllPackageFeature)
    // if has staff permission then check role else ignore checking staff
    const isStaff = props.hasStaffPermission ? TokenUtils.isHasRole(ROLES.ROLE_GOSELL_STAFF) : false
    const blockEvent = (e) => {
        e.preventDefault()
    }
    return (
        <>
            {
                props.public
                    ? props.children
                    : (TokenUtils.isHasStaffPermission(props.hasStaffPermission) && isStaff) || !isStaff || !props.checkStaff
                        ? !isAllowAccess && props.checkPackageFeature
                            ? props.disabledStyle === 'disabled' &&
                            <span className={ ['gs-atm--disable', props.className, props.wrapperClass].join(' ') } style={ {
                                pointerEvents: props.allowUserEvents ? 'unset' : 'none',
                                display: props.wrapperDisplay,
                                ...props.wrapperStyle
                            } }>
                            {
                                props.allowUserEvents
                                    ? props.children
                                    : React.Children.map(props.children, (child => {
                                            if (child) {
                                                return React.cloneElement(child, {
                                                    onClick: blockEvent,
                                                    onFocus: blockEvent,
                                                    onKeyDown: blockEvent,
                                                    onBlur: blockEvent,
                                                    onInput: blockEvent,
                                                    onKeyPress: blockEvent,
                                                    ...props.childrenProps
                                                })
                                            }
                                            return null
                                        }
                                    ))
                            }
                            </span>
                            : props.children
                        : null
            }
        </>
    )
}

PrivateComponent.defaultProps = {
    disabledStyle: 'disabled',
    hasAnyPackageFeature: [],
    hasAllPackageFeature: [],
    allowUserEvents: false,
    wrapperDisplay: 'inline-block',
    hasStaffPermission: '',
    checkPackageFeature: true,
    checkStaff: true,
    childrenProps: {},
    public: false,
    wrapperStyle: {},
    wrapperClass: ''
}

/**
 * public: enable all checkers
 * ------ SETTING FOR COMPONENT WHEN DISABLED -------
 * disabledStyle: component will be hidden or disabled
 * wrapperDisplay: set display style for wrapper component when disabled
 * allowUserEvents: false - allow event on this component when disabled (onClick, onBlur, ....)
 * childrenProps: rest of this props will be appended to disabled component
 * ----- PACKAGE FEATURE CHECKING ---------
 * checkPackageFeature: enable package feature checking (default true)
 * hasAnyPackageFeature: array of PACKAGE_FEATURE_CODES, if ANY feature code in that list is match, component will be public
 * hasAllPackageFeature: array of PACKAGE_FEATURE_CODES, if ALL feature codes in that list are match, component will be public
 * ----- STAFF PERMISSION CHECKING ---------
 * checkStaff: enable staff permission checking
 * hasStaffPermission: STAFF_PERMISSION
 */
PrivateComponent.propTypes = {
    disabledStyle: PropTypes.oneOf(['disabled', 'hidden']),
    wrapperDisplay: PropTypes.oneOf(['block', 'inline', 'inline-block', 'flex']),
    hasAnyPackageFeature: PropTypes.array,
    hasAllPackageFeature: PropTypes.array,
    checkPackageFeature: PropTypes.bool,
    allowUserEvents: PropTypes.bool,
    hasStaffPermission: PropTypes.string,
    checkStaff: PropTypes.bool,
    childrenProps: PropTypes.object,
    public: PropTypes.bool,
    wrapperStyle: PropTypes.any,
    wrapperClass: PropTypes.string
}

export default PrivateComponent
