/*******************************************************************************
 * Copyright 2019 (C) Mediastep Software Inc.
 *
 * Created on : 19/03/2019
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import React from "react";
import '../../../../sass/ui/_gswidget.sass'
import '../../../../sass/ui/_gsfrm.sass'
import {CategoryService} from "../../../services/category";
import Loading, {LoadingStyle} from "../../../components/shared/Loading/Loading";


export class GomuaCategorySelector extends React.Component {
    _isMounted = false

    constructor(props) {
        super(props)

        this.state = {
            categoryArr: [ [], [], [] ],
            selectedLvl: [-1, -1, -1],
            loading: false
        }

        this.selectCategory = this.selectCategory.bind(this)
        this.selectAndFetchCategoryByParentId = this.selectAndFetchCategoryByParentId.bind(this)
        this.getCateId = this.getCateId.bind(this)
        this.getCategories = this.getCategories.bind(this)
        this.getDefaultSelected = this.getDefaultSelected.bind(this);
    }

    getCateId() {
        for (let i = 0; i <= 2; i++ ) {
            if (this.state.selectedLvl[i] === -1) {
                return this.state.selectedLvl[i-1]
            }
        }
        return this.state.selectedLvl[2]
    }

    getCategories() {
        let lsPromise = []
        let sTemp = this.state.selectedLvl
        for (let i = 0; i <= 2; i++ ) {
            if (sTemp[i] !== -1) {
                lsPromise.push(CategoryService.getOneById(sTemp[i]))
            }
        }

        return new Promise( (resolve, reject) => {
            Promise.all(lsPromise)
                .then( values => {
                    let retArr = []
                    for (let item of values) {
                        retArr.push( this.formatCategoryData(item))
                    }
                    resolve(retArr)
                },
                    reject)
        })
    }

    async componentDidMount() {
        this._isMounted = true



        if (this.props.defaultCateId) {
            this.setState({
                loading: true
            })
            await this.getDefaultSelected()
            this.setState({
                loading: false
            })
        } else {
            this.selectAndFetchCategoryByParentId(0)
        }
    }

    componentWillUnmount() {
        this._isMounted = false
    }

    formatCategoryData(item) {
        return {
            id: null,
            level: item.termLevel + 1,
            cateId: item.id
        }
    }


    async getDefaultSelected() {
        let selected = [-1, -1, -1]
        const defaultCateId = this.props.defaultCateId
        let termLevel, parentId = defaultCateId
        do {
            let cateRes = await CategoryService.getOneById(parentId)
            termLevel = cateRes.termLevel
            parentId = cateRes.parentId
            selected[termLevel] = cateRes.id
        } while (parentId)

        let categoryArr = this.state.categoryArr
        for (const [idx, termId] of selected.entries()) {
            if (termId === -1) break
            let cateRes
            if (idx === 0) {
                cateRes = await CategoryService.getCategoryByLevel(0)
            } else {
                cateRes = await CategoryService.getChildByParentId(selected[idx-1])
            }
            categoryArr[idx] = cateRes

        }

        this.setState({
            categoryArr,
            selectedLvl: selected
        })
    }



    selectCategory(categoryId, level, cb) {
        let selectedTemp = this.state.selectedLvl;
        selectedTemp[level] = categoryId
        this.setState( {
            selectedLvl: selectedTemp
        }, () => {
            this.selectAndFetchCategoryByParentId(level, categoryId)
        })
    }

    selectAndFetchCategoryByParentId(parentLevel, parentId = null) {
        if (parentLevel >= 2) return
        if (parentId) {
            CategoryService.getChildByParentId(parentId)
                .then( result => {
                        if (this._isMounted ) {
                            if (result.length > 0) {
                                let level = result[0].termLevel
                                let cTemp = this.state.categoryArr
                                let sTemp = this.state.selectedLvl
                                cTemp[level] = result
                                sTemp[level] = result[0].id
                                this.setState(  {
                                    categoryArr: cTemp,
                                    selectedLvl: sTemp
                                } )
                                this.selectAndFetchCategoryByParentId(level, sTemp[level])
                            } else {
                                if (result.length === 0) {
                                    let cTemp = this.state.categoryArr
                                    let sTemp = this.state.selectedLvl
                                    cTemp[parentLevel+1] = []
                                    sTemp[parentLevel+1] = -1
                                    this.setState(  {
                                        categoryArr: cTemp,
                                        selectedLvl: sTemp
                                    } )
                                    this.selectAndFetchCategoryByParentId(parentLevel + 1, -1)
                                }
                            }

                        }
                },
                    () =>  null)
        } else {
            CategoryService.getCategoryByLevel(0)
                .then( result => {
                    if (this._isMounted) {
                        let cTemp = this.state.categoryArr
                        let sTemp = this.state.selectedLvl
                        cTemp[0] = result
                        sTemp[0] = result[0].id
                        this.setState(  {
                            categoryArr: cTemp,
                            selectedLvl: sTemp
                        } )
                        this.selectAndFetchCategoryByParentId(0, sTemp[0])
                    }
                })
        }
    }

    render() {
        const displayName = (item) => {
            if (item.metadata) {
                if ( item.metadata['displayName.web.vi']) {
                    return item.metadata['displayName.web.vi']
                } else {
                    if (item.metadata['displayName.vi']) {
                        return item.metadata['displayName.vi']
                    } else {
                        return item.displayName
                    }
                }
            }
        }


        return(
            <div className="row m-0">
                {!this.state.loading && this.state.categoryArr.map( (itemSelector, index) => {
                    return (
                        <div className={"col-lg-4 col-md-4 col-sm-12 p-1"} key={index}>
                            { itemSelector.length > 0 &&
                            <select className="form-control"
                                    value={this.state.selectedLvl[index]}
                                    onChange={ (e) => {this.selectCategory(e.currentTarget.value, index)}}>
                                {itemSelector.map( (item, index) =>
                                    <option key={item.id} value={item.id}>
                                        {displayName(item)}
                                    </option>
                                )}
                            </select>
                            }
                        </div>
                    )
                })}
                {this.state.loading && <div className="text-center w-100"><Loading style={LoadingStyle.DUAL_RING_GREY}/></div> }
            </div>
        )
    }
}
