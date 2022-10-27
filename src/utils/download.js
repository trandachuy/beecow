/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 06/01/2020
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
const saveDataToFile = (data, fileName) => {
    const url = window.URL.createObjectURL(new Blob([data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    setTimeout(function () {
        URL.revokeObjectURL(link.href);
        link.remove();
    }, 1500);
}

const openFileInNewTab = (data) => {
    const url = window.URL.createObjectURL(new Blob([data], {type: 'text/html'}));
    window.open(url, '_blank')
}

const openFile = (data, options, target = '_blank') => {
    const url = window.URL.createObjectURL(new Blob([data], options));
    window.open(url, target)
}

export const WindowUtils = {
    openFileInNewTab,
    openFile
}

export const DownloadUtils = {
    saveDataToFile: saveDataToFile,

}
