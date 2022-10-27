import React, { useState } from 'react'
import PropTypes from 'prop-types'
import './GSSocialTagStatus.sass'
import GSContentContainer from '../../layout/contentContainer/GSContentContainer'
import GSContentBody from '../../layout/contentBody/GSContentBody'
import {UikWidget, UikWidgetContent} from '../../../@uik';
import { SocialTagElement, TAG_COLOR } from './GSSocialTag'
import i18n from '../../../config/i18n'
import { debounce } from 'lodash'


const dummy_data = [
  {id: 1, isShow: true, tagName: "test 1", tagColor: TAG_COLOR[1]},
  {id: 2, isShow: false, tagName: "test 2", tagColor: TAG_COLOR[2]},
  {id: 3, isShow: true, tagName: "test 3", tagColor: TAG_COLOR[3]},
  {id: 4, isShow: false, tagName: "test 4", tagColor: TAG_COLOR[2]},
  {id: 5, isShow: true, tagName: "test 5", tagColor: TAG_COLOR[2]},
  {id: 6, isShow: true, tagName: "test 6", tagColor: TAG_COLOR[4]},
  {id: 7, isShow: true, tagName: "test 7", tagColor: TAG_COLOR[5]},
  {id: 8, isShow: true, tagName: "test 8", tagColor: TAG_COLOR[6]},
  {id: 9, isShow: false, tagName: "test 9", tagColor: TAG_COLOR[2]},
  {id: 10, isShow: true, tagName: "test 10", tagColor: TAG_COLOR[2]},
  {id: 11, isShow: true, tagName: "test 11", tagColor: TAG_COLOR[11]},
  {id: 12, isShow: true, tagName: "test 12", tagColor: TAG_COLOR[9]},
];

const GSSocialTagStatus = props => {

  const {status} = props
  const [stTagStatus] = useState(status)
  const [stDefaultColor] = useState(TAG_COLOR[0])
  const [stShowTagStatus, setStShowTagStatus] = useState(false)

  const onToogleTagStatus = () => {
    debounce(setStShowTagStatus(!stShowTagStatus), [300]);
  }

  return (
    <>
      <GSContentContainer className="gs-social-tag-status-container-wrapper">
        <GSContentBody>
          <UikWidget>
            <UikWidgetContent>
              <section className="social-tag-status-container">
                {stTagStatus && stTagStatus.length > 0 && 
                  <div className="social-tag-lead text-truncate"
                    style={{
                      border: `1px solid ${stDefaultColor}`,
                      color: TAG_COLOR[0]
                    }}
                    onClick={onToogleTagStatus}>
                    <i className="bookmark" style={{
                      backgroundColor: props.tagColor
                    }}/>
                    {i18n.t("gosocial.tag.exist.number", {number: stTagStatus.length})}
                  </div>}
                  <div className={stShowTagStatus? 'tags-tag-status-area active':'tags-tag-status-area'}>
                    {stTagStatus && stTagStatus.map((tag, index) => {
                      return (<SocialTagElement key={index} {...tag} assigned={true}/>)
                    })}
                </div>
              </section>
            </UikWidgetContent>
          </UikWidget>
        </GSContentBody>
      </GSContentContainer>
    </>
  )
}

GSSocialTagStatus.defaultProps = {
  status: [],
}

GSSocialTagStatus.propTypes = {
  status: PropTypes.array,
}

export default GSSocialTagStatus

