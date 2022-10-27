import i18next from "i18next";


// validation rule ex : {isRequired : true, isMaxLength : 100, isMinLength : 3}
const themeValidation = (rule, data) => {
    if(rule.isRequired && rule.isRequired === true){
        // validate required
        if(!data){
            return {isError: true, message: i18next.t('common.validation.required')}
        }
    }

    if(rule.isMaxLength){
        // validate maxlength
        if(data && data.length > rule.isMaxLength){
            return {isError: true, message: i18next.t("common.validation.char.max.length", {x: rule.isMaxLength})}
        }
    }

    if(rule.isMinLength){
        // validate maxlength
        if(data && data.length < rule.isMinLength){
            return {isError: true, message: i18next.t("common.validation.char.min.length", {x: rule.isMinLength})}
        }
    }

    return null
}

// validation rule ex : {isRequired : true}
const themeValidationId = (rule, data) => {
    if(rule.isRequired && rule.isRequired === true){
        // validate required
        if(!data || data === 0){
            return {isError: true, message: i18next.t('common.validation.required')}
        }
    }
    return null
}

export const ThemeValidationUtils = {
    themeValidation,
    themeValidationId
}
