/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 12/03/2020
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
const createTabListItem = (tab_id, tab_name_code) => {
    return {
        tab_id,
        tab_name_code
    }
}

const createStepsListItem = (tab_id, step_id, position, congratulation_code) => {
    return {
        tab_id,
        step_id,
        position,
        congratulation_code
    }
}

const createStepsContentItem = (step_id, lst_content) => {
    return {
        step_id,
        lst_content
    }
}

export const LearningUtils = {
    createStepsContentItem,
    createStepsListItem,
    createTabListItem
}
