/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 14/09/2021
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import React, {useEffect, useState} from 'react'
import PropTypes from "prop-types";
import FbPageConfiguration from "../../../pages/gosocial/configuration/FbPageConfiguration";
const COLORS = [
    {
        bg: '#0073ff',
        fg: '#0054bb'
    },
    {
        bg: '#4aff00',
        fg: '#2d9d00'
    },
    {
        bg: '#ffc400',
        fg: '#a48000'
    },
    {
        bg: '#00f4fa',
        fg: '#00a3a8'
    },
    {
        bg: '#ff6200',
        fg: '#a63f00'
    },
    {
        bg: '#00ff80',
        fg: '#00934a'
    },
    {
        bg: '#ffc300',
        fg: '#be9200'
    }
]

const CharacterAvatar = (props) => {

    const renderAvatarName = (name) => {
        if (name) {
            if (props.single) {
                return name[0]
            } else {
                const namePaths = name.split(' ')
                if (namePaths.length === 1) {
                    return namePaths[0].substring(0, 2).toUpperCase()
                } else {
                    const lastName = namePaths[0].substring(1, 0)
                    const firstName = namePaths[namePaths.length - 1].substring(1, 0)
                    return lastName + firstName
                }

            }
        }
    }

    const resolveColor = () => {
        if (props.text) {
            const cCode = props.text.charCodeAt(0)
            const color = COLORS[ cCode%COLORS.length ]
            return {
                backgroundColor: color.bg,
                color: color.fg
            }
        }
    }

    return (
        <div className="character-avatar d-flex justify-content-center align-items-center" style={{
            ...resolveColor(),
            width: props.size,
            height: props.size,
            fontSize: props.textSize,
            borderRadius: '50%',
            ...props.style
        }}>
            <strong>{renderAvatarName(props.text)}</strong>
        </div>
    )
}

CharacterAvatar.defaultProps = {
    size: '2rem',
    textSize: '1rem'
}

CharacterAvatar.propTypes = {
    text: PropTypes.string.isRequired,
    single: PropTypes.bool,
    size: PropTypes.string,
    textSize: PropTypes.string,
    className: PropTypes.string,
    style: PropTypes.object,
}

export default CharacterAvatar