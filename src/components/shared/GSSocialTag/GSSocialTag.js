import React, { createRef, useEffect, useLayoutEffect, useState } from 'react'
import PropTypes from 'prop-types'
import './GSSocialTag.sass'
import $ from 'jquery';
import {Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import {UikWidget, UikWidgetContent} from '../../../@uik';
import GSTrans from '../GSTrans/GSTrans';
import {AvForm, AvInput} from "availity-reactstrap-validation";
import { FormValidate } from '../../../config/form-validate';
import GSButton from '../GSButton/GSButton';
import i18n from '../../../config/i18n';
import GSContentContainer from '../../layout/contentContainer/GSContentContainer';
import GSContentBody from '../../layout/contentBody/GSContentBody';
import { debounce } from 'lodash';
import { GSToast } from '../../../utils/gs-toast';

export const TAG_COLOR = [
  "#4051B6",
  "#D93635",
  "#E98BFC",
  "#F3833B",
  "#FECF2F",
  "#23A762",
  "#556CE7",
  "#1EBABF",
  "#136DFB",
  "#7566D5",
  "#848484",
  "#76BDFA",
];

const current_assigned_list = [2, 12, 9, 4, 7];

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

const GSSocialTag = props => {

  const {modal, service, tags, assignedTags, hasOpenOrder, uiKey, ...other} = props
  const {save, remove, assign, revoke} = {...GSSocialTag.defaultProps.service, ...service}
  const { showClose, header, modelClassName } = {...GSSocialTag.defaultProps.modal, ...modal}
  const [stShowDialog, setStShowDialog] = useState(false)
  const [stTagName, setStTagName] = useState("")
  const [stTagColor, setStTagColor] = useState(TAG_COLOR[0])
  const [stOriginTags, setStOriginTags] = useState([]) //not modified list
  const [stLineTags, setStLineTags] = useState([])
  const [stBoxTags, setStBoxTags] = useState([])
  const [stModelTags, setStModelTags] = useState([])
  const [stAssigned, setStAssigned] = useState([])
  const [stShowBoxTag, setStShowBoxTag] = useState(false)

  useEffect(() => {
      loadTags();
  }, [tags, assignedTags])

  useEffect(() => {
    loadInlineTags()
  }, [hasOpenOrder])

  useEffect(() => {
    loadModalTags(stOriginTags)
    loadInlineTags()
  }, [stOriginTags])

  useEffect(() => {
    //close box tag
    setStShowBoxTag(false);
  }, [assignedTags])

  const loadTags = () => {
    setStOriginTags(tags);
    setStAssigned(assignedTags)
  }

  const loadInlineTags = async () => {
    // const containerWidth = $("div.social-tag-box").width()
    // let numberEle = Math.floor(containerWidth / 130) - 2;
    // numberEle = numberEle > 5? 5: numberEle;
    let numberEle = 5;
    if(hasOpenOrder) {
      numberEle = 0;
    }
    let tags = stOriginTags.slice(0);
    tags = tags.filter(t => t.isShow === true);
    let lineTags = [];
    if(!hasOpenOrder) {
      lineTags = tags.splice(0, numberEle);
    }
    setStLineTags(lineTags);
    setStBoxTags(tags);
  }

  const loadModalTags = async (stTags) => {
    let tags = stTags.slice(0);
    tags = tags.reverse();
    setStModelTags(tags);
  }

  const closeTagManagement = async () => {
    setStTagName('');
    setStShowDialog(false);
    props.callBackApi()
  }

  const openTagManagement = async () => {
    setStShowDialog(true);
  }

  const toogleBoxTag = async () => {
    debounce(setStShowBoxTag(!stShowBoxTag), [300]);
  }

  const onChangeTagName = ({target}) => {
    console.assert("change tag name");
    let {value} = target || {value: ""};
    value = value.replaceAll(/\s+/g,"");
    setStTagName(value);
  }

  const onBlurTagName = ({target}) => {
    console.assert("change tag name");
    let {value} = target || {value: ""};
    value = value.replaceAll(/\s+/g,"");
    return value;
  }

  const onChangeTagColor = (color) => {
    console.assert("change tag color %s", color);
    setStTagColor(color);
  }

  const handleValidSubmit = (event, value)  => {
    console.assert("handle valid submit %o", value);
    event.preventDefault();
  }

  const handleAddTag = (tag) => {
    console.assert("handle add tag");
    const tagName = stTagName;
    const tagColor = stTagColor;
    const isShow = true;
    const req = {tagName, tagColor, isShow};
    console.assert("save tag %o", req);
    const result = save(req);
    result.then((data) => {
        console.assert("save return %o", data);
        let tags = stModelTags.slice(0);
        tags.splice( 0, 0, data);
        setStModelTags(tags);
        const originTags = tags.reverse();
        setStOriginTags(originTags);
    })
    .catch((xhr) => {
      const message = xhr.response.data? xhr.response.data.message:"";
      if(message.search(/^error.social\./gi) > -1) {
        /* "social.facebook.tag.limit.exceed"
        "social.zalo.tag.limit.exceed" */
        GSToast.error(message, true);
      } else {
        GSToast.commonError();
      }
    })
  }

  const handleDeleteTag = (tag, index) => {
    console.assert("handle delete tag at %i tag %o", index, tag);
    const tagId = tag.id;
    const result = remove(tagId);
    result.then((data) => {
      let tags = stModelTags.slice(0);
      tags.splice(index,1);
      setStModelTags(tags);
      const originTags = tags.reverse();
      setStOriginTags(originTags);
    })
    .catch((xhr) => {
      GSToast.commonError()
    })
  }

  const handleShowTag = (tag, index) => {
    console.assert("handle show tag at %i tag %o", index, tag);
    const {tagName, tagColor, id} = tag;
    const isShow = !tag.isShow;
    const result = save({isShow, tagName, tagColor, id});
    result.then((data) => {
      console.assert("save return %o", data);
      let tags = stModelTags.slice(0);
      tags.splice(index, 1, data);
      setStModelTags(tags);
      const originTags = tags.reverse();
      setStOriginTags(originTags);
    })
    .catch((xhr) => {
      GSToast.commonError()
    })
  }

  const onTagAction = (tag) => {
    console.assert("handle press tag name %o", tag);
    const position = stAssigned.indexOf(tag.id);
    let result = null;
    if(position > -1) {
      result =  revoke(tag.id);
    } else {
      result = assign(tag.id);
    }
    result.then((data) => {
      console.assert("return %o", data);
      let assigned = stAssigned.slice(0);
      if(position > -1) {
        assigned.splice(position, 1)
      } else {
        assigned.push(tag.id)
      }
      setStAssigned(assigned);
    })
    .catch((xhr) => {
      GSToast.commonError()
    })
  }

  const hashCode = (value) => {
    value = value || "";
    value = value.replaceAll(/\s+/g,"");
    value = value.toLowerCase();
    return value.split('').map(v=>v.charCodeAt(0)).reduce((a,v)=>a+((a<<7)+(a<<3))^v).toString(16);
  }

  return (
  <>
    <GSContentContainer className="gs-social-tag-container-wrapper">
      <GSContentBody size={GSContentBody.size.MAX}>
        <UikWidget>
          <UikWidgetContent>
            <section className="social-tag-container">
              <div className="social-tag-box">
                <div className={`tags-area ${stShowBoxTag? 'active':''}`}>
                  {stBoxTags && stBoxTags.map((tag, index) => {
                    const hasAssigned = (stAssigned.indexOf(tag.id) > -1)? true: false;
                    return (<SocialTagElement key={'tag1' + index} {...tag} assigned={hasAssigned} className="full-margin" onPressTag={onTagAction}/>)
                  })}
                </div>
                <div className="tags-line">
                  {stLineTags && stLineTags.map((tag, index) => {
                    const hasAssigned = (stAssigned.indexOf(tag.id) > -1)? true: false;
                    return (<SocialTagElement key={'tag2' + index} {...tag} assigned={hasAssigned} onPressTag={onTagAction}/>)
                  })}
                  {stBoxTags && stBoxTags.length > 0 && 
                    <div className="social-tag-lead text-truncate"
                      style={{
                        border: `1px solid ${TAG_COLOR[0]}`,
                        color: TAG_COLOR[0]
                      }}
                      onClick={toogleBoxTag}>
                      <i className="bookmark" style={{
                        backgroundColor: props.tagColor
                      }}/>
                      {i18n.t("gosocial.tag.exist.number", {number: stBoxTags.length})}
                    </div>}
                </div>
              </div>
              <div className="social-tag-modal">
                <div className="social-tag-lead add-tags text-truncate"
                      style={{
                        border: `2px solid ${TAG_COLOR[0]}`,
                        backgroundColor: TAG_COLOR[0]
                      }}
                      onClick={(e) => {
                        e.preventDefault();
                        openTagManagement()
                      }}>
                      {i18n.t("gosocial.tag.add")}
                  </div>
              </div>
            </section>
          </UikWidgetContent>
          <UikWidgetContent>
            <section>
              <Modal backdrop={true} toggle={closeTagManagement}
                className={["gs-modal-social-tag", modelClassName].join(" ")} 
                isOpen={stShowDialog} centered={true} 
                wrapClassName="vh-100 vw-100 d-block d-sm-block d-md-block w-auto">
                  {header && <ModalHeader>
                      {header}
                      {showClose && <div className={'modal-close-button'} onClick={closeTagManagement}>X</div>}
                  </ModalHeader>}
                  <ModalBody>
                    <section>
                      <header className="white-color">
                        <div class="col tagName">{i18n.t("gosocial.model.tag.management.column.name")}</div>
                        <div class="col tagColor">{i18n.t("gosocial.model.tag.management.column.color")}</div>
                        <div class="col action"></div>
                      </header>
                      <header>                  
                          <div class="col tagName">
                            <AvForm onValidSubmit={handleValidSubmit} autoComplete="off">
                              <AvInput 
                                type="text" 
                                name={"tagName"}
                                placeHolder={i18n.t("gosocial.model.tag.management.input.hint")}
                                validate={{
                                  ...FormValidate.required(),
                                  ...FormValidate.maxLength(30, false)
                                }}
                                value={stTagName}
                                onBlur={onBlurTagName}
                                onChange={onChangeTagName}
                              />
                            </AvForm>
                          </div>
                          <div class="col tagColorHeader action-wrapper-popover-color">
                            <div class="circle-color action-pointer action-color" style={{
                                backgroundColor: stTagColor
                              }}
                            ></div>
                            <div className="action-popover-color-content white-color">
                                {TAG_COLOR.map((color) => {
                                  const colorCode = hashCode(color);
                                  const currentColorCode = hashCode(stTagColor);
                                  const classActive = (colorCode === currentColorCode)? "color-actived":"";
                                  return (
                                    <div
                                        key={'k1'+colorCode}
                                      className={`square-color action-pointer box-color ${classActive}`}
                                      style={{
                                        backgroundColor: color
                                      }}
                                      onClick={() => onChangeTagColor(color)}
                                    />
                                  );
                                })}
                            </div>
                          </div>
                          <div class="col action">
                            <GSButton 
                              success 
                              disabled={!stTagName || stTagName.length === 0}
                              onClick={(e) => handleAddTag(e)}>
                              <GSTrans t={"common.btn.add"}/>
                            </GSButton>
                          </div>
                      </header>
                      <main className="white-color">
                        {stModelTags && stModelTags.map((tag, index) => {
                          const hideClass = !tag.isShow? "inactive":"";
                          return (<div className="body-data row white-color" key={tag.id}>
                            <div className="col tagName text-truncate">
                              <span className={`${hideClass}`} style={{maxWidth: "20rem"}}>{tag.tagName}</span>
                            </div>
                            <div className="col tagColor">
                              <div className="circle-color" style={{
                                backgroundColor: tag.tagColor
                              }}/>
                            </div>
                            <div class="col action">
                              <span className="action-item">
                                <i className={`icon-view ${hideClass}`} onClick={(e) => handleShowTag(tag, index)}></i>
                                <i className="icon-delete" onClick={(e) => handleDeleteTag(tag, index)}></i>
                              </span>
                            </div>
                          </div>);
                        })}
                      </main>
                    </section>
                  </ModalBody>
              </Modal>
            </section>
          </UikWidgetContent>
        </UikWidget>
      </GSContentBody>
    </GSContentContainer>
  </>
  )
}

export const SocialTagElement = (props) => {

  const {className, tagColor, tagName, assigned, onPressTag, id} = props

  return(    
    <div className={`social-tag-element ${className? className: ''}`}
      data-tooltip={tagName}
      style={{
        border: `1px solid ${assigned ? tagColor : '#676767'}`,
        backgroundColor: `${assigned ? tagColor: 'unset'}`,
        color: `${assigned ? '#ffffff': '#676767'}`
      }}
      onClick={() => onPressTag({id, tagName, tagColor})}>
      <i style={{
        backgroundColor: tagColor
      }}/>
      <span className={"text-truncate"}
      style={{
        width: "-webkit-fill-available"
      }}>{tagName}</span>
    </div>
  )
}

GSSocialTag.defaultProps = {
  modal: {
    showClose: true,
    header: <GSTrans t={"gosocial.model.tag.management.title"}></GSTrans>,
    modelClassName: "",
  },
  service: {
    save: (data) => {
      console.assert(`save %o`, data);
    },
    remove: (data) => {
      console.assert(`remove %o`, data);
    },
    assign: (data) => {
      console.assert(`assign %s`, data);
    },
    revoke: (data) => {
      console.assert(`revoke %s`, data);
    }
  },
  tags: [],
  assignedTags: [],
  hasOpenOrder: false,
  uiKey: undefined,
}

GSSocialTag.propTypes = {
  modal: {
    showClose: PropTypes.bool,
    header: PropTypes.any,
    modelClassName: PropTypes.string,
  },
  service: {
    save: PropTypes.func,
    remove: PropTypes.func,
    assign: PropTypes.func,
    revoke: PropTypes.func,
  },
  tags: PropTypes.array,
  assignedTags: PropTypes.array,
  hasOpenOrder: PropTypes.bool,
  uiKey: PropTypes.any,
  callBackApi: PropTypes.func
}

export default GSSocialTag
