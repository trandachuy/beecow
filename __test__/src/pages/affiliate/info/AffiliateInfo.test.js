import React from 'react'
import {cleanup, render} from '@testing-library/react';
import AffiliateInfo from '@pages/affiliate/info/AffiliateInfo';
import {AffiliateContext} from '@pages/affiliate/context/AffiliateContext';
import {RouteUtils} from '@utils/route'
import {NAV_PATH} from '@components/layout/navigation/Navigation'
import {act} from 'react-dom/test-utils'

const DROPSHIP_PACKAGE = {
    activedAt: '2022-01-07T07:03:59.026Z',
    contractId: 'fafaafaf',
    createdBy: 'tien.dao62@yopmail.com',
    createdDate: '2021-12-23T03:09:33.850Z',
    id: 28355,
    lastModifiedBy: 'editor@mediastep.com',
    lastModifiedDate: '2022-01-07T07:03:59.038Z',
    note: 'faafafaf',
    numberOfMonth: 12,
    numberOfService: 50,
    paid: true,
    paymentMethod: 'COD',
    qcMark: false,
    servicePriceId: 7,
    status: 'APPROVE',
    storeId: 9805,
    totalAmount: 3300000,
    type: 'RENEW',
    userId: 6880
}
const RESELLER_PACKAGE = {
    activedAt: '2022-01-12T10:06:57.699Z',
    contractId: '123',
    createdBy: 'tien.dao62@yopmail.com',
    createdDate: '2022-01-12T10:00:48.891Z',
    id: 28951,
    lastModifiedBy: 'editor@mediastep.com',
    lastModifiedDate: '2022-01-12T10:06:57.729Z',
    note: '',
    numberOfMonth: 12,
    numberOfService: 52,
    paid: true,
    paymentMethod: 'COD',
    qcMark: false,
    servicePriceId: 6,
    status: 'APPROVE',
    storeId: 9805,
    totalAmount: 201146301,
    type: 'UPGRADE',
    userId: 6880
}

afterEach(cleanup)

jest.mock('../../../../../src/services/AffiliateService', () => {
    return {
        async getPartnerSetting() {
            return
        },
        async getAllStoreAffiliatesOfStore() {
            return []
        },
        async getPartnerInformationByType() {
            return {}
        },
        async getPartnerOrderInformationByType() {
            return {}
        },
        async getPartnerCommissionInformationByType() {
            return {}
        }
    };
});

RouteUtils.redirectWithoutReload = jest.fn()

it('should redirect to intro page if dropship don\'t active', () => {
    act(() => {
        render(<AffiliateContext.provider value={{
            state: {
                ...AffiliateContext.initState,
                isDropShipActive: false,
                isResellerActive: false,
            }
        }}>
            <AffiliateInfo/>
        </AffiliateContext.provider>)
    })

    expect(RouteUtils.redirectWithoutReload).toBeCalledWith(expect.anything(), NAV_PATH.affiliateIntro)
})