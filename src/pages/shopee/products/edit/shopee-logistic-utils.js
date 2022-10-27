import Constants from "../../../../config/Constant";

/**
 * Base on
 * {
               "id":1,
               "name":"0-0.5kg",
               "defaultPrice":9000
            },
 {
               "id":2,
               "name":"0.5-1.0kg",
               "defaultPrice":9000
            },
 {
               "id":3,
               "name":"1.0-2.0kg",
               "defaultPrice":9000
            },
 {
               "id":4,
               "name":"2.0-5.0kg",
               "defaultPrice":34000
            },
 {
               "id":5,
               "name":"5.0-10.0kg",
               "defaultPrice":84000
            },
 {
               "id":6,
               "name":"10.0-20.0kg",
               "defaultPrice":189000
            }
 */
const getVNPostSizes = (shippingInfo) => {
    const wMilestones = [0.5, 1, 2, 5, 10, 20]
    const weightInKg = shippingInfo.weight / 1000
    for (const [wMilestone, index] of Object.entries(wMilestones)) {
        if (weightInKg > wMilestone) {
            continue
        }
        return [index+1]
    }
    return []
}

const getLogisticSizes = (logistic, shippingInfo) => {
    switch (logistic.id) {
        case Constants.LogisticCode.Shopee.VNPOST:
            return getVNPostSizes(shippingInfo)
        default:
            return []
    }
}



export const ShopeeLogisticUtils = {
    getLogisticSizes
}
