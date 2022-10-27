/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 17/05/2019
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
const IS_SHOW_ERROR_ON_CONSOLE = process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'qa'

export const cancelablePromise = (promise, timeOut = 30) => {
    let hasCanceled_ = false

    const wrappedPromise = new Promise((resolve, reject) => {
        promise.then(
            val => hasCanceled_ ? reject({isCanceled: true}) : resolve(val),
            error => hasCanceled_ ? reject({isCanceled: true}) : reject(error)
        );
    })
    //     .catch(e => {
    //     if (IS_SHOW_ERROR_ON_CONSOLE) {
    //         console.error(e)
    //     }
    //         promise.
    // });

    setTimeout( () => {
        hasCanceled_ = true
    }, timeOut * 1000)

    return {
        promise: wrappedPromise,
        cancel() {
            hasCanceled_ = true;
        },
    };
}

export const cPromise = (promise, timeOut = 30) => cancelablePromise(promise, timeOut)


export function delay(t) {
    return new Promise(function(resolve) {
        setTimeout(resolve, t);
    });
}
