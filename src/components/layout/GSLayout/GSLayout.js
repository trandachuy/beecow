/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 14/05/2019
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import React from 'react'
import PropTypes from 'prop-types'

export const GSLayoutRow = (props) => {
    const {className, marginTop, marginBottom,  ...other} = props

    return (
        <div className={['row', className].join(' ')} {...other} style={
            {
                marginTop: props.marginTop? '1em':'unset',
                marginBottom: props.marginBottom? '1em':'unset'
            }
        }>
            {props.children}
        </div>
    )
}

GSLayoutRow.propTypes = {
  className: PropTypes.string,
    marginTop: PropTypes.bool,
    marginBottom: PropTypes.bool
}

export const GSLayoutCol1 = (props) => {
    return (
        <div className={`col-1 ${props.className}`}>
            {props.children}
        </div>
    )
}

GSLayoutCol1.propTypes = {
  className: PropTypes.string
}

export const GSLayoutCol2 = (props) => {
    return (
        <div className={`col-2 ${props.className}`}>
            {props.children}
        </div>
    )
}

GSLayoutCol2.propTypes = {
  className: PropTypes.string
}

export const GSLayoutCol3 = (props) => {
    return (
        <div className={`col-3 ${props.className}`}>
            {props.children}
        </div>
    )
}

GSLayoutCol3.propTypes = {
  className: PropTypes.string
}

export const GSLayoutCol4 = (props) => {
    return (
        <div className={`col-4 ${props.className}`}>
            {props.children}
        </div>
    )
}

GSLayoutCol4.propTypes = {
  className: PropTypes.string
}

export const GSLayoutCol5 = (props) => {
    return (
        <div className={`col-5 ${props.className}`}>
            {props.children}
        </div>
    )
}

GSLayoutCol5.propTypes = {
  className: PropTypes.string
}

export const GSLayoutCol6 = (props) => {
    return (
        <div className={`col-6 ${props.className}`}>
            {props.children}
        </div>
    )
}

GSLayoutCol6.propTypes = {
  className: PropTypes.string
}

export const GSLayoutCol7 = (props) => {
    return (
        <div className={`col-7 ${props.className}`}>
            {props.children}
        </div>
    )
}

GSLayoutCol7.propTypes = {
  className: PropTypes.string
}

export const GSLayoutCol8 = (props) => {
    return (
        <div className={`col-8 ${props.className}`}>
            {props.children}
        </div>
    )
}

GSLayoutCol8.propTypes = {
  className: PropTypes.string
}

export const GSLayoutCol9 = (props) => {
    return (
        <div className={`col-9 ${props.className}`}>
            {props.children}
        </div>
    )
}

GSLayoutCol9.propTypes = {
  className: PropTypes.string
}

export const GSLayoutCol10 = (props) => {
    return (
        <div className={`col-10 ${props.className}`}>
            {props.children}
        </div>
    )
}

GSLayoutCol10.propTypes = {
  className: PropTypes.string
}

export const GSLayoutCol11 = (props) => {
    return (
        <div className={`col-11 ${props.className}`}>
            {props.children}
        </div>
    )
}

GSLayoutCol11.propTypes = {
  className: PropTypes.string
}

export const GSLayoutCol12 = (props) => {
    return (
        <div className={`col-12 ${props.className}`}>
            {props.children}
        </div>
    )
}

GSLayoutCol12.propTypes = {
  className: PropTypes.string
}
