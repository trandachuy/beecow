import React, {useState} from 'react';
import "./SelectImeiModal.sass"
import {Modal, ModalBody, ModalFooter, ModalHeader} from "reactstrap";
import i18next from "i18next";
import GSButton from "../../../../components/shared/GSButton/GSButton";
import GSTrans from "../../../../components/shared/GSTrans/GSTrans";
import PropTypes from "prop-types";
import {ItemService} from "../../../../services/ItemService";
import style from "../../../customers/Edit/CustomerEditor.module.sass";
import CreatableSelect from "react-select";
import useDebounceEffect from "../../../../utils/hooks/useDebounceEffect";
import Constants from "../../../../config/Constant";

const SIZE_PER_PAGE = 20

function SelectImeiModal(props) {
    const [stSelectedOnlyCodes, setStSelectedOnlyCodes] = useState(props.defaultCodes);
    const [stSelectedCodes, setStSelectedCodes] = useState(props.defaultCodes.map(x => {
        return {
            label: x,
            value: x
        }
    }));
    const [stCodes, setStCodes] = useState([]);
    const [stKeyword, setStKeyword] = useState('');
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPage: 0,
        itemCount: 0
    });

    useDebounceEffect(() => {
        if (props.isOpenModal) {
            fetchCode();
        }
    }, 500, [props.isOpenModal, pagination.currentPage, stKeyword])

    const fetchCode = () => {
        ItemService.searchItemModelCodeForStore({
            itemId: props.itemId,
            modelId: props.modelId,
            branchId: props.branchId,
            keyword: stKeyword,
            page: pagination.currentPage - 1,
            size: SIZE_PER_PAGE,
            status: Constants.ITEM_MODE_CODE_STATUS.AVAILABLE,
        }).then(result => {
            let arr = [...stCodes, ...result.data];
            setStCodes(arr.map(x => {
                return {
                    ...x,
                    classSelected: stSelectedOnlyCodes.indexOf(x.code) > -1 ? 'selected' : ''
                }
            }));

            setPagination(stPagination => ({
                ...stPagination,
                totalPage: Math.ceil(parseInt(result.headers['x-total-count']) / SIZE_PER_PAGE),
                itemCount: parseInt(result.headers['x-total-count'])
            }))
        })
    }

    const cancel = () => {
        props.cancelCallback();
    }
    const save = () => {
        props.saveCallback(stSelectedOnlyCodes);
    }

    const scrollCodeList = (e) => {
        const bottom = isBottom(e.currentTarget)
        if (bottom && pagination.currentPage < pagination.totalPage) {
            setPagination({
                ...pagination,
                currentPage: pagination.currentPage + 1
            })
        }
    }

    const isBottom = (el) => {
        let afterCal = Math.floor(el.scrollHeight - el.scrollTop);
        return afterCal <= el.clientHeight;
    }

    const onInputChange = (value, action) => {
        if (action.action !== "input-blur" && action.action !== "menu-close") {
            setStCodes([]);
            setStKeyword(value);
            setPagination({
                ...pagination,
                currentPage: 1
            })
        }
    }

    const handleChange = (value, action) => {
        if (action.action === 'remove-value') {
            setStSelectedCodes(stSelectedCodes.filter(x => x.value !== action.removedValue.value));
            let onlyCodes = stSelectedOnlyCodes.filter(x => x !== action.removedValue.value);
            setStSelectedOnlyCodes(onlyCodes);
            setStCodes(stCodes.map(x => {
                return {
                    ...x,
                    classSelected: onlyCodes.indexOf(x.code) > -1 ? 'selected' : ''
                }
            }));
        }
    }

    const selectCode = (code) => {
        if (!stSelectedCodes.find(x => x.value === code) && stSelectedOnlyCodes.length < props.quantity) {
            setStSelectedCodes([...stSelectedCodes, ...[{label: code, value: code}]]);
            let onlyCodes = [...stSelectedOnlyCodes, ...[code]];
            setStSelectedOnlyCodes(onlyCodes);
            setStCodes(stCodes.map(x => {
                return {
                    ...x,
                    classSelected: onlyCodes.indexOf(x.code) > -1 ? 'selected' : ''
                }
            }));
        }
    }

    const renderSelectImei = () => {
        return <div className={"code-container"}>
            <div className="input-code">
                <div className={'code-selected-header'}>
                    <div className={'number'}>
                        <GSTrans t={'page.order.detail.confirm.imei.modal.selected'} values={{
                            x: stSelectedCodes.length
                        }}/>
                    </div>
                    <div className={'max'}>
                        <GSTrans t={'page.order.detail.confirm.imei.modal.max'} values={{
                            x: props.quantity
                        }}/>
                    </div>
                </div>
                <CreatableSelect
                    className={'code-selected'}
                    classNamePrefix={'code'}
                    inputValue={stKeyword}
                    isMulti={true}
                    isClearable={false}
                    isSearch={false}
                    onInputChange={onInputChange}
                    onChange={handleChange}
                    placeholder={i18next.t('component.managedInventoryPOSModal.updateStock.search')}
                    noOptionsMessage={() => null}
                    value={stSelectedCodes}
                    style={{
                        ...style,
                        cursor: 'text'
                    }}
                    styles={{
                        clearIndicator: (base, state) => ({
                            ...base,
                            cursor: 'pointer !important'
                        }),
                        multiValueRemove: (base, state) => ({
                            ...base,
                            cursor: 'pointer !important'
                        }),
                        multiValueLabel: (base) => ({
                            ...base,
                            'white-space': 'pre-line',
                            'word-break': 'break-word'
                        })
                    }}
                />
            </div>
            <div className="code" onScroll={scrollCodeList}>
                {
                    stCodes.map((code, index) => {
                        return (
                            <div key={index} className={"content " + code.classSelected}
                                 onClick={() => selectCode(code.code)}>
                                <p>{code.code}</p>
                            </div>
                        )
                    })
                }
            </div>
        </div>
    }

    return (
        <>
            <Modal isOpen={props.isOpenModal} className="select-imei-modal">
                <ModalHeader>
                    <div className="select-imei-modal__titleHeader">
                        <p>{i18next.t("page.order.detail.confirm.imei.modal.title")}</p>
                    </div>
                </ModalHeader>
                <ModalBody>
                    <div className="table d-mobile-none d-desktop-flex">
                        <table>
                            <thead>
                                <tr>
                                    <th>{i18next.t("page.order.detail.confirm.imei.modal.productName")}</th>
                                    <th>{i18next.t("page.order.detail.confirm.imei.modal.productIMEI")}</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                            <tr>
                                <td>
                                    <p>
                                        {props.itemName}
                                    </p>
                                    <p class={'model-name'}>
                                        {props.modelName}
                                    </p>
                                </td>
                                <td colSpan={2}>
                                    {renderSelectImei()}
                                </td>
                            </tr>
                            </tbody>
                        </table>
                    </div>
                    <div className="table d-mobile-flex d-desktop-none">
                        <table>
                            <tbody>
                            <tr>
                                <th>
                                    {i18next.t("page.order.detail.confirm.imei.modal.productName")}
                                </th>
                            </tr>
                            <tr>
                                <td>
                                    <p>
                                        {props.itemName}
                                    </p>
                                    <p class={'model-name'}>
                                        {props.modelName}
                                    </p>
                                </td>
                            </tr>
                            <tr>
                                <th>
                                    {i18next.t("page.order.detail.confirm.imei.modal.productIMEI")}
                                </th>
                            </tr>
                            <tr>
                                <td className={"code-container-mobile"}>
                                    {renderSelectImei()}
                                </td>
                            </tr>
                            </tbody>
                        </table>
                    </div>
                </ModalBody>

                <ModalFooter>
                    <GSButton onClick={cancel}>
                        <GSTrans t={"common.btn.cancel"}/>
                    </GSButton>
                    <GSButton success marginLeft onClick={save}>
                        <GSTrans t={"common.btn.save"}/>
                    </GSButton>
                </ModalFooter>


            </Modal>
        </>
    )
}


SelectImeiModal.propTypes = {
    itemName: PropTypes.string,
    modelName: PropTypes.string,
    isOpenModal: PropTypes.bool,
    itemId: PropTypes.number,
    modelId: PropTypes.number,
    branchId: PropTypes.number,
    defaultCodes: PropTypes.array,
    quantity: PropTypes.number,
    cancelCallback: PropTypes.func,
    saveCallback: PropTypes.func
}

const Option = props => {
    const {data, innerRef, innerProps} = props;
    return (
        <div key={`${data.value}-${data.number}`}
             className={style.optionItemSelect} {...innerRef} {...innerProps} {...props}>
            <i className={style.optionIconPlus}></i>
            <h6><b>{data.value}</b> <span>{data.number}</span></h6>
        </div>
    );
};

export default SelectImeiModal;
