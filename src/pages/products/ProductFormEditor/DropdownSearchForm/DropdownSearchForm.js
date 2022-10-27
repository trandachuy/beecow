import "./DropdownSearchForm.sass";
import React, { useEffect, useState } from "react";
import { AvField } from "availity-reactstrap-validation";
import GSTrans from "../../../../components/shared/GSTrans/GSTrans";
import Loading from "../../../../components/shared/Loading/Loading";
import { attemptToFindElement } from "../../../../utils/class-name";
import { ItemService } from "../../../../services/ItemService";
import { GSToast } from "../../../../utils/gs-toast";
import i18next from "i18next";
import { Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";
import GSButton from "../../../../components/shared/GSButton/GSButton";
import { debounce } from "lodash";
import PropTypes from 'prop-types'

const MAX_STAFF_PAGE_SIZE = 10;

const DropdownSearchForm = (props) => {
    const [isLoadingData, setIsLoading] = useState(false);
    const [stListUnit, setStListUnit] = useState([]);
    const [stIdUnit, setStIdUnit] = useState([]);
    const [stKeyUnit, setStKeyUnit] = useState(null);
    const [stErrorMessage, setStErrorMessage] = useState('');
    const [isModalCancelDelete, setIsModalCancelDelete] = useState(false);
    const [stPaging, setStPaging] = useState({
        totalPage: 0,
        totalItem: 0,
        currentPage: 0,
    });

    const fetchConversionUnitList = (page = 0,keyword = null, lstItemId = []) => {
        setIsLoading(true);
        ItemService.getListUnitConversion(page, MAX_STAFF_PAGE_SIZE ,{
            lstItemId: lstItemId,
            key: keyword
        })
        .then((data) => {
            if(page === 0){
                setStListUnit(data.content)
            }else {
                setStListUnit([...stListUnit,...data.content])
            }
            setStPaging({
                currentPage: page,
                totalPage: Math.ceil(data.totalElements / MAX_STAFF_PAGE_SIZE)
            });
            setIsLoading(false);
        })
        .catch((err) => {
            console.log(err);
        });
    };

    const handleFocus = (isFocus, id) => {
        let unitSelected = []
        if(props.mainUnit && props.unitSelected){
            unitSelected = [...props.unitSelected, props.mainUnit]
        }
        setStIdUnit(unitSelected);
        attemptToFindElement(`.gs-dropdown-search-form #${id}`, (el) => {
            el[isFocus ? "addClass" : "removeClass"]("expanded");
        });
        if (!isFocus) return;
        fetchConversionUnitList(0,stKeyUnit,unitSelected);
    };

    const handleSearch = (e) => {
        const key = e.target.value.trim()
        if (this.stoSearch) clearTimeout(this.stoSearch)

        this.stoSearch = setTimeout( () => {
            setStPaging({
                ...stPaging,
                currentPage: 0,
            });
            setStListUnit([]);
            setStErrorMessage('')
            setStKeyUnit(key)
            fetchConversionUnitList(0,key,stIdUnit);
        }, 500)
        if (key == ''){
            props.onChange(null);
        }
    };

    const onChange = (r) => {
        props.onChange(r);
        setStErrorMessage('')
    };

    const onClickAddUnit = () => {
        if (stKeyUnit == null) {
            setStErrorMessage(i18next.t("component.product.addNew.unit.exist"))
        }
        ItemService.createUnitConversion({
            name: stKeyUnit,
        })
            .then((data) => {
                props.onChange(data);
                GSToast.commonCreate();
            })
            .catch((e) => {
                let errMsg;
                if (e.response.data.message === "error.error.name.exist") {
                    errMsg = i18next.t("component.product.addNew.unit.exist")
                }
                if (e.response.data.message === "error.error.limit.1000") {
                    errMsg = i18next.t("component.product.addNew.unit.maximum")
                }
                if (e.response.data.message === "error.barcode.existed") {
                    errMsg = i18next.t("component.product.addNew.barcode.exist")
                }
                if (e.response.data.message === "conversion.unit.error.conflict") {
                    errMsg = i18next.t("component.product.addNew.unit.conflict")
                }
                setStErrorMessage(errMsg)
            });
    };

    const scrollListUnit = (e) => {
        const bottom = isBottom(e.currentTarget)
        if (bottom && stPaging.currentPage < stPaging.totalPage) {
            fetchConversionUnitList(stPaging.currentPage + 1)
        }
    };

    const isBottom = (el) => {
        let afterCal = Math.floor(el.scrollHeight - el.scrollTop);
        return afterCal <= el.clientHeight;
    };

    const downModalCancelDelete = () => {
        setIsModalCancelDelete(false);
    };

    const toggleModalCancelDelete = (id) => {
        ItemService.checkConversionUnit(id).then((data) => {
            if (data == true) {
                setIsModalCancelDelete(!isModalCancelDelete);
            } else {
                deleteConversionUnit(id);
            }
        });
    };

    const deleteConversionUnit = (id) => {
        ItemService.deleteUnitConversion(id)
            .then((data) => {
                GSToast.commonDelete();
            })
            .catch((e) => {
                GSToast.commonError();
                console.log(e);
            });
    };

    return (
        <>
            <div className="gs-dropdown-search-form">
                <div
                    className="search-box d-flex flex-row align-item-center"
                    onFocus={() =>
                        handleFocus(
                            true,
                            props.tabIndex ? props.tabIndex : "search-list"
                        )
                    }
                    onBlur={() =>
                        handleFocus(
                            false,
                            props.tabIndex ? props.tabIndex : "search-list"
                        )
                    }
                >
                    <div className={`box-input-unit ${props.parentClass} `}>
                        <AvField
                            key={`input-${props.tabIndex}`}
                            className={
                                stErrorMessage
                                    ? `isBorderCheck ${props.className}`
                                    : `${props.className}`
                            }
                            name={props.name ? props.name : "input-search"}
                            autoComplete="off"
                            maxLength={30}
                            placeholder={props.placeholderSearch}
                            onChange={(e) => handleSearch(e)}
                            value={props.conversionUnitName}
                            style={{position: 'relative'}}
                        />
                    </div>
                    {stKeyUnit &&
                    <span className="icon_add_unit" onClick={() => onClickAddUnit()}>
                            <GSTrans t="common.btn.add"/>
                        </span>
                    }

                </div>
                {stErrorMessage && (
                    <div className="invalid-check">
                        {stErrorMessage}
                    </div>
                )}
                <div
                    className="search-list"
                    onScroll={scrollListUnit}
                    id={props.tabIndex ? props.tabIndex : "search-list"}
                >
                    {stListUnit.map((r, index) => {
                            return (
                                <div className="box-search-item">
                                    <div
                                        key={r.id + "_" + index}
                                        className="search-item gsa-hover--gray cursor--pointer"
                                        onMouseDown={() => onChange(r)}
                                        onMouseUp={() => handleFocus(false)}
                                    >
                                        {r.name}
                                    </div>
                                    <img
                                        src="/assets/images/icon-close.svg"
                                        alt="csv-icon"
                                        onMouseDown={() =>
                                            toggleModalCancelDelete(r.id)
                                        }
                                        className="icon_cancel_unit cursor--pointer"
                                    />
                                </div>
                            );
                        })}
                    {!isLoadingData && stListUnit.length === 0 && (
                        <p className="no-result p-2 text-center">
                            <GSTrans t="component.gsDropdownSearch.noResultFound" />
                        </p>
                    )}
                    {isLoadingData && <Loading className="loading p-2" />}
                </div>
            </div>
            <Modal
                isOpen={isModalCancelDelete}
                toggle={() => downModalCancelDelete()}
                className="modalDeleteUnit"
            >
                <ModalHeader toggle={() => downModalCancelDelete()}>
                    {i18next.t("page.setting.VAT.delete.title")}
                </ModalHeader>
                <ModalBody>
                    {i18next.t("component.product.addNew.unit.titleDelete")}
                </ModalBody>

                <ModalFooter>
                    <GSButton
                        success
                        marginLeft
                        onClick={() => downModalCancelDelete()}
                    >
                        <GSTrans t={"common.btn.ok"} />
                    </GSButton>
                </ModalFooter>
            </Modal>
        </>
    );
};

DropdownSearchForm.propTypes = {
    placeholderSearch: PropTypes.string,
    onChange: PropTypes.func,
    conversionUnitName: PropTypes.string,
    conversionUnitId: PropTypes.number,
};

export default DropdownSearchForm;
