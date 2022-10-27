/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 20/09/2021
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import {atom} from "recoil";


const oaDetailState = atom({
    key: 'oaDetailState',
    default: {}
})


export const ZaloChatConversationRecoil = {
    oaDetailState
}