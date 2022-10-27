import i18n from "i18next";
import {initReactI18next} from "react-i18next";

import translationEN from '../../public/locales/en.json';
import translationVI from '../../public/locales/vi.json';
import storageService from '../services/storage';
import Constants from "./Constant";

// the translations
// (tip move them in a JSON file and import them)
const resources = {
    en: {
        translation: translationEN
    },
    vi: {
        translation: translationVI
    }
};

const lngFromStore = storageService.get(Constants.STORAGE_KEY_LANG_KEY)
const lng = lngFromStore === 'undefined' ? 'vi' : lngFromStore


i18n
    .use(initReactI18next) // passes i18n down to react-i18next
    .init({
        resources,
        lng: lng,
        fallbackLng: "vi", // use en if detected lng is not available

        keySeparator: false, // we do not use keys in form messages.welcome

        interpolation: {
            escapeValue: false // react already safes from xss
        },

        react: {
            transSupportBasicHtmlNodes: true,
            transKeepBasicHtmlNodesFor: ['br', 'span', 'strong', 'em']
        }
    });

export default i18n;
export const lang = lng;