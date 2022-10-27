export const AffiliateConstant = {
    STATUS: {
        PENDING: 'PENDING',
        ACTIVATED: 'ACTIVATED',
        DEACTIVATED: 'DEACTIVATED',
        REJECTED: 'REJECTED'
    },

    PARTNER_TYPE: {
        RESELLER: 'RESELLER',
        DROP_SHIP: 'DROP_SHIP'
    },

    COMMISSION_TYPE: {
        All_PRODUCT: 'ALL_PRODUCTS',
        SPECIFIC_PRODUCT: 'SPECIFIC_PRODUCTS',
        SPECIFIC_COLLECTION: 'SPECIFIC_COLLECTIONS'
    },
    ORDER: {
        APPROVE_STATUS: {
            PENDING: 'PENDING',
            APPROVED: 'APPROVED',
            REJECTED: 'REJECTED'
        },
        PAYMENT: {
            PAID: 'PAID',
            UNPAID: 'UNPAID',
            PARTIAL: 'PARTIAL'
        },
        PARTNER_STATUS: {
            ACTIVATED: 'ACTIVATED',
            DEACTIVATED: 'DEACTIVATED'
        }
    },
    AUTO_APPROVE_ORDER_TYPE: {
       ALL_ORDERS: 'ALL_ORDERS',
       DELIVERED_ORDERS: 'DELIVERED_ORDERS',
    }
}