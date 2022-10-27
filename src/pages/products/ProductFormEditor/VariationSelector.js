import React from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {Trans} from "react-i18next";
import CryStrapInput, {CurrencySymbol} from "../../../components/shared/form/CryStrapInput/CryStrapInput";
import {AvField, AvForm} from "availity-reactstrap-validation";
import Label from "reactstrap/es/Label";
import AvFieldCountable from "../../../components/shared/form/CountableAvField/AvFieldCountable";
import i18next from "../../../config/i18n";
import {PricingUtils} from "../../../utils/pricing";
import PropTypes from 'prop-types'
import AlertInline, {AlertInlineType} from "../../../components/shared/AlertInline/AlertInline";
import './VariationSelector.sass'
import GSWidget from "../../../components/shared/form/GSWidget/GSWidget";
import GSWidgetHeader from "../../../components/shared/form/GSWidget/GSWidgetHeader";
import GSWidgetContent from "../../../components/shared/form/GSWidget/GSWidgetContent";
import GSButton from "../../../components/shared/GSButton/GSButton";
import GSTrans from "../../../components/shared/GSTrans/GSTrans";
import {BCOrderService} from "../../../services/BCOrderService";
import PrivateComponent from "../../../components/shared/PrivateComponent/PrivateComponent";
import {PACKAGE_FEATURE_CODES} from "../../../config/package-features";

/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 09/04/2019
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
const VARIATION_TYPES = {
    VARIATION: 'variation',
    DEPOSIT: 'deposit'
}
const DEPOSIT_CODE = '[d3p0s1t]'
export default class VariationSelector extends React.Component {
    DEFAULT_NAME = 'Beecow'
    MAX_ROW = 50
    inValidInputList = []
    refProductContent = [];

    state = {
        prodVariationList: [],
        prodVariationTableData: [],
        prodVariationListSync: [],
        isValid: true,
        inValidMessage: '',
        prodVariationListType: [],
        isAllowDeposit: false
    }

    constructor(props) {
        super(props)


        this.onVariationRefresh = this.onVariationRefresh.bind(this)
        this.onClickAddNewVariation = this.onClickAddNewVariation.bind(this)
        this.onClickRemoveVariation = this.onClickRemoveVariation.bind(this)
        this.refreshVariationTable = this.refreshVariationTable.bind(this)

        this.onChangePrice = this.onChangePrice.bind(this)
        this.onChangeSku = this.onChangeSku.bind(this)
        this.onChangeStock = this.onChangeStock.bind(this)
        this.onValid = this.onValid.bind(this)
        this.onLengthChange = this.onLengthChange.bind(this)
        this.mapResponseToTableData = this.mapResponseToTableData.bind(this)
        this.addTwoVariation = this.addTwoVariation.bind(this)
        this.migrateToNewModel = this.migrateToNewModel.bind(this)
        this.onChangeOrgPrice = this.onChangeOrgPrice.bind(this)
        this.inValidWithMessage = this.inValidWithMessage.bind(this);
        this.setValid = this.setValid.bind(this);
        this.isRowValid = this.isRowValid.bind(this);
        this.hasDeposit = this.hasDeposit.bind(this);

        this.varValues = [new Set(), new Set(), new Set()]
        this.varName = []

        this.refVar = [React.createRef(), React.createRef(), React.createRef()]
    }

    renderVariationName(orgName) {
        if (orgName === DEPOSIT_CODE) {
            return i18next.t('page.product.create.variation.deposit')
        }
        return orgName
    }

    render() {
        return(
            <div className="variation-selector">

                {this.state.prodVariationList.map( (ref, index) => {
                    return (
                        <VariationItem ref={this.refVar[index]}
                                       onClickRemoveVariation={() => this.onClickRemoveVariation(index)}
                                       refreshCallback = {() => this.onVariationRefresh(index)}
                                       values={[...this.varValues[index]]}
                                       name={this.varName[index]}
                                       type={this.state.prodVariationListType[index]}
                                       key={this.state.prodVariationListType[index] + '_' + index}
                        >
                        </VariationItem>
                    )
                })

                }

                <div className="var-empty__wrapper">
                    {this.state.prodVariationList.length === 0 &&
                        <>
                            <img src={'/assets/images/icon-empty-variation.svg'} alt={'image empty'} />
                            <p className="var-empty__text mt-1">
                                <GSTrans t={"page.product.create.variation.empty"}/>
                            </p>
                        </>
                    }
                    {
                    <div className="d-flex flex-row align-items-center">
                        {this.state.prodVariationListType.filter( type => type === VARIATION_TYPES.VARIATION).length < 2 &&
                        <GSButton default
                                  onClick={e => this.onClickAddNewVariation(e, VARIATION_TYPES.VARIATION)}
                                    icon={
                                        <img src="/assets/images/icon-add-variation.svg"/>
                                    }
                        >
                            <Trans i18nKey="component.product.addNew.variations.add">
                                Add variations
                            </Trans>
                        </GSButton>}
                        {this.state.prodVariationList.length <= 2 && this.state.prodVariationListType.filter( type => type === VARIATION_TYPES.DEPOSIT).length === 0 &&
                        <PrivateComponent hasAnyPackageFeature={[PACKAGE_FEATURE_CODES.FEATURE_0109]}>
                            <GSButton default
                                      marginLeft
                                      icon={
                                          <img src="/assets/images/icon-add-deposit.svg"/>
                                      }
                                      onClick={e => this.onClickAddNewVariation(e, VARIATION_TYPES.DEPOSIT)}
                            >
                                <GSTrans t={"page.product.create.variation.addDeposit"}/>
                            </GSButton>
                        </PrivateComponent>
                        }
                    </div>}
                </div>
                {/*WARNING DEPOSIT RESTRICTION*/}
               {this.state.prodVariationListType.filter(type => type === VARIATION_TYPES.DEPOSIT).length > 0 && !this.state.isAllowDeposit &&
               <div className="warning-deposit-restriction mt-3">
                    <div className="icon">
                        <i></i>
                    </div>
                    <div className="content">
                        <div className="title">
                            <Trans i18nKey="page.product.create.variation.deposit.warningRestriction">
                                Warning: Deposit restriction
                            </Trans>
                        </div>
                        <div className="detail">
                            <Trans i18nKey="page.product.create.variation.deposit.warningRestrictionDescription">
                                In order for customers to pay deposit for your products ,you have to Activate the Bank Transfer payment method
                            </Trans>
                        </div>
                    </div>
                </div>}

               {this.state.prodVariationList.length > 0 &&
               <div>
                   <div className="var-table__wrapper">
                        <table className={"var-table " + (this.state.isValid? '':'var-table--error')}>
                            <thead>
                            <tr>
                                <th>#</th>
                                {this.state.prodVariationList.map( (item, index) => {
                                    if (this.state.prodVariationListSync[index] === 1 && this.refVar[index].current &&
                                        this.refVar[index].current.getVariationName() !== '' &&
                                        this.refVar[index].current.getVariationValuesList().length > 0) {
                                        return (
                                            <th key={index}>
                                                {this.renderVariationName(this.refVar[index].current.getVariationName())}
                                            </th>
                                        )
                                    }
                                })}
                                <th>
                                    <Trans i18nKey="component.product.addNew.pricingAndInventory.price">
                                        price
                                    </Trans>
                                </th>
                                {<th hidden={this.hasDeposit() && this.depositHasValues()}>
                                    <Trans i18nKey="component.product.addNew.pricingAndInventory.discountPrice">
                                        discount price
                                    </Trans>
                                </th>}
                                <th>
                                    <Trans i18nKey="component.product.addNew.pricingAndInventory.stock">
                                        Quantity
                                    </Trans>
                                </th>
                                <th>SKU</th>
                            </tr>
                            </thead>
                            <tbody>
                            {this.state.prodVariationTableData.map( (row, index) => {
                                return(
                                    <tr key={row.var1 + (row.var2? '|'+row.var2:'') + (row.var3? '|'+row.var3:'') + row.orgPrice + row.price + row.stock + row.sku}>
                                        <td>{index+1}</td>
                                        <td>{row.var1}</td>
                                        { row.var2? <td>{row.var2}</td>:null}
                                        { row.var3? <td>{row.var3}</td>:null}
                                        <td>
                                            <CryStrapInput
                                                name={'prodVarOrgPrice'}
                                                default_value={row.orgPrice}
                                                thousandSeparator=","
                                                precision="0"
                                                unit={CurrencySymbol.VND}
                                                min_value={1000}
                                                max_value={100000000}
                                                on_blur={ (price) => this.onChangeOrgPrice(index, price)}
                                                on_valid_callback={(status) => {
                                                    this.setValid(status, (index+1) + 'op')}}
                                                checkValidOnLoad
                                            />
                                        </td>
                                        <td hidden={this.hasDeposit() && this.depositHasValues()}>
                                            <CryStrapInput
                                                name={'prodVarPrice'}
                                                default_value={row.price}
                                                thousandSeparator=","
                                                precision="0"
                                                unit={CurrencySymbol.VND}
                                                min_value={1000}
                                                max_value={row.orgPrice}
                                                on_blur={ (price) => this.onChangePrice(index, price)}
                                                on_valid_callback={(status) => {
                                                    this.setValid(status, (index+1) + 'p')}}
                                                checkValidOnLoad
                                                className={this.hasDeposit()? 'gs-atm--disable':''}
                                            />
                                        </td>
                                        <td>
                                            <CryStrapInput
                                                name={'prodVarStock'}
                                                default_value={row.stock}
                                                thousandSeparator=","
                                                precision="0"
                                                unit={CurrencySymbol.NONE}
                                                max_value={1000000}
                                                on_blur={ (stock) => this.onChangeStock(index, stock)}
                                                on_valid_callback={(status) => this.setValid(status, (index+1) + 's')}
                                                checkValidOnLoad/>

                                        </td>
                                        <td>
                                            <AvField value={row.sku} name={'prodVarSKU'}  validate={{
                                                maxLength: {value: 100, errorMessage: 'Maximum characters allowed: 100'}
                                            }}
                                            onBlur={(e, sku) => this.onChangeSku(index, sku)}
                                            />
                                        </td>
                                    </tr>
                                )
                            })}
                            </tbody>
                        </table>
                   </div>
                   <div className="var-row__wrapper">
                       {this.state.prodVariationTableData.map( (row, index) => {
                           return(
                               <GSWidget className="gs-widget" key={row.var1 + (row.var2? '|'+row.var2:'') + (row.var3? '|'+row.var3:'') + row.orgPrice + row.price + row.stock + row.sku}>
                                   <GSWidgetHeader className={'widget__header widget__header--text-align-right widget__header-grey'}
                                                   onChangeCollapsedState = { () => {
                                                       this.refProductContent[index].collapseToggle()
                                                   }}
                                                    showCollapsedButton={true}
                                   >
                                       #{index + 1} - {row.var1}{row.var2? ' - ' + row.var2 : ''}{row.var3? ' - ' + row.var3 : ''}
                                   </GSWidgetHeader>
                                   <GSWidgetContent className={'widget__content'} ref = {el => this.refProductContent[index] = el}>
                                       <div className="row">
                                           <div className="col-lg-6 col-md-6 col-sm-12">
                                               <Label for={'productSKU'} className="gs-frm-control__title"><Trans i18nKey="component.product.addNew.pricingAndInventory.price">
                                                   price
                                               </Trans></Label>
                                               <CryStrapInput
                                                   name={'prodVarOrgPrice'}
                                                   default_value={row.orgPrice}
                                                   thousandSeparator=","
                                                   precision="0"
                                                   unit={CurrencySymbol.VND}
                                                   min_value={1000}
                                                   max_value={100000000}
                                                   on_blur={ (price) => this.onChangeOrgPrice(index, price)}
                                                   on_valid_callback={(status) => {
                                                       this.setValid(status, (index+1) + 'op')}}
                                                   checkValidOnLoad
                                               />
                                           </div>
                                       </div>
                                       <div className="row"  hidden={this.hasDeposit() && this.depositHasValues()}>
                                           <div className="col-lg-6 col-md-6 col-sm-12">
                                               <Trans i18nKey="component.product.addNew.pricingAndInventory.discountPrice">
                                                   price
                                               </Trans>
                                               <CryStrapInput
                                                   name={'prodVarPrice'}
                                                   default_value={this.hasDeposit()? row.orgPrice:row.price}
                                                   thousandSeparator=","
                                                   precision="0"
                                                   unit={CurrencySymbol.VND}
                                                   min_value={1000}
                                                   max_value={row.orgPrice}
                                                   on_blur={ (price) => this.onChangePrice(index, price)}
                                                   on_valid_callback={(status) => {
                                                       this.setValid(status, (index+1) + 'p')}}
                                                   checkValidOnLoad
                                                   className={this.hasDeposit()? 'gs-atm--disable':''}
                                               />
                                           </div>
                                       </div>
                                       <div className="row">
                                           <div className="col-lg-6 col-md-6 col-sm-12">
                                               <Trans i18nKey="component.product.addNew.pricingAndInventory.stock">
                                                   Quantity
                                               </Trans>
                                               <CryStrapInput
                                                   name={'prodVarStock'}
                                                   default_value={row.stock}
                                                   thousandSeparator=","
                                                   precision="0"
                                                   unit={CurrencySymbol.NONE}
                                                   max_value={1000000}
                                                   on_blur={ (stock) => this.onChangeStock(index, stock)}
                                                   on_valid_callback={(status) => this.setValid(status, (index+1) + 's')}
                                                   checkValidOnLoad
                                               />
                                           </div>
                                       </div>
                                       <div className="row">
                                           <div className="col-lg-6 col-md-6 col-sm-12">
                                               <label>
                                                   SKU
                                               </label>
                                               <AvField value={row.sku} name={'prodVarSKU'}  validate={{
                                                   maxLength: {value: 100, errorMessage: 'Maximum characters allowed: 100'}
                                               }}
                                                        onBlur={(e, sku) => this.onChangeSku(index, sku)}
                                               />
                                           </div>
                                       </div>
                                   </GSWidgetContent>
                               </GSWidget>
                           )})}
                   </div>
                    { !this.state.isValid &&
                        <AlertInline type={AlertInlineType.ERROR} nonIcon text={this.state.inValidMessage} />
                    }
                </div>}
            </div>
        )
    }


    componentDidMount() {
        this.mapResponseToTableData()

        BCOrderService.getPaymentSetting()
            .then(result => {
                if (result.paymentCode.match(/BANK_TRANSFER/)) {
                    this.setState({
                        isAllowDeposit: true
                    })
                }
            })
    }

    hasDeposit() {
        return this.state.prodVariationListType.filter(type => type === VARIATION_TYPES.DEPOSIT).length > 0
    }

    depositHasValues() {
        const depositIndex = this.state.prodVariationListType.indexOf(VARIATION_TYPES.DEPOSIT);
        if (depositIndex === -1) {
            return false
        }
        return this.refVar[depositIndex].current && this.refVar[depositIndex].current.getVariationValuesList().length > 0
    }

    migrateToNewModel(model) {
        if (!model[0].label) { // this is old model
            model.map( (item) => {
                item.label = this.DEFAULT_NAME
            })
        }
        return model
    }

    mapResponseToTableData() {
        if (this.props.models && this.props.models.length > 0) {
            // 4(this.props.models)
            let resModels = this.migrateToNewModel(this.props.models)
            let nameList = resModels[0].label.split('|')
            this.varName = nameList

            // create ref and state

            this.setState({
                prodVariationList: nameList.map(n => React.createRef()),
                prodVariationListSync: nameList.map(n => 0),
                prodVariationListType: nameList.map(n => n === DEPOSIT_CODE? VARIATION_TYPES.DEPOSIT:VARIATION_TYPES.VARIATION)
            }, () => {
                this.refreshVariationTable()
            })

            this.onLengthChange(nameList.length)

            let data = []
            if (nameList.length === 1) { //only one var
                for (let model of resModels) {
                    data.push( {
                        id: model.id,
                        var1: model.name,
                        orgPrice: model.orgPrice,
                        price: model.newPrice,
                        stock: model.totalItem,
                        sku: model.sku,
                        label: nameList
                    })
                    this.varValues[0].add(model.name)
                }
            } else {
                for (let model of resModels) {
                    let nameList = model.orgName.split('|')
                    let dataObj = {
                        id: model.id,
                        orgPrice: model.orgPrice,
                        price: model.newPrice,
                        stock: model.totalItem,
                        sku: model.sku,
                        label: nameList
                    }
                    nameList.forEach( (name, index) => {
                        dataObj = {
                            ...dataObj,
                            [`var${index+1}`]: name
                        }
                        this.varValues[index].add(name)
                    })

                    data.push(dataObj)
                }
            }
            this.setState({
                prodVariationTableData: data
            })
        }


    }

    onValid(status) {
        this.setState({
            isValid: status
        })
    }

    setValid(status, cell) {
        if (!status) {
            if (!this.inValidInputList.includes(cell)) {
                this.inValidInputList.push(cell)

            }
        } else {
            // remove cell from invalidList
            this.inValidInputList = this.inValidInputList.filter( item => item !== cell)
        }
        if (this.inValidInputList.length > 0) {
            this.onValid(false)
        } else {
            this.onValid(true)
        }
    }

    inValidWithMessage(message) {
        this.setState({
            isValid: false,
            inValidMessage: message
        })
    }

    onChangePrice(key, price) {
        let tArr = this.state.prodVariationTableData
        tArr[key].price = price
            this.setState({
                prodVariationTableData: tArr
            })
    }

    onChangeOrgPrice(key, price) {
        let tArr = this.state.prodVariationTableData
        tArr[key].orgPrice = price

        if (this.hasDeposit()) {
            tArr[key].price = price
        }

        this.setState({
            prodVariationTableData: tArr
        })

        // check discount price
        const discount = tArr[key].price
        if (discount <= price) {
            this.setValid(true, (key+1) + 'p')
        }

    }

    onChangeStock(key, stock) {
        let tArr = this.state.prodVariationTableData
        tArr[key].stock = stock
        this.setState({
            prodVariationTableData: tArr
        })

        let sumOfStock = 0
        for (let row of tArr) {
            sumOfStock += row.stock
        }

        // check sum of stock
        if (sumOfStock > 1000000) {
            this.setState({
                inValidMessage: i18next.t("component.product.addNew.variations.maxStock")
            })
            this.setValid(false,'maxStock')
        } else {
            this.setState({
                inValidMessage: ''
            })
            this.setValid(true,'maxStock')
        }
    }

    onChangeSku(key, sku) {
        let tArr = this.state.prodVariationTableData
        tArr[key].sku = sku
        this.setState({
            prodVariationTableData: tArr
        })
    }


    isValid() {
        let isValid = true
        if (this.refVar[0].current) {
            isValid &= this.refVar[0].current.isValid()
        }
        if (this.refVar[1].current) {
            isValid &= this.refVar[1].current.isValid()
        }
        if (this.refVar[2].current) {
            isValid &= this.refVar[2].current.isValid()
        }
        return this.state.isValid && isValid
    }

    onLengthChange(amount) {
        if (this.props.onLengthChange) {
            this.props.onLengthChange(amount)
        }
    }


    getValue() {
        let tArr = this.state.prodVariationList
        let listOfVariationName = []

        for (let refIndex in tArr) {
            if( this.refVar[refIndex].current !== null) {
                listOfVariationName[refIndex] = this.refVar[refIndex].current.getVariationName()
            }
        }




        return this.state.prodVariationTableData.map( (item, index) => {
            const id = item.id

            const result = {
                id: item.id,
                name: item.var1 + (item.var2? '|'+item.var2:'')+ (item.var3? '|'+item.var3:''),
                orgPrice: item.orgPrice,
                discount: PricingUtils.calculateDiscount(item.orgPrice, item.price),
                newPrice: item.price,
                totalItem: item.stock,
                label: listOfVariationName.join('|'),
                sku: item.sku
            }

            // always update stock if have id
            if (id) {
                result.quantityChanged = true
            }
            return result
        })
    }


    onVariationRefresh(index) {
        let tSArr = this.state.prodVariationListSync
        let tArr = this.state.prodVariationList
        tSArr[index] = 1
        this.setState({
            prodVariationListSync: tSArr
        })
        this.refreshVariationTable()
    }


    onClickRemoveVariation(index) {
        let tArr = this.state.prodVariationList
        let typeArr = this.state.prodVariationListType
        let tSArr = this.state.prodVariationListSync
        //
        if (index > -1) {
            tArr.splice(index, 1)
            tSArr.splice(index, 1)
            typeArr.splice(index, 1)
            for (let i = index; i < this.varValues.length - 1; i++) {
                this.varValues[i] = this.varValues[i+1]
                this.refVar[i] = this.refVar[i+1]
            }
        }

        this.setState({
            prodVariationList: tArr,
            prodVariationListSync: tSArr,
            prodVariationListType: typeArr
        })

        this.onLengthChange(tArr.length)
        this.refreshVariationTable()
    }

    addTwoVariation() {
        this.setState({
            prodVariationList: [React.createRef(), React.createRef()],
            prodVariationListSync: [0, 0]
        }, () => {
            this.refreshVariationTable()
        })

        this.onLengthChange(2)
    }

    onClickAddNewVariation(e, type) {
        e.preventDefault()
        let tArr = this.state.prodVariationList
        let tSArr = this.state.prodVariationListSync
        let tTypeArr = this.state.prodVariationListType
        if (tArr.length >= 3) return

        // find index of deposit
        const depositIndex = tTypeArr.indexOf(VARIATION_TYPES.DEPOSIT)
        if (depositIndex !== -1) { // => found deposit -> add before deposit
            tArr.splice(depositIndex, 0, React.createRef())
            tSArr.splice(depositIndex, 0, 0)
            tTypeArr.splice(depositIndex, 0, type)

            // update data
            this.refVar.splice(depositIndex, 0, React.createRef())
            this.refVar.pop()
            this.varName.splice(depositIndex, 0, '')
            this.varName.pop()
            this.varValues.splice(depositIndex, 0, new Set())
            this.varValues.pop()
        } else { // => add at last
            const newIndex  = tArr.length
            tArr = [...tArr, React.createRef()]
            tSArr = [...tSArr, 0]
            tTypeArr = [...tTypeArr, type]
            this.refVar[newIndex] = React.createRef()
            this.varName[newIndex] = ''
            this.varValues[newIndex] = new Set()
        }

        this.setState(state => ({
            prodVariationList: tArr,
            prodVariationListSync: tSArr,
            prodVariationListType: tTypeArr
        }), () => {
            this.onLengthChange(tArr.length + 1)
        });


    }


    refreshVariationTable() {
        let tArr = this.state.prodVariationList
        const calculateDiscountPrice = (orgPrice, discountPrice, hasDeposit) => {
            return hasDeposit? orgPrice:discountPrice
        }

        if (tArr.length === 0) {
            this.setState({
                prodVariationTableData: []
            })
        }
        let dataBackup = this.state.prodVariationTableData
        this.inValidInputList = []

        // query variations to get values & names
        let data = []
        let listOfVariationValue = []
        let listOfVariationName = []
        for (let index in tArr) {
            if (this.refVar[index].current !== null) {
                listOfVariationValue[index] = this.refVar[index].current.getVariationValuesList()
                this.varValues[index] = new Set(listOfVariationValue[index])
                listOfVariationName[index] = this.refVar[index].current.getVariationName()
            }
        }
        this.varName = listOfVariationName

        const hasDeposit = this.state.prodVariationListType.includes(VARIATION_TYPES.DEPOSIT);


        let orgPrice = this.props.price
        let price = calculateDiscountPrice(orgPrice, this.props.discountPrice, hasDeposit)
        let stock = this.props.stock
        let sku = this.props.sku
        let foundItem
        let sumOfStock = 0
        // remove invalid field


        // if have one var
        if (listOfVariationValue.length ===  1) {
            for (let [index, var1] of listOfVariationValue[0].entries()) {
                // if already existed -> add to array and update stock
                foundItem = dataBackup.filter( (item) => item.var1 === var1 && !item.var2)
                if (foundItem.length > 0) {
                    data.push(foundItem[0])
                    sumOfStock += foundItem[0].stock

                } else {
                // add new
                    data.push( {
                        var1: var1,
                        orgPrice: orgPrice,
                        price:  calculateDiscountPrice(orgPrice, price, hasDeposit),
                        stock: stock,
                        sku: sku,
                        label: listOfVariationName.join('|')
                    })
                    sumOfStock += stock
                }

                this.isRowValid(data[data.length-1], index+1)
            }
            this.setState({
                prodVariationTableData: data
            })
        }

        //if have two vars
        let rows = 0
        if (listOfVariationValue.length === 2) {
            for (let var1 of listOfVariationValue[0]) {
                for (let var2 of listOfVariationValue[1]) {
                    foundItem = dataBackup.filter( (item) => item.var1 === var1 && item.var2 && item.var2 === var2 && !item.var3)
                    if (foundItem.length > 0) {
                        data.push(foundItem[0])
                        sumOfStock += foundItem[0].stock
                    } else {
                        // invalidBackup = invalidBackup.filter( inputName => inputName.chartAt(0) != (rows+1))

                        data.push( {
                            var1: var1,
                            var2: var2,
                            orgPrice: orgPrice,
                            price: calculateDiscountPrice(orgPrice, price, hasDeposit),
                            stock: stock,
                            sku: sku,
                            label: listOfVariationName.join('|')
                        })
                        sumOfStock += stock
                    }
                    this.isRowValid(data[data.length-1], rows+1)
                    rows++
                }
            }
            this.setState({
                prodVariationTableData: data
            })


        }


        rows = 0
        if (listOfVariationValue.length === 3) {

            for (let var1 of listOfVariationValue[0]) {
                for (let var2 of listOfVariationValue[1]) {
                    for (let var3 of listOfVariationValue[2]) {
                        foundItem = dataBackup.filter( (item) => item.var1 === var1 && item.var2 && item.var2 === var2 && item.var3 === var3)
                        if (foundItem.length > 0) {
                            data.push(foundItem[0])
                            sumOfStock += foundItem[0].stock
                        } else {

                            // invalidBackup = invalidBackup.filter( inputName => inputName.chartAt(0) != (rows+1))

                            data.push( {
                                var1: var1,
                                var2: var2,
                                var3: var3,
                                orgPrice: orgPrice,
                                price:  calculateDiscountPrice(orgPrice, price, hasDeposit),
                                stock: stock,
                                sku: sku,
                                label: listOfVariationName.join('|')
                            })
                            sumOfStock += stock
                        }
                        this.isRowValid(data[data.length-1], rows+1)
                        rows++
                    }

                }
            }
            this.setState({
                prodVariationTableData: data
            })


        }

        // check duplicate name
        if (listOfVariationName.length >= 2 && listOfVariationName[0] === listOfVariationName[1] && listOfVariationName[0]) {  // duplicate variation name
            this.setValid(false, 'dupVarName')
            this.setState( {
                inValidMessage: i18next.t("component.product.addNew.variations.duplicatedName")
            })
        } else {
            // check sum of stock
            if (sumOfStock > 1000000) {
                this.setState({
                    inValidMessage: i18next.t("component.product.addNew.variations.maxStock")
                })
                this.setValid(false, 'maxStock')
            } else {
                this.setState({
                    inValidMessage: ''
                })
                this.setValid(true, 'maxStock')
                // check amount of table rows
                if (data.length > this.MAX_ROW) {
                    this.setState({
                        inValidMessage: i18next.t("component.product.addNew.variations.max400", {max: this.MAX_ROW})
                    })
                    this.setValid(false, 'maxLength')
                } else {
                    this.setState({
                        inValidMessage: ''
                    })
                    this.setValid(true, 'maxLength')
                }
            }
        }




    }

    isRowValid(dataRow, index) {
        /*
                                    var1: var1,
                            var2: var2,
                            orgPrice: price,
                            price: price,
                            stock: stock,
                            sku: sku,
                            label: listOfVariationName.join('|')
         */
        if (dataRow.orgPrice < dataRow.price) {
            this.setValid(false, index + 'p')
        }
        if (dataRow.orgPrice < 1000) {
            this.setValid(false, index + 'op')
        }
        if (dataRow.orgPrice > 100000000) {
            this.setValid(false, index + 'op')
        }
        if (dataRow.price < 1000) {
            this.setValid(false, index + 'p')
        }
        if (dataRow.orgPrice > 100000000) {
            this.setValid(false, index + 'p')
        }
    }

}


class VariationItem extends React.Component {

    constructor(props) {
        super(props)

        this.MAX_VARS_AMOUNT = 20

        this.state = {
            lsVar: props.values? props.values:[],
            isValid: true,
            isValidValue: true,
            isValidName: true
        }

        this.onChange = this.onChange.bind(this)
        this.onKeyPress = this.onKeyPress.bind(this)
        this.onClickRemoveVariationValue = this.onClickRemoveVariationValue.bind(this)
        this.onClickRemoveVariation = this.props.onClickRemoveVariation

        this.getVariationValuesList = this.getVariationValuesList.bind(this)
        this.getVariationName = this.getVariationName.bind(this)
        this.refreshCallback = this.props.refreshCallback
        this.onChangeName = this.onChangeName.bind(this)
        this.onKeyPressName = this.onKeyPressName.bind(this);


        this.onEnter = this.props.onEnter
        this.inputTemp = ''
        this.inputNameTemp = this.props.name? this.props.name:''
        this.lsVar = props.values? props.values:[]

        this.refInput = React.createRef()
        this.refVarName = React.createRef()

        this.handleOnSubmit = this.handleOnSubmit.bind(this)

        // this.refreshCallback()
    }

    componentDidMount() {
        if (this.props.type === VARIATION_TYPES.DEPOSIT) {
            this.inputNameTemp = DEPOSIT_CODE
        }

        setTimeout(() => {
            // need to wait 500ms (wait for ref is ready)
            this.refreshCallback()
        }, 500)
    }


    getVariationValuesList() {
        return this.lsVar
    }

    getVariationName() {
        if (this.props.type === VARIATION_TYPES.DEPOSIT) {
            return DEPOSIT_CODE
        }
        return this.inputNameTemp.trim()
    }


    onChange(e) {
        this.inputTemp = e.currentTarget.value.split('|').join('').trim()
    }

    onChangeName(e) {
        const value = e.currentTarget.value
        this.inputNameTemp = value.split('|').join('').trim()
        this.isValid()
        this.refreshCallback()
    }

    onKeyPress(e) {
        const value = this.refInput.current.value.split('|').join('').trim()
        if ((e.key === 'Enter' || e.key === ',') && value) {
            e.preventDefault()
            this.refInput.current.value = ''
            let tArr = this.state.lsVar
            let index = tArr.indexOf(value)
            if (index === -1 && tArr.length < this.MAX_VARS_AMOUNT) {
                this.lsVar = [...tArr, value]
                this.setState({
                    lsVar: [...tArr, value]
                }, () => {
                    this.isValid()
                })
                this.refreshCallback()
            }
        } else {
            if (e.key === '|') {
                e.preventDefault()
            }
        }
    }

    onClickRemoveVariationValue(item) {
        let tArr = this.state.lsVar
        let index = tArr.indexOf(item)
        if (index > -1) {
            tArr.splice(index, 1)
        }
        this.lsVar = tArr
        this.setState({
            lsVar: tArr
        })
        this.refreshCallback()
    }


    isValid() {
        let isValid = true
        if (this.state.lsVar.length === 0) {
            this.setState({
                isValidValue: false
            })
            isValid &= false
        } else {
            this.setState({
                isValidValue: true
            })
        }

        if (this.inputNameTemp === '') {
            this.setState({
                isValidName: false
            })
            isValid &= false
        } else {
            this.setState({
                isValidName: true
            })
        }


        this.setState({
            isValid: isValid
        })

        return isValid
    }


    handleOnSubmit(e, errors, values) {

    }

    onKeyPressName(e) {
        if (this.props.type === VARIATION_TYPES.DEPOSIT) { // prevent change deposit name
            e.preventDefault()
        }
        if (e.key === '|') {
            e.preventDefault()
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.values !== this.props.values) {
            this.setState({
                lsVar: this.props.values
            })
            this.lsVar = this.props.values
        }
        if (prevProps.name !== this.props.name) {
            this.inputNameTemp = this.props.name
        }
    }


    render() {
        return(
            <div className={"var-item__wrapper " + (this.state.isValid? '':'gs-atm__border--error')}>
                <AvForm onSubmit={this.handleOnSubmit}>
                    <button type="submit" ref={(el) => this.btnSubmit = el} hidden/>
                <a className="var-item__btn-remove"
                   onClick={this.onClickRemoveVariation}>
                    <FontAwesomeIcon icon="times-circle">
                    </FontAwesomeIcon>
                </a>

                <div className="row">
                    <div className="col-lg-4 col-mid-4 col-sm-12" hidden={this.props.type !== VARIATION_TYPES.DEPOSIT}>
                        <div className="d-flex align-items-center gs-frm-control__title" style={{height: '100%'}}>
                            <GSTrans t={'page.product.create.variation.deposit'}/>
                        </div>

                    </div>

                    <div className="col-lg-4 col-mid-4 col-sm-12" hidden={this.props.type === VARIATION_TYPES.DEPOSIT}>
                        <Label className="gs-frm-control__title">
                            <Trans i18nKey="component.product.addNew.variations.name">
                                Name
                            </Trans>
                        </Label>

                        <AvFieldCountable
                            name='variation'
                            maxLength={14}
                            minLength={1}
                            isRequired={true}
                            onKeyPress={this.onKeyPressName}
                            onChange={this.onChangeName}
                            ref={this.refVarName}
                            value={this.props.type === VARIATION_TYPES.DEPOSIT? i18next.t('page.product.create.variation.deposit'):this.props.name}
                            className={ (this.state.isValidName? '':'gs-atm__border--error ') + (this.props.type === 'deposit'? 'gs-atm--disable':'')}
                        />
                    </div>
                    <div className="col-lg-8 col-mid-8 col-sm-12">
                        <Label className="gs-frm-control__title">
                            <Trans i18nKey={this.props.type === VARIATION_TYPES.DEPOSIT? 'page.product.create.variation.deposit.value':"component.product.addNew.variations.value"}>
                                Values
                            </Trans>
                        </Label>
                        <div className={"var-values__wrapper " + (this.state.isValidValue? '':'gs-atm__border--error')}>
                            <input type="text"
                                   placeholder={i18next.t(this.props.type === VARIATION_TYPES.DEPOSIT? 'page.product.create.variation.deposit.placeholder':"component.product.addNew.variations.valueHint")}
                                   onChange={this.onChange}
                                   onKeyPress={this.onKeyPress}
                                   maxLength={20}
                                   ref={this.refInput}/>
                            <div className="var-values__pool">
                                {this.state.lsVar.map( (item, index) => {
                                    return(
                                        <div key={item} className="var-values__varItem">
                                            {item}
                                            <a className="var-values__btn-remove"
                                               onClick={ () => {this.onClickRemoveVariationValue(item)}}>
                                                <FontAwesomeIcon icon="times-circle">
                                                </FontAwesomeIcon>
                                            </a>
                                        </div>
                                    )
                                })}
                            </div>

                        </div>
                        { !this.state.isValid && this.state.lsVar.length === 0 &&
                            <AlertInline text={i18next.t(this.props.type === VARIATION_TYPES.VARIATION? "component.product.addNew.variations.invalidValue":"component.product.addNew.deposits.invalidValue")} type={AlertInlineType.ERROR} nonIcon/>
                        }
                    </div>
                </div>
                </AvForm>
            </div>
        )
    }
}

VariationItem.defaultValue = {
    type: 'variation'
}

VariationItem.propTypes = {
    name: PropTypes.any,
    onClickRemoveVariation: PropTypes.any,
    onEnter: PropTypes.any,
    refreshCallback: PropTypes.any,
    values: PropTypes.any,
    type: PropTypes.oneOf(['variation', 'deposit']),
}

VariationSelector.propTypes = {
  discountPrice: PropTypes.any,
  onLengthChange: PropTypes.any,
  price: PropTypes.any,
  sku: PropTypes.any,
  stock: PropTypes.any,
    models: PropTypes.array
}

