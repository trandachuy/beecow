
import PropTypes from "prop-types";

export default class TikiShopModel {
    bcStoreId;
    id;
    images;
    shopId;
    shopName;
    status;

    constructor(bcStoreId, id, images, shopId, shopName, status) {
        this.bcStoreId = bcStoreId;
        this.id = id;
        this.images = images;
        this.shopId = shopId;
        this.shopName = shopName;
        this.status = status;
    }
}

TikiShopModel.propTypes = {
    bcStoreId: PropTypes.number,
    id:        PropTypes.number,
    images:    PropTypes.string,
    shopId:    PropTypes.number,
    shopName:  PropTypes.string,
    status:    PropTypes.string
};