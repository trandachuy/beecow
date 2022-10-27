import React from 'react'
import i18next from 'i18next';
import TitleTranslate from '../TitleTranslate';
import SEOEditor from '../../../../pages/seo/SEOEditor';
import * as PropTypes from 'prop-types';
import {bool, oneOf, string} from 'prop-types';
import HocSEOEditor from '../../../../pages/seo/hoc/HocSEOEditor'
import {ItemUtils} from '../../../../utils/item-utils'
import Constants from '../../../../config/Constant'

const SEOTranslateElement = React.forwardRef((props, ref) => {
    const {
        seoTitle,
        seoDescription,
        seoKeywords,
        seoUrl,
        seoLinkType,
        seoLinkData,
        postfix,
        prefix,
        itemName,
        isShowUrl,
        assignDefaultValue,
        enableLetterOrNumberOrHyphen,
        langKey
    } = props
    return (
        <div>
            <TitleTranslate title={ i18next.t('component.translate.SEO.title') }/>
            <HocSEOEditor ref={ ref }
                          langKey={ langKey }
                          type={ seoLinkType }
                          data={ seoLinkData }>
                <SEOEditor
                    assignDefaultValue={ assignDefaultValue }
                    isShowUrl={ isShowUrl }
                    defaultValue={ {
                        seoTitle,
                        seoDescription,
                        seoKeywords,
                        seoUrl
                    } }
                    prefix={ (langKey + '/') + prefix }
                    middleSlug={ ItemUtils.changeNameToLink(itemName) }
                    postfix={ postfix }
                    enableLetterOrNumberOrHyphen={ enableLetterOrNumberOrHyphen }
                    withWidget={ false }
                    onBlur={ props.onBlur }
                />
            </HocSEOEditor>
        </div>
    )
})

SEOTranslateElement.defaultProps = {
    seoTitle: '',
    seoDescription: '',
    seoKeywords: '',
    seoUrl: '',
    postfix: '',
    prefix: '',
    itemName: '',
    langKey: '',
    enableLetterOrNumberOrHyphen: true,
    isShowUrl: true
}

SEOTranslateElement.propTypes = {
    seoTitle: string,
    seoDescription: string,
    seoKeywords: string,
    seoUrl: string,
    postfix: string,
    prefix: string,
    seoLinkType: oneOf(Object.values(Constants.SEO_DATA_TYPE)),
    seoLinkData: string,
    itemName: string,
    langKey: string,
    isShowUrl: bool,
    enableLetterOrNumberOrHyphen: bool,
    onBlur: PropTypes.func
}

export default SEOTranslateElement