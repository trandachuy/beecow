import _ from 'lodash';
import {ImageUtils} from "../../../../../src/utils/image.js";
import {ItemService} from "../../../../services/ItemService.js";
import shopeeService from "../../../../services/ShopeeService.js";
import {CredentialUtils} from "../../../../utils/credential";
import {GSToast} from "../../../../utils/gs-toast.js";
import i18next from "i18next";
import {AgencyService} from "../../../../services/AgencyService";

function VariationMapping() {

  function handleMapGSItemToSPItem(bcItem, shopeeItem, isManual = false, stShopeeProducts, setStShopeeProducts, setIsVariationMismatched, mapVariations) {
    let linkShopeeItemVM = {
      bcItemId: bcItem.id,
      itemId: shopeeItem.id,
      shopeeShopId: shopeeItem.shopeeShopId,
      branchId: shopeeItem.branchId,
      bcStoreId: CredentialUtils.getStoreId(),
    };

    if (bcItem.hasModel && shopeeItem.hasVariation) {
      ItemService.getGsVariationByBcItemId(bcItem.id)
        .then(bcModels => {
          const hasDeposit = bcModels.find(model => model.label.includes("[d3p0s1t]"));
          if (hasDeposit) {
            throw new Error("shopee.link.no.deposit.allowed");
          }
          linkShopeeItemVM = {
            ...linkShopeeItemVM,
            bcTierVariations: bcModels[0].label.split('|'),
            shopeeTierVariations: shopeeItem.tierVariations.map(tier => tier.name),
            shopeeItemVariations: shopeeItem.variations.map(variation => ({
              id: variation.id,
              value: variation.name,
            })),
            isManual,
          };

          if (isManual === true) {
            const mappedModels = mapArrays(shopeeItem.variations, bcModels, mapVariations);
            linkShopeeItemVM = {
              ...linkShopeeItemVM,
              bcItemVariations: mappedModels.map(model => ({
                id: model.id,
                value: model.name,
              })),
            };
          }
          else {
            linkShopeeItemVM = {
              ...linkShopeeItemVM,
              bcItemVariations: bcModels.map(model => ({
                id: model.id,
                value: model.name,
              })),
            };
          }
        })
        .then(() => shopeeService.linkShopeeItemWithBcItem(linkShopeeItemVM))
        .then(() => {
          const newShopeeProducts = updateProduct(stShopeeProducts, shopeeItem, bcItem);
          setStShopeeProducts(newShopeeProducts);
        })
        .catch(e => {
          if (e === "variation.not.matching" && setIsVariationMismatched) {
            setIsVariationMismatched(true);
          }
          else if (e.message === "shopee.link.no.deposit.allowed") {
            GSToast.error(i18next.t("shopee.link.no.deposit.allowed", {provider: AgencyService.getDashboardName()}));
          }
          else if (e === "item.link.already") {
            GSToast.info(i18next.t("shopee.gosell.item.link.already", {provider: AgencyService.getDashboardName()}));
          }
          else {
            console.error(e);
            GSToast.commonError();
          }
        });
    }
    else if (!bcItem.hasModel && !shopeeItem.hasVariation) {
      shopeeService.linkShopeeItemWithBcItem(linkShopeeItemVM)
        .then(() => {
          const newShopeeProducts = updateProduct(stShopeeProducts, shopeeItem, bcItem);
          setStShopeeProducts(newShopeeProducts);
        })
        .catch(e => {
          if (e === "item.link.already") {
            GSToast.info("shopee.gosell.item.link.already", true);
          }
        });
    }
    /* TODO there was a rare case when shopee item has the flag variation = true but it has no variations
    need to handle this case */
  };

  function updateProduct (stShopeeProducts, shopeeItem, bcItem) {
    const updateShopeeProductIndex = stShopeeProducts.findIndex(prod => prod.id === shopeeItem.id);
    const newShopeeProducts = _.clone(stShopeeProducts);
    const updateProduct = newShopeeProducts[updateShopeeProductIndex];
    updateProduct.gosellStatus = "LINK";
    updateProduct.bcItemId = bcItem.id;
    updateProduct.bcItemName = bcItem.name;
    const imageModel = ImageUtils.extractImageModel(bcItem);
    updateProduct.bcItemThumbnail = ImageUtils.getImageFromImageModel(imageModel, 70);
    return newShopeeProducts;
  };

  function mapArrays (source = [], dest = [], mapper = {}) {
    const result = [];
    for (const item in mapper) {
      if (Object.hasOwnProperty.call(mapper, item)) {
        const element = mapper[item];
        const idxSrc = source.findIndex(i => i.id === Number.parseInt(item));
        const idxDst = dest.findIndex(i => i.id === element.id);
        result[idxSrc] = dest[idxDst];
      }
    }
    return result;
  };

  return {handleMapGSItemToSPItem, mapArrays};
};

export const { handleMapGSItemToSPItem, mapArrays } = VariationMapping();
