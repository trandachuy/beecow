import $ from 'jquery'

/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 28/02/2020
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
export const cn = (...classNames) => {
    let classNameList = ''
    for (const className of classNames) {
        if (!className) continue
        if (typeof className === 'string') {
            classNameList += ' ' + className
        }
        if (typeof className === 'object') {
            const tClasses = Object.keys(className)
            for (const tClass of tClasses) {
                if (tClass && className[tClass]) {
                    classNameList += ' ' + tClass
                }
            }
        }
    }
    return classNameList
}


export const attemptToFindElement = (element, callback) => {
    let retries = 0

    const launcherExist = () => {
        retries += 1

        if (retries >= 120) {
            return
        }

        let el = $(element)

        if (el.length) {
            callback(el)

            return
        }

        setTimeout(launcherExist, 500)
    }

    launcherExist()
}