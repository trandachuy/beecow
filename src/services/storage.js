import Constants from '../config/Constant'

class Storage {

    getFromLocalStorage(key) {
        return localStorage.getItem(key);
    }

    setToLocalStorage(key, value) {
        localStorage.setItem(key, value);
    }

    removeLocalStorage(key) {
        localStorage.removeItem(key);
    }

    getFromSessionStorage(key) {
        return sessionStorage.getItem(key);
    }

    setToSessionStorage(key, value) {
        sessionStorage.setItem(key, value);
    }

    removeSessionStorage(key) {
        sessionStorage.removeItem(key);
    }

    get(key) {
        return this.getFromSessionStorage(key) || this.getFromLocalStorage(key);
    }

    removeAll() {
        const localExcludes = [
            Constants.PRINT_SIZE_DATA + '_' + Constants.PRINT_SIZE_DATA_LOCAL_STORAGE_KEY.ORDER_DETAIL,
            Constants.PRINT_SIZE_DATA + '_' + Constants.PRINT_SIZE_DATA_LOCAL_STORAGE_KEY.POS,
            Constants.PRINT_SIZE_DATA + '_' + Constants.PRINT_SIZE_DATA_LOCAL_STORAGE_KEY.ORDER_LIST,
            Constants.STORAGE_KEY_ORDER_COLUMN_SETTING,
            Constants.STORAGE_KEY_CUSTOMER_COLUMN_SETTING,
            Constants.STORAGE_KEY_LANG_KEY
        ]
        const localData = {}

        for (let localExclude of localExcludes) {
            localData[localExclude] = this.getFromLocalStorage(localExclude)
        }
        
        localStorage.clear();
        sessionStorage.clear();

        for (let key of Object.keys(localData)) {
            if (localData[key] && localData[key] !== 'null') {
                this.setToLocalStorage(key, localData[key])
            }
        }
    }
}

const storageService = new Storage();
export default storageService;