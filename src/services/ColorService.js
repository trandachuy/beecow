import apiClient from '../config/api';
import Constants from "../config/Constant";

class ColorService {

    getColors(params) {
        return new Promise((resolve, reject) => {
            apiClient.get(`/${Constants.BEEHIVE_SERVICE}/api/system-settings/name/THEME_COLOR`, {
                params: params
            })
                .then(result => {
                    if (result.data.value.value) {
                        resolve(result.data.value.value);
                    }
                })
                .catch(e => {
                    reject(e);
                });
        });
    }
}

const colorService = new ColorService();
export default colorService;
