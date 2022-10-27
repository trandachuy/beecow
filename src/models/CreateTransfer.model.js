/**
 * @typedef CreateTransferModel
 * @type {{
 *
        createdBy: string,
        createdByStaffId: number,
        createdDate: string,
        destinationBranchId: number,
        id: number,
        itemTransfers: [{
            id: number,
            itemId: number,
            modelId: number,
            quantity: number
        }],
        lastModifiedBy: string,
        lastModifiedDate: string,
        note: string,
        originBranchId: number,
        status: string,
        statusAtCancel: string,
        storeId: number
 * }}
 */
export const CreateTransferModel = {}
