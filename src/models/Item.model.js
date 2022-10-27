/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 18/05/2020
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
/**
 * @type {{
 *     id: number,
 *     createdDate: string,
 *     lastModifiedDate: string,
 *     name: string,
 *     currency: string,
 *     description: string
 *     cateId: number
 *     categories: [
 *         {
 *             id: number,
 *             cateId: number,
 *             level: number,
 *             itemId: number
 *         }
 *     ],
 *     author: {
 *         userId: number,
 *         displayName: string,
 *         avatarImage: ImageModel
 *         type: string,
 *         city: string,
 *         rate: number,
 *         hideChat: boolean,
 *     },
 *     itemType: string,
 *     orgPrice: number,
 *     discount: number,
 *     newPrice: number,
 *     bcoin: number,
 *     commissionPercent: number,
 *     commissionAmount: number,
 *     hasCommission: boolean,
 *     totalItem: number,
 *     soldItem: number,
 *     totalSoldItem: number,
 *     images: [{Object}]
 *     shippingInfo: {
 *         id: number,
 *         weight: number,
 *         width: number,
 *         height: number,
 *         length: number,
 *         itemId: number,
 *         freeShippingV2: {
 *             enable: boolean
 *         },
 *         deliveryProviders: [
 *             {
 *                 storeId: number,
 *                 providerName: string,
 *                 allowedLocations: [{string}]
 *             }
 *         ]
 *
 *     },
 *     deleted: boolean,
 *     models: [
 *         {
 *             id: number,
 *             name: string,
 *             sku: string,
 *             orgPrice: number,
 *             discount: number,
 *             newPrice: number,
 *             totalItem: number,
 *             soldItem: number,
 *             quantityChangedDate: string,
 *             commissionPercent: string,
 *             commissionAmount: string,
 *             itemId: string,
 *             label: string,
 *             orgName: string,
 *             description: string,
 *             barcode: string,
 *             versionName: string,
 *             useProductDescription: boolean,
 *             newStock: number
 *             lstInventory: [
 *                 BranchInventoryModel
 *             ]
 *         }
 *     ],
 *     hasModel: boolean,
 *     parentSku: string,
 *     isSelfDelivery: boolean,
 *     priority: number,
 *     showOutOfStock: boolean
 *      lstInventory: [
 *                 BranchInventoryModel
 *             ]
 * }}
 */
export const ItemModel = {}
