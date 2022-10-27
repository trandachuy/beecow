import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import i18next from "i18next";
import _ from 'lodash';
import {PropTypes} from "prop-types";
import React, {useState} from 'react';
import {UikInput} from "../../../@uik";
import {ItemService} from "../../../services/ItemService";
import {GSToast} from "../../../utils/gs-toast.js";
import useDebounceEffect from "../../../utils/hooks/useDebounceEffect.js";
import {ImageUtils} from "../../../utils/image.js";
import './LinkProductSearchBox.sass';
import {handleMapGSItemToSPItem} from "./SearchProduct/VariationMapping.js";
import Loading, {LoadingStyle} from "../../../components/shared/Loading/Loading";
import GSTrans from "../../../components/shared/GSTrans/GSTrans";
import GSComponentTooltip, {GSComponentTooltipPlacement} from "../../../components/shared/GSComponentTooltip/GSComponentTooltip";

const MAX_PAGE_SIZE = 20

export default function LinkProductSearchBox(props) {
    const { shopeeItem, setIsVariationMismatched, setSelectedBcItem, onClick, stShopeeProducts, setStShopeeProducts } = props;
    const { bcItemName, variations, gosellStatus } = shopeeItem;
    const isLinked = gosellStatus === "LINK";

    const [stSearchItems, setStSearchItems] = useState([]);
    const [stToggle, setStToggle] = useState(false);
    const [stInput, setStInput] = useState(isLinked ? bcItemName : "");
    const [stVariationNum] = useState(_.isArray(variations) ? variations.length : 0);
    const [stIsFetching, setStIsFetching] = useState(false);
    const [stPaging, setStPaging] = useState({
        page: 0,
        size: MAX_PAGE_SIZE,
    })
    const [stIsOutOfItem, setStIsOutOfItem] = useState(false)

    useDebounceEffect(() => fetchItemCanLinkShopee(true), 500, [stInput.trim(), stVariationNum]);

    function fetchItemCanLinkShopee(isReset) {
        if (!stInput.trim().length || stVariationNum == null) {
            setStSearchItems([])

            return
        }

        setStIsFetching(true)

        let fetchPage = stPaging.page

        if (isReset) {
            fetchPage = 0
            setStIsOutOfItem(false)
            setStSearchItems([])
            setStPaging(paging => ({
                ...paging,
                page: 0,
            }))
        }

        ItemService.searchItemCanLinkToShopeeItem(stInput, stVariationNum, {
            page: fetchPage,
            size: stPaging.size,
        })
            .then(result => {
                if (_.isEmpty(result)) {
                    setStIsOutOfItem(true)
                    return
                }

                setStPaging(paging => ({
                    ...paging,
                    page: paging.page + 1,
                }))
                setStSearchItems(items => [...items, ...result])
            })
            .catch(_e => GSToast.commonError())
            .finally(() => setStIsFetching(false))
    }

    const isBottom = (el) => {
        let afterCal = Math.floor(el.scrollHeight - el.scrollTop);
        return afterCal <= el.clientHeight;
    }

    const handleOnScroll = (e) => {
        if (isBottom(e.currentTarget) && !stIsFetching && !stIsOutOfItem) {
            fetchItemCanLinkShopee()
        }
    }

    return (
        <div className='link-product-search-box'>
            <UikInput
                onClick={() => {
                    setStToggle(true)
                    onClick()
                }}
                onChange={(e) => {
                    setStInput(e.currentTarget.value);
                }}
                icon={(
                    <FontAwesomeIcon icon="search"/>
                )}
                placeholder={i18next.t("page.shopeeProduct.management.search.placeholder")}
                maxLength={150}
                disabled={isLinked}
                value={stInput}
            />
            {
                stToggle &&
                <div className='search-box-dropdown' onScroll={handleOnScroll}>
                    <>
                        {
                            !stSearchItems.length && !!stInput.length && !stIsFetching &&
                            <div className='item'>
                                <GSTrans t='component.linkProductSearchBox.noItemFound'></GSTrans>
                            </div>
                        }
                        {
                            stSearchItems.map(bcItem => {
                                const imageModel = ImageUtils.extractImageModel(bcItem);
                                return (
                                   <>
                                       {bcItem.inventoryManageType === 'PRODUCT' ?
                                           <div
                                               key={bcItem.id}
                                               className='item d-flex flex-row align-items-center'
                                               onMouseDown={() => {
                                                   setSelectedBcItem(bcItem)
                                                   handleMapGSItemToSPItem(bcItem, shopeeItem, false, stShopeeProducts, setStShopeeProducts, setIsVariationMismatched)
                                               }}
                                           >
                                               <img width={30} height={30} className="mr-2"
                                                    src={ImageUtils.getImageFromImageModel(imageModel, 30)}/>
                                               <p>{bcItem.name}</p>
                                           </div>:

                                           <GSComponentTooltip html={<GSTrans t="page.shopee.linkProduct.not.allow.sync"/>}
                                                               placement={GSComponentTooltipPlacement.TOP}>
                                               <div
                                                   key={bcItem.id}
                                                   className='item d-flex flex-row align-items-center'
                                                   style={{cursor:'no-drop'}}
                                               >
                                                   <img width={30} height={30} className="mr-2"
                                                        src={ImageUtils.getImageFromImageModel(imageModel, 30)}/>
                                                   <p>{bcItem.name}</p>
                                               </div>
                                           </GSComponentTooltip>
                                       }
                                   </>
                                );
                            })
                        }
                    </>
                    {stIsFetching && <Loading className='mt-2 mb-2' style={LoadingStyle.DUAL_RING_GREY}/>}
                </div>
            }
        </div>
    );
}

LinkProductSearchBox.propTypes = {
    shopeeItem: PropTypes.object,
    setIsVariationMismatched: PropTypes.func,
    setSelectedBcItem: PropTypes.func,
    onClick: PropTypes.func,
    setShopeeProductsUpdate: PropTypes.func,
};
