import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import ModalHeader from "reactstrap/es/ModalHeader";
import ModalBody from "reactstrap/es/ModalBody";
import ModalFooter from "reactstrap/es/ModalFooter";
import GSTrans from "../../../../components/shared/GSTrans/GSTrans";
import Modal from "reactstrap/es/Modal";
import './CustomerListBarcodePrinter.sass'
import GSSearchInput from "../../../../components/shared/GSSearchInput/GSSearchInput";
import {UikCheckbox, UikSelect} from '../../../../@uik'
import i18next from "i18next";
import CustomerListBarcodePrinterCustomerRow from "./Row/CustomerListBarcodePrinterRow";
import _ from 'lodash'
import GSFakeLink from "../../../../components/shared/GSFakeLink/GSFakeLink";
import GSButton from "../../../../components/shared/GSButton/GSButton";
import {AvForm} from 'availity-reactstrap-validation'
import {CustomerListBarcodePrinterTemplateHTML} from "./PrintTemplate/CustomerListBarcodePrinterTemplate";
import {PagingUtils} from "../../../../utils/paging";
import PagingTable from "../../../../components/shared/table/PagingTable/PagingTable";
import Loading, {LoadingStyle} from "../../../../components/shared/Loading/Loading";
import GSActionButton, {GSActionButtonIcons} from "../../../../components/shared/GSActionButton/GSActionButton";
import {WindowUtils} from "../../../../utils/download";
import beehiveService from "../../../../services/BeehiveService";

export const SEARCH_BY_ENUM = {
    CUSTOMER: 'CUSTOMER',
    BARCODE: 'BARCODE'
}

export const SCREENS_ENUM = {
    SEARCH_RESULT: 'SEARCH_RESULT',
    INSERTED_LIST: 'INSERTED_LIST'
}

const SIZE_PER_PAGE = 20

const PAGE_SIZE = {
    A4_38MM_21MM: 'A4 38mm x 21mm',
    A2_75IN_0_87IN: '70mm x 22mm',

}

const PRINT_PAGE_SIZE_OPTIONS = [
    {
        value: 'A4_38MM_21MM',
        label: PAGE_SIZE.A4_38MM_21MM
    },
    {
        value:'A2_75IN_0_87IN',
        label: PAGE_SIZE.A2_75IN_0_87IN
    }
]

const CustomerListBarcodePrinter = props => {
    const [stCustomerList, setStCustomerList] = useState([]);
    const [stSelectedList, setStSelectedList] = useState([]);
    const [stSearchBy, setStSearchBy] = useState({
        value: SEARCH_BY_ENUM.CUSTOMER
    });
    const [stScreen, setStScreen] = useState(SCREENS_ENUM.SEARCH_RESULT);
    const [stSearchKeyword, setStSearchKeyword] = useState('');
    const [stPaging, setStPaging] = useState({
        current: 1,
        total: 0
    });
    const [stIsLoading, setStIsLoading] = useState(false);
    const [stPageSize, setStPageSize] = useState(PRINT_PAGE_SIZE_OPTIONS[1]);


    useEffect(() => {
        setStSearchKeyword('')
        setStSearchBy({
            value: SEARCH_BY_ENUM.CUSTOMER
        })
        setStSelectedList([])

        if (!props.isOpen) {
            setStPaging((paging) => ({
                ...paging,
                current: 1,
            }));
            setStScreen(SCREENS_ENUM.SEARCH_RESULT)
        }
    }, [props.isOpen])

    useEffect(() => {
        setStIsLoading(true)

        props.isOpen && searchCustomers()
            .then(response => {
                const {data, headers} = response

                setStPaging({
                    current: 1,
                    total:  PagingUtils.getTotalPageFromHeaders(headers, SIZE_PER_PAGE)
                })
                setStCustomerList(data);
            })
            .finally(() => {
                setStIsLoading(false)
            })
    }, [stSearchKeyword, stSearchBy]);

    useEffect(() => {
        setStIsLoading(true)

        props.isOpen && searchCustomers()
            .then(response => {
                const {data, headers} = response

                setStPaging({
                    ...stPaging,
                    total: PagingUtils.getTotalPageFromHeaders(headers, SIZE_PER_PAGE)
                })
                setStCustomerList(data);
            })
            .finally(() => {
                setStIsLoading(false)
            })
    }, [stPaging.current]);

    const searchCustomers = () => {
        return stSearchBy.value === SEARCH_BY_ENUM.BARCODE
            ? beehiveService.searchCustomerByID(stPaging.current - 1, SIZE_PER_PAGE, stSearchKeyword.trim())
            : beehiveService.searchCustomerByName(stPaging.current - 1, SIZE_PER_PAGE, stSearchKeyword.trim())
    }

    const onCheckCustomer = (customer) => {
        setStSelectedList(stSelectedList => [...stSelectedList, customer])
    }

    const onUncheckCustomer = (customer) => {
        setStSelectedList(stSelectedList => {
            const customerIndex = stSelectedList.findIndex(c => {
                    return customer.id == c.id
                }),
                newCustomerList = _.clone(stSelectedList)

            newCustomerList.splice(customerIndex, 1)

            if (newCustomerList.length === 0 && stScreen === SCREENS_ENUM.INSERTED_LIST) {
                setStScreen(SCREENS_ENUM.SEARCH_RESULT)
            }

            return newCustomerList
        })
    }

    const onUpdateCustomer = (customer) => {
        setStSelectedList(stSelectedList => {
            const customerIndex = stSelectedList.findIndex(c => {
                    return customer.id == c.id
                }),
                newCustomerList = _.clone(stSelectedList)

            newCustomerList.splice(customerIndex, 1, customer)

            return newCustomerList
        })
    }

    const onCheckAll = (event) => {
        const checked = event.currentTarget.checked,
            checkedList = _.clone(stSelectedList)

        if (checked) {
            for (const customer of stCustomerList) {
                if (isChecked(customer)) continue

                checkedList.push(customer)
            }
        } else {
            for (const customer of stCustomerList) {
                const customerIndex = checkedList.findIndex(p => {
                    return customer.id == p.id
                })

                checkedList.splice(customerIndex, 1)
            }
        }

        setStSelectedList(checkedList)
    }

    const isChecked = (customer) => {
        return !!stSelectedList.find(c => c.id == customer.id)
    }

    const isCheckedAll = () => {
        if (stCustomerList.length === 0) {
            return false
        }

        for (const customer of stCustomerList) {
            if (!stSelectedList.find(c => c.id == customer.id)) {
                return false
            }
        }

        return true
    }

    const unCheckAllPage = () => {
        setStSelectedList([])

        if (stScreen === SCREENS_ENUM.INSERTED_LIST) {
            setStScreen(SCREENS_ENUM.SEARCH_RESULT)
        }
    }

    const onChangeSearchBy = (e) => {
        setStSearchBy(e)
    }

    const switchScreen = (destinationScreen) => {
        setStScreen(destinationScreen)
    }

    const onChangePage = (pageNumber) => {
        setStPaging({
            ...stPaging,
            current: pageNumber
        })
    }

    const onClickPrint = () => {
        const htmlTemplate = CustomerListBarcodePrinterTemplateHTML(stSelectedList, stPageSize)
        WindowUtils.openFileInNewTab(htmlTemplate)
    }

    return (
        <>
            <Modal isOpen={props.isOpen} contentClassName="customer-list-barcode-printer">
                <ModalHeader className="text-left" children={
                    <>
                        <GSTrans t="page.customer.list.printBarCode.printCustomerBarCode"/>

                        <span className="customer-list-barcode-printer__selected font-size-14px font-weight-normal">
                            {stSelectedList.length > 0 && <>
                                <GSTrans t="page.customer.list.printBarCode.selected"
                                         values={{quantity: stSelectedList.length}}>
                                    0<b>1</b>
                                </GSTrans>
                                {' | '}
                                <GSFakeLink className="font-weight-bold" onClick={unCheckAllPage}>
                                    <GSTrans t="page.customer.list.printBarCode.unCheckAll"/>
                                </GSFakeLink>
                            </>}
                            <GSActionButton icon={GSActionButtonIcons.CLOSE}
                                            width={'1rem'}
                                            style={{marginLeft: '1rem'}}
                                            onClick={props.onClose}
                            />
                        </span>
                    </>
                }>
                </ModalHeader>
                <ModalBody>
                    {stScreen === SCREENS_ENUM.SEARCH_RESULT &&
                    <>
                        <div
                            className="d-flex align-items-center flex-md-row flex-column customer-list-barcode-printer__search-wrapper">
                            <UikCheckbox onChange={onCheckAll} defaultChecked={isCheckedAll()} key={isCheckedAll()}/>
                            <GSSearchInput liveSearchOnMS={500}
                                           onSearch={setStSearchKeyword}
                                           className="flex-grow-1"
                                           style={{
                                               height: '38px',
                                           }}
                                           wrapperProps={{
                                               style: {
                                                   height: '38px',
                                                   width: '100%',
                                                   marginRight: '.25rem'
                                               }
                                           }}
                                           defaultValue={stSearchKeyword}
                                           placeholder={i18next.t(stSearchBy.value === SEARCH_BY_ENUM.CUSTOMER ? 'page.customer.list.printBarCode.searchByCustomer' : 'page.customer.list.printBarCode.searchByBarcode')}
                            />
                            <UikSelect
                                onChange={onChangeSearchBy}
                                position={'bottomRight'}
                                value={[stSearchBy]}
                                style={{
                                    width: '100px'
                                }}
                                className='customer-list-barcode-printer__search-by-selector'
                                options={[
                                    {
                                        value: SEARCH_BY_ENUM.CUSTOMER,
                                        label: i18next.t('page.customer.list.printBarCode.customer'),
                                    },
                                    {
                                        value: SEARCH_BY_ENUM.BARCODE,
                                        label: i18next.t('page.customer.list.printBarCode.barcode'),
                                    }
                                ]}
                            />
                        </div>
                        {!stIsLoading &&
                        <div className="customer-list-barcode-printer__customer-list">
                            {stCustomerList.map(customer => {
                                return (
                                    <CustomerListBarcodePrinterCustomerRow
                                        customer={customer}
                                        checked={isChecked(customer)}
                                        key={customer.id}
                                        onSelect={onCheckCustomer}
                                        onDeselect={onUncheckCustomer}
                                        screen={stScreen}
                                    />
                                )
                            })}
                            {stCustomerList.length === 0 &&
                            <div className="my-4">
                                <GSTrans t="common.noResultFound"/>
                            </div>
                            }
                        </div>}

                        {!stIsLoading &&
                        <PagingTable totalPage={stPaging.total}
                                     onChangePage={onChangePage}
                                     currentPage={stPaging.current}
                                     maxShowedPage={10}
                                     isShowPagination={true}
                                     totalItems={1}
                        />
                        }
                        {stIsLoading &&
                        <Loading style={LoadingStyle.DUAL_RING_GREY}
                                 className="d-flex justify-content-center align-items-center" cssStyle={{
                            height: '50vh',
                        }}/>
                        }
                    </>
                    }
                    {stScreen === SCREENS_ENUM.INSERTED_LIST &&
                    <AvForm>
                        <div
                            className="customer-list-barcode-printer__customer-list customer-list-barcode-printer__inserted-list">
                            {stSelectedList.map(customer => {
                                return (
                                    <CustomerListBarcodePrinterCustomerRow
                                        customer={customer}
                                        onDeselect={onUncheckCustomer}
                                        screen={stScreen}
                                        onUpdate={onUpdateCustomer}
                                        checked={true}
                                        key={customer.id}
                                    />
                                )
                            })}
                        </div>
                    </AvForm>
                    }
                </ModalBody>
                <ModalFooter>
                    {stScreen === SCREENS_ENUM.SEARCH_RESULT &&
                    <>
                        <GSButton secondary outline onClick={props.onClose}>
                            <GSTrans t="common.btn.cancel"/>
                        </GSButton>
                        <GSButton success
                                  disabled={stSelectedList.length === 0}
                                  marginLeft
                                  onClick={() => stSelectedList.length > 0 && switchScreen(SCREENS_ENUM.INSERTED_LIST)}
                        >
                            <GSTrans t="page.customer.list.printBarCode.insertCustomers"/>
                        </GSButton>
                    </>}
                    {stScreen === SCREENS_ENUM.INSERTED_LIST &&
                    <>
                        <GSButton secondary outline onClick={() => switchScreen(SCREENS_ENUM.SEARCH_RESULT)}>
                            <GSTrans t="common.btn.back"/>
                        </GSButton>
                        <UikSelect
                            options={PRINT_PAGE_SIZE_OPTIONS}
                            defaultValue={stPageSize.value}
                            onChange={setStPageSize}
                            className="ml-auto product-list-barcode-printer__page-size-selector"
                        />

                        <GSButton success marginLeft onClick={onClickPrint}>
                            <GSTrans t="page.customer.list.printBarCode.btn.print"/>
                        </GSButton>

                    </>}
                </ModalFooter>
            </Modal>
        </>
    );
};

CustomerListBarcodePrinter.propTypes = {
    isOpen: PropTypes.bool,
    onClose: PropTypes.func,
};

export default CustomerListBarcodePrinter;
