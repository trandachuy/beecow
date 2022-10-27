/*******************************************************************************
 * Copyright 2019 (C) Mediastep Software Inc.
 *
 * Created on : 01/10/2019
 * Author: Long Phan <long.phan@mediastep.com>
 *******************************************************************************/
import React, {useEffect, useState} from "react";
import LoyaltyFormEditor, {LoyaltyFormEditorMode} from "../LoyaltyFormEditor";
import beehiveService from "../../../../../services/BeehiveService";

const LoyaltyEdit = (props) => {

    const { mode, item, ...other } = props
    const [loyalty, setLoyalty] = useState();
    const [selectedSegment, setSelectedSegment] = useState();
    useEffect(() => {
        const { itemId } = props.match.params;
        if (!props.location.state) {
            getMembershipById(parseInt(itemId));
        }
        else {
            setLoyalty(props.location.state.data.loyalty);
            getSegmentById(props.location.state.data.loyalty.segmentId);
        }
    }, [])
    const getMembershipById = (membershipId) => {
        beehiveService.getMembershipById(membershipId).then(res => {
            setLoyalty(res);
            getSegmentById(res.segmentId)
        })
    }
    const getSegmentById = (segmentId) => {
        beehiveService.getListSegmentWithKeyword({"id.equals": segmentId }).then((res) => {
            if (res.data.length !== 0) {
                setSelectedSegment(res.data[0]);
            }
        })

    }
    return (
        <>
            {
                (item !== null && loyalty && selectedSegment) &&
                <LoyaltyFormEditor
                    mode={LoyaltyFormEditorMode.EDIT}
                    item={item}
                    loyalty={loyalty}
                    selectedSegment={selectedSegment}
                    {...other} />
            }
        </>
    )
}
export default LoyaltyEdit;
