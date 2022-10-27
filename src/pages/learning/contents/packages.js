export const PACKAGES_ID = {
    TIER: "TIER",
    WEB: "WEB",
    WEB_PRODUCT: "WEB_PRODUCT",
    WEB_PRODUCT_SERVICE: "WEB_PRODUCT_SERVICE",
    APP: "APP",
    APP_PRODUCT: "APP_PRODUCT",
    APP_PRODUCT_SERVICE: "APP_PRODUCT_SERVICE",
    INSTORE: "INSTORE",
}

export const PACKAGES_LIST = [
    {
    //     package_id: PACKAGES_ID.TIER,
    //     package_name_code: "package_tier",
    // },{
        package_id: PACKAGES_ID.WEB,
        package_name_code: "package_web",
        sub_packages: true
    },{
        package_id: PACKAGES_ID.WEB_PRODUCT,
        package_name_code: "package_web_product",
        package_parent_id: PACKAGES_ID.WEB
    },{
        package_id: PACKAGES_ID.WEB_PRODUCT_SERVICE,
        package_name_code: "package_web_product_service",
        package_parent_id: PACKAGES_ID.WEB
    } ,{
        package_id: PACKAGES_ID.APP,
        package_name_code: "package_app",
        sub_packages: true
    },{
        package_id: PACKAGES_ID.APP_PRODUCT,
        package_name_code: "package_app_product",
        package_parent_id: PACKAGES_ID.APP
    },{
        package_id: PACKAGES_ID.APP_PRODUCT_SERVICE,
        package_name_code: "package_app_product_service",
        package_parent_id: PACKAGES_ID.APP
    },{
        package_id: PACKAGES_ID.INSTORE,
        package_name_code: "package_instore"
    }
]