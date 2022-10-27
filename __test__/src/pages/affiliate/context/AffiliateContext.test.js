import React from 'react'
import {cleanup} from "@testing-library/react";
import {AffiliateContext} from "../../../../../src/pages/affiliate/context/AffiliateContext";

const DROPSHIP_PACKAGE = {
    activedAt: "2022-01-07T07:03:59.026Z",
    contractId: "fafaafaf",
    createdBy: "tien.dao62@yopmail.com",
    createdDate: "2021-12-23T03:09:33.850Z",
    id: 28355,
    lastModifiedBy: "editor@mediastep.com",
    lastModifiedDate: "2022-01-07T07:03:59.038Z",
    note: "faafafaf",
    numberOfMonth: 12,
    numberOfService: 50,
    paid: true,
    paymentMethod: "COD",
    qcMark: false,
    servicePriceId: 7,
    status: "APPROVE",
    storeId: 9805,
    totalAmount: 3300000,
    type: "RENEW",
    userId: 6880
}
const RESELLER_PACKAGE = {
    activedAt: "2022-01-12T10:06:57.699Z",
    contractId: "123",
    createdBy: "tien.dao62@yopmail.com",
    createdDate: "2022-01-12T10:00:48.891Z",
    id: 28951,
    lastModifiedBy: "editor@mediastep.com",
    lastModifiedDate: "2022-01-12T10:06:57.729Z",
    note: "",
    numberOfMonth: 12,
    numberOfService: 52,
    paid: true,
    paymentMethod: "COD",
    qcMark: false,
    servicePriceId: 6,
    status: "APPROVE",
    storeId: 9805,
    totalAmount: 201146301,
    type: "UPGRADE",
    userId: 6880
}

afterEach(cleanup)

describe('test the reducer and action', () => {
    it('should return the initial state', () => {
        expect(AffiliateContext.initState).toEqual({
            isDropShipActive: undefined,
            isResellerActive: undefined,
            isDropShipExpired: undefined,
            isResellerExpired: undefined,
            dropShipPackage: undefined,
            resellerPackage: undefined,
        })
    })

    it('should set dropship expired from false to true', () => {
        expect(AffiliateContext.reducer(AffiliateContext.initState, AffiliateContext.actions.setDropShipExpired(true))).toEqual({
            isDropShipExpired: true
        })
    })

    it('should set reseller expired from false to true', () => {
        expect(AffiliateContext.reducer(AffiliateContext.initState, AffiliateContext.actions.setResellerExpired(true))).toEqual({
            isResellerExpired: true
        })
    })

    it('should set dropship active from false to true', () => {
        expect(AffiliateContext.reducer(AffiliateContext.initState, AffiliateContext.actions.setDropShipActive(true))).toEqual({
            isDropShipActive: true
        })
    })

    it('should set reseller active from false to true', () => {
        expect(AffiliateContext.reducer(AffiliateContext.initState, AffiliateContext.actions.setResellerActive(true))).toEqual({
            isResellerActive: true
        })
    })

    it('should set dropship package properly', () => {
        expect(AffiliateContext.reducer(AffiliateContext.initState, AffiliateContext.actions.setDropShipPackage(DROPSHIP_PACKAGE))).toEqual({
            dropShipPackage: DROPSHIP_PACKAGE
        })
    })

    it('should set reseller package properly', () => {
        expect(AffiliateContext.reducer(AffiliateContext.initState, AffiliateContext.actions.setResellerPackage(RESELLER_PACKAGE))).toEqual({
            resellerPackage: RESELLER_PACKAGE
        })
    })
})