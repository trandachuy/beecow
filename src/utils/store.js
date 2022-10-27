/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 17/04/2019
 * Author: Tien Dao <tien.dao@mediastep.com>
 *******************************************************************************/
import storeService from "../services/StoreService";

const checkDuplicateURL = (url, orgURL) => {
    return new Promise((resolve, reject) => {
        let finalResult= {
            isValidLink : true
        };

        if(orgURL && url === orgURL){
            resolve(finalResult);
        }else{
            // storeService.checkUrlExistOrNot(url, false).then(result2 =>{
            //     finalResult.isValidLink = result2.isValidLink;
            //     resolve(finalResult);
            // }).catch(e => {
            //     // error
            //     console.log(e);
            //
            //     reject(e);
            // });
            storeService.checkUrlExistOrNot(url, false).then(
                (result) => {
                    // Mead url exist
                    resolve(result);
                },
                (e) => {
                    console.log(e);
                    reject(e);
                }
            );
        }
    });
}

export const StoreUtils = {
    checkDuplicateURL
}