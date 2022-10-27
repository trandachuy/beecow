import "./Dropdown-search-checkbox.sass"
import React, {useEffect, useRef, useState} from 'react'
import i18next from "i18next";
import GSButton from "../../../../../components/shared/GSButton/GSButton";
import {Trans} from "react-i18next";
import {array, func, number} from "prop-types";




const DropdownSearchCheckbox = (props) => {
    const refOutsideClick = useRef(null)
    const refOnTop = useRef(null)
    const [expanded, setExpanded] = useState(false);
    const [stListChecked, setStListChecked] = useState([]);

    useEffect(()=>{
        setStListChecked(props.listDataChecked)
    },[props.listDataChecked])

    const isBottom = (el) => {
        let afterCal = Math.floor(el.scrollHeight - el.scrollTop);
        return afterCal <= el.clientHeight;
    }

    const scrollProductList = (e) => {
        const bottom = isBottom(e.currentTarget)
        if (bottom && props.setPage) {
            props.setPage(props.page + 1)
        }
    }

    const handleChecked = (e) =>{
        const id = e.target.name === 'ALL' ? 'ALL' : +(e.target.name)
        if (e.target.checked){
            if(e.target.name === 'ALL'){
                setStListChecked(['ALL'])
                return;
            }else {
                setStListChecked(lc=>{
                    return [...lc, id].filter(clearAll => clearAll != 'ALL')
                })
                return;
            }
        }else {
            setStListChecked(lc=>{
                return lc.filter(item => item != id)
            })
        }
    }

    const onKeyPressSearch = (e) => {
        if (e.key === 'Enter') {
            props.setValueSearch(e.target.value)
            refOnTop.current.scrollTo(0,0)
            e.preventDefault()
        }
    }

    return (
        <div className="col-sm-6 pr-sm-0 dropdown-search-checkbox">
            <div className="select-customer-options">
                <div onClick={()=>{
                    setExpanded(true)
                }}>
                    <div className="options-checked">
                        {stListChecked.filter(clearAll => clearAll != 'ALL').length
                            ?
                            <span>
                                {i18next.t('component.settings.payment.debt.selectedSegment',{x:stListChecked.length})}
                            </span>

                            : i18next.t('component.settings.payment.debt.allCustomers')}

                    </div>
                </div>

                {expanded && (
                    <div className="options-rate border-gray-200 border border-solid"
                         ref={refOutsideClick}
                    >
                        <>
                            <div className="search-box">
                                <input type="text"
                                       // value={}
                                    placeholder="Search Customers"
                                       onKeyPress={onKeyPressSearch}

                                />
                            </div>
                            <div className={'label-list'} onScroll={scrollProductList} ref={refOnTop}>
                                {
                                    props.listDataCheckbox.map(item=>{
                                        return(
                                            <div key={item} className="label">
                                                <input
                                                    key={stListChecked}
                                                    checked={stListChecked.find(checked => checked == item.id)}
                                                    id={item.id}
                                                    type="checkbox"
                                                    name={item.id}
                                                    value={item.id}
                                                    onChange={handleChecked}
                                                    className="m-2 cursor-pointer"
                                                />

                                                <label htmlFor="one"
                                                       htmlFor={item.id}
                                                       className="block m-0">
                                                    {item.name}
                                                </label>
                                            </div>
                                        )
                                    })
                                }
                            </div>

                            <div className="modal-footer-select-customer">
                                <GSButton
                                    onClick={() => {
                                        setExpanded(false)
                                        props.setData(stListChecked)
                                    }
                                    }
                                    className="btn-save"
                                    marginRight style={{marginLeft: 'auto'}}>
                                    <Trans i18nKey={'common.btn.done'} className="sr-only">
                                        Save
                                    </Trans>
                                </GSButton>
                            </div>
                        </>

                    </div>
                )}
            </div>

        </div>
    )
}

DropdownSearchCheckbox.defaultProps = {

}

DropdownSearchCheckbox.propTypes = {
    listDataCheckbox: array,
    setPage:func,
    page:number,
    setData:func,
    setValueSearch:func,
    listDataChecked:array
}

export default DropdownSearchCheckbox
