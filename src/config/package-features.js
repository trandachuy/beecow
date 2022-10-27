/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 11/02/2020
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/

export const PACKAGE_FEATURE_CODES = {
    FEATURE_0100: "0100", // Home
    FEATURE_0101: "0101", // Dashboard Analytics
    FEATURE_0102: "0102", // Add / Import Product
    FEATURE_0103: "0103", // Add Domain
    FEATURE_0104: "0104", // Add Bank Account
    FEATURE_0105: "0105", // Customize Appearance
    FEATURE_0106: "0106", // Live Chat[Facebook chat]
    FEATURE_0107: "0107", // Products
    FEATURE_0108: "0108", // All Products
    FEATURE_0109: "0109", // Deposit Product
    FEATURE_0110: "0110", // All Services
    FEATURE_0111: "0111", // Collections
    FEATURE_0112: "0112", // Reviews
    FEATURE_0113: "0113", // Orders
    FEATURE_0114: "0114", // Create New Order
    FEATURE_0115: "0115", // Export Order
    FEATURE_0116: "0116", // Access Reservation
    FEATURE_0117: "0117", // Discount
    FEATURE_0118: "0118", // Coupon Code
    FEATURE_0119: "0119", // Platforms
    FEATURE_0120: "0120", // Web, App, In-store
    FEATURE_0121: "0121", // Web Only
    FEATURE_0122: "0122", // App Only
    FEATURE_0123: "0123", // In-store
    FEATURE_0124: "0124", // Wholesale Pricing
    FEATURE_0125: "0125", // Applies To
    FEATURE_0126: "0126", // All Products
    FEATURE_0127: "0127", // Specific Collections
    FEATURE_0128: "0128", // Specific Products
    FEATURE_0129: "0129", // Customer
    FEATURE_0130: "0130", // All Customers
    FEATURE_0131: "0131", // Import Customer Data
    FEATURE_0132: "0132", // Export Customer Data
    FEATURE_0133: "0133", // Segments
    FEATURE_0134: "0134", // Create Segment
    FEATURE_0135: "0135", // Condition
    FEATURE_0136: "0136", // Customers Data
    FEATURE_0137: "0137", // Registration Date
    FEATURE_0138: "0138", // is
    FEATURE_0139: "0139", // is before
    FEATURE_0140: "0140", // is after
    FEATURE_0141: "0141", // Customer Tag
    FEATURE_0142: "0142", // is equal to
    FEATURE_0143: "0143", // Installed app
    FEATURE_0144: "0144", // is equal to None
    FEATURE_0145: "0145", // is equal to Android
    FEATURE_0146: "0146", // is equal to iOS
    FEATURE_0147: "0147", // Order Data
    FEATURE_0148: "0148", // Order Delivered
    FEATURE_0149: "0149", // in
    FEATURE_0150: "0150", // not in
    FEATURE_0151: "0151", // Total Order Count
    FEATURE_0152: "0152", // is equal to
    FEATURE_0153: "0153", // is greater than
    FEATURE_0154: "0154", // is less than
    FEATURE_0155: "0155", // Total Purchase Amount
    FEATURE_0156: "0156", // is equal to
    FEATURE_0157: "0157", // is greater than
    FEATURE_0158: "0158", // is less than
    FEATURE_0159: "0159", // Analytics
    FEATURE_0160: "0160", // Orders
    FEATURE_0161: "0161", // Reservations in Analytics
    FEATURE_0162: "0162", // Marketing
    FEATURE_0163: "0163", // Notifications
    FEATURE_0164: "0164", // Create Campaign
    FEATURE_0165: "0165", // Email
    FEATURE_0166: "0166", // Push
    FEATURE_0167: "0167", // Loyalty Program
    FEATURE_0168: "0168", // Customers Data
    FEATURE_0169: "0169", //
    FEATURE_0170: "0170", // Registration Date
    FEATURE_0171: "0171", // is
    FEATURE_0172: "0172", // is before
    FEATURE_0173: "0173", // is after
    FEATURE_0174: "0174", // Installed app
    FEATURE_0175: "0175", // is equal to None
    FEATURE_0176: "0176", // is equal to Android
    FEATURE_0177: "0177", // is equal to iOS
    FEATURE_0178: "0178", // Order Delivered
    FEATURE_0179: "0179", // in
    FEATURE_0180: "0180", // not in
    FEATURE_0181: "0181", // Sales Channel
    FEATURE_0182: "0182", // Online Shop
    FEATURE_0183: "0183", // Customization
    FEATURE_0184: "0184", // Milk Tea
    FEATURE_0185: "0185", // Color
    FEATURE_0186: "0186", // Logo & Favicon
    FEATURE_0187: "0187", // Logo
    FEATURE_0188: "0188", // Favicon
    FEATURE_0189: "0189", // App Logo
    FEATURE_0190: "0190", // Danh Mục (Web)
    FEATURE_0191: "0191", // Banner
    FEATURE_0192: "0192", // Khuyến Mãi
    FEATURE_0193: "0193", // Danh Mục (App)
    FEATURE_0194: "0194", // Giới Thiệu
    FEATURE_0195: "0195", // Banner (Web)
    FEATURE_0196: "0196", // Sản Phẩm Mới
    FEATURE_0197: "0197", // Sản Phẩm
    FEATURE_0198: "0198", // Các Món Khác
    FEATURE_0199: "0199", // Sản Phẩm
    FEATURE_0200: "0200", // Cosmetic
    FEATURE_0201: "0201", // Color
    FEATURE_0202: "0202", // Logo & Favicon
    FEATURE_0203: "0203", // Logo
    FEATURE_0204: "0204", // Favicon
    FEATURE_0205: "0205", // App Logo
    FEATURE_0206: "0206", // Danh Mục (Web)
    FEATURE_0207: "0207", // Banner
    FEATURE_0208: "0208", // Danh Mục (App)
    FEATURE_0209: "0209", // Sản Phẩm Mới
    FEATURE_0210: "0210", // Bộ Sưu Tập
    FEATURE_0211: "0211", // Sản Phẩm Bán Chạy
    FEATURE_0212: "0212", // Giảm Giá
    FEATURE_0213: "0213", // Sản Phẩm
    FEATURE_0214: "0214", // Banner (Web)
    FEATURE_0215: "0215", // Cảm Nhận Khách Hàng
    FEATURE_0216: "0216", // Chân Trang
    FEATURE_0217: "0217", // Booking Service
    FEATURE_0218: "0218", // Color
    FEATURE_0219: "0219", // Logo & Favicon
    FEATURE_0220: "0220", // Logo
    FEATURE_0221: "0221", // Favicon
    FEATURE_0222: "0222", // App Logo
    FEATURE_0223: "0223", // Web Menu
    FEATURE_0224: "0224", // Image Slider
    FEATURE_0225: "0225", // Mobile Menu
    FEATURE_0226: "0226", // First Banner
    FEATURE_0227: "0227", // Giới Thiệu Về Chúng Tôi
    FEATURE_0228: "0228", // Dịch Vụ Của Chúng Tôi
    FEATURE_0229: "0229", // Second Banner
    FEATURE_0230: "0230", // Sản Phẩm Nổi Bật
    FEATURE_0231: "0231", // Jewelry
    FEATURE_0232: "0232", // Color
    FEATURE_0233: "0233", // Logo & Favicon
    FEATURE_0234: "0234", // Logo
    FEATURE_0235: "0235", // Favicon
    FEATURE_0236: "0236", // App Logo
    FEATURE_0237: "0237", // Danh Mục (Web)
    FEATURE_0238: "0238", // Banner
    FEATURE_0239: "0239", // Danh Mục (App)
    FEATURE_0240: "0240", // Banner (App)
    FEATURE_0241: "0241", // Trang Sức Mới
    FEATURE_0242: "0242", // Bộ Sưu Tập
    FEATURE_0243: "0243", // Product
    FEATURE_0244: "0244", // Trang Sức Cưới
    FEATURE_0245: "0245", // Product
    FEATURE_0246: "0246", // Footer
    FEATURE_0247: "0247", // Pages
    FEATURE_0248: "0248", // Upload Page Thumbnail
    FEATURE_0249: "0249", // Menus
    FEATURE_0250: "0250", // Domains
    FEATURE_0251: "0251", // Preferences
    FEATURE_0252: "0252", // Facebook Chat
    FEATURE_0253: "0253", // Facebook Pixel ID
    FEATURE_0254: "0254", // Facebook App ID
    FEATURE_0255: "0255", // Google Analytics Code
    FEATURE_0256: "0256", // Shopee
    FEATURE_0257: "0257", // Account
    FEATURE_0258: "0258", // Products
    FEATURE_0259: "0259", // Enable Shopee
    FEATURE_0260: "0260", // Lazada
    FEATURE_0261: "0261", // Account
    FEATURE_0262: "0262", // Products
    FEATURE_0263: "0263", // Enable Lazada
    FEATURE_0264: "0264", // Beecow
    FEATURE_0265: "0265", // Account
    FEATURE_0266: "0266", // Products
    FEATURE_0267: "0267", // Order
    FEATURE_0268: "0268", // Settings
    FEATURE_0269: "0269", // Account
    FEATURE_0270: "0270", // Store Information
    FEATURE_0271: "0271", // Shipping & Payment
    FEATURE_0272: "0272", // Guest Checkout
    FEATURE_0273: "0273", // Pickup Address
    FEATURE_0274: "0274", // Shipping Provider
    FEATURE_0275: "0275", // Giao Hang Tiet Kiem
    FEATURE_0276: "0276", // CONDITION_PLATFORM
    FEATURE_0277: "0277", // VNPOST
    FEATURE_0278: "0278", // Self Delivery
    FEATURE_0279: "0279", // Shipping Fee (Inside-city)
    FEATURE_0280: "0280", // Shipping Fee (Outside-city)
    FEATURE_0281: "0281", // Payment Method
    FEATURE_0282: "0282", // Local ATM card
    FEATURE_0283: "0283", // Credit/Debit card
    FEATURE_0284: "0284", // Cash on delivery
    FEATURE_0285: "0285", // Bank transfer
    FEATURE_0344: "0344", // Zalo & MoMo payment
    FEATURE_0286: "0286", // Bank & Account Information
    FEATURE_0287: "0287", // Credit History
    FEATURE_0288: "0288", // Staff Management
    FEATURE_0289: "0289", // Store information - app name
    FEATURE_0290: "0290", // Store information - address list
    FEATURE_0291: "0291", // Store information - social channels
    FEATURE_0292: "0292", // GHN
    FEATURE_0293: "0293", // Show image layout theme of web
    FEATURE_0294: "0294", // Show image layout theme of app
    FEATURE_0026: "0026", // BASIC & ADVANCED,
    FEATURE_0309: "0309", // OUT OF STOCK
    FEATURE_0310: "0310", // SEO setting
    FEATURE_0311: "0311", // Zalo chat
    FEATURE_0312: "0312", // Turn on Listing site Product/ Service
    FEATURE_0313: "0313", // Aha move
    FEATURE_0314: "0314", // Create discount code  for product
    FEATURE_0315: "0315", // Create discount code  for service
    FEATURE_0316: "0316", // create discount for Web platform
    FEATURE_0317: "0317", // create discount for App platform
    FEATURE_0318: "0318", // create discount for Instore
    FEATURE_0325: "0325", // Shopname
    FEATURE_0326: "0326",  // Store Information- HOTLINE , EMAIL
    FEATURE_0327: "0327", // Landing page analytics
    FEATURE_0328: "0328", // Landing page SEO
    FEATURE_0329: "0329", // Landing page custom domain
    FEATURE_0332: "0332", // Custom WEB Domain
    FEATURE_0333: "0333",  // Edit subdomain
    FEATURE_0334: "0334",  // Wholesale pricing for product
    FEATURE_0323: "0323",  // Wholesale pricing for service
    FEATURE_0335: "0335", // Has free package
    WEB_PACKAGE: "0336", // Has web package
    APP_PACKAGE: "0337", // Has app package
    POS_PACKAGE: "0338", // Has instore package
    SOCIAL_PACKAGE: "0345", // Has social package
    FEATURE_0339: "0339", // Has lead package
    FEATURE_0340: "0260", // TIKI
    FEATURE_0341: "0261", // Account
    FEATURE_0342: "0262", // Products
    FEATURE_0343: "0263", // Enable TIKI
    FEATURE_0353: "0353", // Google verification code
}
