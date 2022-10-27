import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import {UikCheckbox} from "../../../../../@uik";
import './CustomerListBarcodePrinterRow.sass'
import {SCREENS_ENUM} from "../CustomerListBarcodePrinter";
import GSActionButton, {GSActionButtonIcons} from "../../../../../components/shared/GSActionButton/GSActionButton";
import GSTrans from "../../../../../components/shared/GSTrans/GSTrans";
import {ImageUtils} from "../../../../../utils/image";
import {BCOrderService} from "../../../../../services/BCOrderService";
import i18next from "i18next";
import GSImg from "../../../../../components/shared/GSImg/GSImg";
import style from "../../../Edit/CustomerEditor.module.sass";

const CustomerListBarcodePrinterRow = props => {
    const [stAvatar, setStAvatar] = useState('');

    useEffect(() => {
        if (props.customer.userId && stAvatar === '') {
            BCOrderService.getCustomerAvatar(props.customer.userId)
                .then((result) => {
                    setStAvatar(result);
                })
        }
    }, [props.customer.userId])

    const onCheck = () => {
        if (props.screen === SCREENS_ENUM.SEARCH_RESULT) {
            if (!props.checked) {
                props.onSelect(props.customer)
            } else {
                props.onDeselect(props.customer)
            }
        }
    }

    const renderAvatarName = (name) => {
        const namePaths = name.split(' ')
        if (namePaths.length === 1) {
            return namePaths[0].substring(0, 2).toUpperCase()
        } else {
            const lastName = namePaths[0].substring(1, 0)
            const firstName = namePaths[namePaths.length - 1].substring(1, 0)
            return lastName + firstName
        }

    }

    const {customer} = props

    return (
        <div
            className={["d-flex align-items-center customer-list-barcode-printer-customer-row py-2",
                props.screen === SCREENS_ENUM.SEARCH_RESULT ? 'gsa-hover--gray cursor--pointer' : ''].join(' ')}
            onClick={onCheck}>
            {props.screen === SCREENS_ENUM.SEARCH_RESULT &&
            <UikCheckbox
                defaultChecked={props.checked}
                style={{
                    marginLeft: '.5rem'
                }}
                key={customer.id + '-' + props.checked}
            />
            }
            {props.screen === SCREENS_ENUM.INSERTED_LIST &&
            <GSActionButton icon={GSActionButtonIcons.DELETE}
                            onClick={() => props.onDeselect(customer)}
                            style={{
                                marginLeft: '.75rem',
                                marginRight: '.5rem'
                            }}
            />
            }
            {/*<GSImg src={ImageUtils.getImageFromImageModel(stAvatar, 56)}*/}
            {/*     width={56}*/}
            {/*     height={56}*/}
            {/*     alt="customer"*/}
            {/*     className="mr-2"*/}
            {/*/>*/}
            <div className='basic-info-avatar'>
                <div className='text-avatar'
                     style={{
                         backgroundImage: `url(${ImageUtils.getImageFromImageModel(stAvatar, 56)})`
                     }}>
                    {!stAvatar && renderAvatarName(customer.fullName)}
                </div>
            </div>
            <div className="d-flex flex-column flex-grow-1 text-left">
                <h6 className="m-0 customer-list-barcode-printer-customer-row__customer-name">{customer.fullName}</h6>
                <span className="font-size-14px color-gray">{customer.phone}</span>
                <span className="font-size-14px color-gray">{customer.email}</span>
                <span className="font-size-14px color-gray">
                    <GSTrans t={'page.customer.list.printBarCodeRow.barcode'}/><code>{customer.id}</code>
                </span>
            </div>
            <div className={["align-self-start", "user-type", customer.guest ? "guest-type" : "mem-type"].join(' ')} style={{marginRight: '.75rem'}}>
                {customer.guest ? i18next.t('page.livechat.customer.details.search.user_type.contact') : i18next.t('page.livechat.customer.details.search.user_type.member')}
            </div>
        </div>
    );
};

CustomerListBarcodePrinterRow.propTypes = {
    customer: PropTypes.shape({
        id: PropTypes.any,
        userId: PropTypes.any,
        fullName: PropTypes.string,
        phone: PropTypes.string,
        email: PropTypes.string,
        guest: PropTypes.bool,
    }),
    checked: PropTypes.bool,
    onSelect: PropTypes.func,
    onDeselect: PropTypes.func,
    onUpdate: PropTypes.func,
    screen: PropTypes.oneOf(['SEARCH_RESULT', 'INSERTED_LIST'])
};

const areEqual = (prev, next) => {
    // console.log('=======================')
    // console.log(prev, next)
    // console.log('is equal ', prev.customer.id === next.customer.id && prev.checked === next.checked && prev.customer.quantity == next.customer.quantity)
    return prev.customer.id === next.customer.id && prev.checked === next.checked && prev.customer.quantity == next.customer.quantity
}

export default React.memo(CustomerListBarcodePrinterRow, areEqual);
