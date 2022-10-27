/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 03/05/2019
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import emojiData from '../../src/pages/live-chat/conversation/chat-box/emoji/emoji.json'

const n2Br = (text) => {
    return text.split('\n').join('<br/>')
}

const getFullUrl = (baseURL, pathURL) => {
    if (pathURL.indexOf(baseURL) === 0) return pathURL;
    if (pathURL.indexOf('/') !== 0) pathURL = '/' + pathURL;
    return baseURL + pathURL;
}

const isNotEmptyString = (value) => {
    if(typeof value !== "string" || !value) {
        return false;
    }
    return true;
}

const isNotUndefinedString = (val) => {
    return typeof val === "string" && val !== "undefined";
}

const isEmptyString = (value) => {
    return !isNotEmptyString(value);
}

const toSlugs = (str) => {
    let from = "àáãảạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệđùúủũụưừứửữựòóỏõọôồốổỗộơờớởỡợìíỉĩịäëïîöüûñçýỳỹỵỷ",
        to   = "aaaaaaaaaaaaaaaaaeeeeeeeeeeeduuuuuuuuuuuoooooooooooooooooiiiiiaeiiouuncyyyyy";
    for (let i=0, l=from.length ; i < l ; i++) {
        str = str.replace(RegExp(from[i], "gi"), to[i]);
    }

    str = str.toLowerCase()
        .trim()
        .replace(/[^a-z0-9\-]/g, '-')
        .replace(/-+/g, '-');

    return str;
}

const htmlToPlainText = (html) => {
    const regex = /(<([^>]+)>)/ig
    return html.replace(regex, "");
}

const ellipsis = (text, maxLength) => {
    maxLength = maxLength + 3
    if (maxLength && text.length > maxLength) {
        return text.substr(0, maxLength - 3) + '...'
    }
    return text
}

const removeEmoji = (str) => {
    str = str.replace('|*️⃣', '')
    let emojiStr = ''
    emojiStr += emojiData.activityAndSports.data.replaceAll(/ /g, '|')
    emojiStr += emojiData.animalAndNature.data.replaceAll(/ /g, '|')
    emojiStr += emojiData.foodAndDrink.data.replaceAll(/ /g, '|')
    emojiStr += emojiData.objects.data.replaceAll(/ /g, '|')
    emojiStr += emojiData.symbols.data.replaceAll(/ /g, '|')
    emojiStr += emojiData.smileysAndPeople.data.replaceAll(/ /g, '|')
    emojiStr += emojiData.travelAndPlaces.data.replaceAll(/ /g, '|')
    emojiStr = '(😀|🐶|🚗|🍏|⌚️|🏻|🏼|🏽|🏾|🏿|' + emojiStr.replace('|*️⃣', '') + ')'
    const regex = new RegExp(emojiStr, 'g');
    return str.replaceAll(regex, '')
}

const hashCode = s => s.split('').reduce((a,b) => (((a << 5) - a) + b.charCodeAt(0))|0, 0)

const escapeRegExp = (str) => {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

export const StringUtils = {
    n2Br,
    getFullUrl,
    isNotEmptyString,
    isEmptyString,
    toSlugs,
    isNotUndefinedString,
    htmlToPlainText,
    ellipsis,
    removeEmoji,
    hashCode,
    escapeRegExp
}
