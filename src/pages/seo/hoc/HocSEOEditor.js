import React, {useState, useImperativeHandle} from 'react'
import {ThemeEngineService} from '../../../services/ThemeEngineService'
import {oneOf, string} from 'prop-types'
import Constants from '../../../config/Constant'
import {ItemUtils} from '../../../utils/item-utils'

const HocSEOEditor = React.forwardRef((props, ref) => {
    const { langKey, type, data, children } = props

    const [stError, setStError] = useState()
    const [stSEOUrl, setStSEOUrl] = useState(children.props?.defaultValue?.seoUrl)

    useImperativeHandle(ref, () => ({
        isValid
    }))

    const isValid = () => {
        return validateSeoUrl({ seoUrl: stSEOUrl })
    }

    const validateSeoUrl = (seo, callback) => {
        setStError()

        return ThemeEngineService.validateSeoLink(ItemUtils.changeNameToLink(seo?.seoUrl || ''), { langKey, type, data })
            .then(() => Promise.resolve(true))
            .catch(e => {
                const errorKey = e?.response?.data?.errorKey
                const params = e?.response?.data?.params

                setStError({
                    errorKey,
                    params
                })

                return Promise.resolve(false)
            })
            .finally(() => callback && callback(seo))
    }

    return React.Children.map(children, child => {
        if (!React.isValidElement(child)) {
            return child;
        }

        return React.cloneElement(child, {
            onHocBlur: (seo) => {
                setStSEOUrl(seo?.seoUrl)
                validateSeoUrl(seo, child.props?.onBlur)
            },
            error: stError
        })
    })
})

HocSEOEditor.defaultProps = {}

HocSEOEditor.propTypes = {
    langKey: string,
    type: oneOf(Object.values(Constants.SEO_DATA_TYPE)),
    data: string
}

export default HocSEOEditor