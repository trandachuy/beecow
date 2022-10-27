import './TranslateHint.sass'

import React from 'react';
import GSImg from "../../../../components/shared/GSImg/GSImg";
import GSTrans from "../../../../components/shared/GSTrans/GSTrans";

const TranslateHint = (props) => {
    return (
        <div className='translate-hint'>
            <GSImg className='mb-3' src='/assets/images/translate_hint_icon.svg' width={55}/>
            <span className='translate-hint__title mb-3'>
                <GSTrans t='component.translateHint.title'/>
            </span>
            <span className='translate-hint__content'>
                <GSTrans t='component.translateHint.content'>
                    1. Select target language from dropdown menu on top left of theme editor.<br/><br/>2. Click to select a element on the right side<br/><br/>3. Translate dialog will show on the left side<br/><br/>4. Input translation for element<br/><br/>5. Save to save translated text.<br/><br/>6. Click Cancel to back to Theme editor
                </GSTrans>
            </span>
        </div>
    )
}

export default TranslateHint
