import './GSLetterImage.sass'

import React from 'react'
import PropTypes, {any, number, string} from "prop-types";
import GSImg from "../GSImg/GSImg";

const GSLetterImg = props => {
    const {fullName, src, width, height, className} = props

    const renderAvatarName = (name) => {
        const namePaths = name.split(' ')
        if (namePaths.length === 1) {
            return namePaths[0].substring(0, 2).toUpperCase()
        } else {
            const lastName = namePaths[0].substring(1, 0).toUpperCase()
            const firstName = namePaths[namePaths.length - 1].substring(1, 0).toUpperCase()
            return lastName + firstName
        }
    }

    return (
        src
            ? <GSImg {...props}/>
            : <div className='gs-letter-image'
                style={{width, height}}
            >
                <div className={[className, 'gs-letter-image__text-avatar'].join(' ')}>
                    {renderAvatarName(fullName)}
                </div>
            </div>
    )
}

GSLetterImg.defaultProps = {
    fullName: '',
    src: '',
    alt: '',
    width: 50,
    height: 50,
    className: ''
}

GSLetterImg.propTypes = {
    fullName: string,
    src: any,
    alt: string,
    width: number,
    height: number,
    className: string,
}

export default GSLetterImg