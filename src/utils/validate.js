const phoneValidate = (i18next, value, ctx, input, cb) => {
    if (!value) cb(true)
    const phoneList = value.split(/\n/)
    for (const [index, phone] of phoneList.entries()) {
        if (phone === '') {
            cb(i18next.t("page.customers.edit.invalidPhoneNumber.blankRow", {
                rowNumber: index + 1
            }))
            return
        }
        if (phone.length < 8) {
            cb(i18next.t("page.customers.edit.invalidPhoneNumber.lessThan", {
                phone: phone,
                min: 8,
                row: index + 1
            }))
            return
        }
        if (phone.length > 15) {
            cb(i18next.t("page.customers.edit.invalidPhoneNumber.greaterThan", {
                phone: phone,
                max: 15,
                row: index + 1
            }))
            return
        }
        if (phoneList.filter(p => p === phone).length > 1) { // => duplicated
            cb(i18next.t("page.customers.edit.invalidPhoneNumber.duplicated", {
                phone: phone,
                row: index + 1
            }))
            return
        }
    }
    cb(true)
};

const phoneOrEmail = (i18next, value, ctx, input, cb) => {
    if (!ctx.phone && !ctx.email) {
        cb(i18next.t("page.livechat.customer.details.add.new.customer.validateEmailPhone"));
        return;
    }
    cb(true);
};

const userNameValidate = (i18next, value, ctx, input, cb) => {
    if (!isNaN(value)) {
        if (!isPhone(value)) {
            cb(i18next.t("common.validation.invalid.phone"));
            return;
        }
    } else if (!isEmail(value)) {
        cb(i18next.t("common.validation.invalid.email"));
        return;
    }
    return cb(true);
};

const isPhone = (credential) => {
    return new RegExp('^[0-9]{10,13}$').test(credential);
};

const isEmail = (credential) => {
    return new RegExp(/^([\w-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([\w-]+\.)+))([a-zA-Z]{2,10}|[0-9]{1,3})(\]?)$/).test(credential);
};

const defaultValue = (key, defaultV, props) => {
    if (!props.item) return defaultV
    return props.item[key]? props.item[key]:defaultV
}

export const ValidateUtils = {
    phoneValidate,
    phoneOrEmail,
    userNameValidate,
    isPhone,
    isEmail,
    defaultValue
};
