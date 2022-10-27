import apiClient from "../config/api";
import {CredentialUtils} from '../utils/credential'

class UserThemeEngineService {

    async getUserThemeEngine() {
        try {
            const storeId = CredentialUtils.getStoreId()

            if (!storeId) {
                return Promise.reject()
            }

            const result = await apiClient.get(`/api/user-theme-engine/${storeId}`);
            const useNewThemeEngine = result.data.useNewEngine;
            return useNewThemeEngine;
        }
        catch (e) {
            console.error(e);
            return null;
        }
    }

    updateUserThemeEngine(storeId, useNewEngine) {
        return new Promise(() => {
            apiClient.put("/api/user-theme-engine", {
                "storeId": storeId,
                "useNewEngine": useNewEngine,
            })
            .catch(e => { console.error(e) });
        });
    }
}

const userThemeEngineService = new UserThemeEngineService();
export default userThemeEngineService;
