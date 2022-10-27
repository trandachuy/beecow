import React, {useContext, useEffect, useReducer, useRef} from 'react';
import './VariationSelectionList.sass'
import PropTypes from "prop-types";
import {VariationSelectionContext} from "../context/VariationSelectionContext";
import GSImg from "../../../../components/shared/GSImg/GSImg";
import ConfirmModal from "../../../../components/shared/ConfirmModal/ConfirmModal";
import i18next from "../../../../config/i18n";

const DEPOSIT_100_KEY = '[100P3rc3nt]';
const VariationSelectionList = props => {
    const [state, dispatch] = useReducer(VariationSelectionContext.reducer, VariationSelectionContext.initState);
    const {className, variationList, imageList,selected, variationMap, switchVariationAction, isChange ,...other} = props
    useEffect(() => {
        dispatch(VariationSelectionContext.actions.changeCurrentVariationSelecton(variationMap[selected]))
    }, []);

    useEffect(() => {
        dispatch(VariationSelectionContext.actions.comfirModalChangeForm(isChange))
    }, [isChange]);

   const modifiedModel = (model) => {
        if (model.label) {
            let arrLabel = model.label.split('|');
            let arrValue = model.orgName.split('|');
            arrLabel.map((label, idx) => {
                model[label] = arrValue[idx];
            })
            model.arrLabel = arrLabel;
        }
        return model;
    }
    return (
        <VariationSelectionContext.provider
            value={{state, dispatch}}
        >
        <div className={["variation-list", className].join(' ')} {...other} >
            <div className="variation-list__list-container gs-atm__scrollbar-1">
                <>
                    {
                        variationList.map(function(value, key) {
                            return (
                                <VariationSelectionItem
                                    key={`${value.id}-${key}`}
                                    data={modifiedModel(value)}
                                    image={imageList[value.imagePosition]}
                                    onClick={props.switchVariationAction}
                                />
                            )
                        })
                    }
                </>
            </div>
        </div>
        </VariationSelectionContext.provider>
    );
};
VariationSelectionList.defaultProps = {
    variationList: new Map(),
    imageList: new Map(),
    isChange: false
};

VariationSelectionList.propTypes = {
    className: PropTypes.string,
    variationList: PropTypes.array,
    imageList: PropTypes.any,
    selected: PropTypes.any,
    switchVariationAction: PropTypes.func,
    variationMap: PropTypes.any,
    isChange: PropTypes.bool
};

export default VariationSelectionList;


const VariationSelectionItem = (props) => {
    const ref = useRef(null);
    const {state, dispatch} = useContext(VariationSelectionContext.context);
    const setActive = () => {
        if(state && state.currentVariationSelection
            && state.currentVariationSelection.id === props.data.id) {
            ref.current.scrollIntoView({
                behavior: "smooth",
                block: 'nearest',
                inline: "nearest"
            });
            return 'variation-list__item--active';
        }
       return '';
    };
    const onClick = () => {
        if (state.currentVariationSelection && state.currentVariationSelection.id !== props.data.id) {
            if(state.isChange) {
                this.refConfirmModal.openModal({
                    messages: i18next.t('component.product.addNew.cancelHint'),
                    okCallback: () => {
                        changeCurrentActive();
                    }
                })
            }else {
                changeCurrentActive();
            }
        }
    };
    const changeCurrentActive = () => {
        dispatch(VariationSelectionContext.actions.changeCurrentVariationSelecton(props.data))
        if (props.onClick) {
            props.onClick(props.data)
        }
    };
    return (
        <>
            <div className={["variation-list__item", props.className, setActive()].join(' ')}
                 onClick={onClick}
                 ref={ref}
            >
                <GSImg
                    className={'variation__avatar'}
                    src={props.image}
                />
                <div className="ml-2 d-flex flex-column justify-content-between variation__info-wrapper">
                <span className="variation-name"
                >{props.data.arrLabel.filter(label => props.data[label] !== DEPOSIT_100_KEY).map((label, _) => {return props.data[label]},[]).join(' - ')}</span>
                </div>
            </div>
            <ConfirmModal ref={(el) => { this.refConfirmModal = el }} />
        </>
    )
};

VariationSelectionItem.propTypes = {
    className: PropTypes.string,
    data: PropTypes.object,
    image: PropTypes.any,
    onClick: PropTypes.func,
};
