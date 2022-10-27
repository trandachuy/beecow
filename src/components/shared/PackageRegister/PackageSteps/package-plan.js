/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 13/02/2020
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import Constants from "../../../../config/Constant";

const featureGroup = [
    {
        "groupName":{
            "en":"E-Commerce Sales Management",
            "vi":"Quản Lý Bán Hàng Thương Mại Điện Tử"
        },
        "features":[
            {
                "content":{
                    "en":"E-Commerce Website (Online Web Shop)",
                    "vi":"Website Bán Hàng TMĐT (Website Cửa Hàng)"
                },
                "tips":{
                    "en":"E-Commerce Website with customizable theme builder and full integration of shipping and payment methods + Free Hosting + Free Sub Domain (Option to add your Own Domain)",
                    "vi":"Website TMĐT với công cụ tùy chỉnh giao diện cùng bộ tích hợp vận chuyển và phương pháp thanh toán + Miễn phí Hosting + Miễn phí tên miền phụ (có thể tự thêm tên miền riêng của bạn)"
                },
                "plans":[
                    6

                ]
            },
            {
                "content":{
                    "en":"E-Commerce App (Online App Shop - iOS, Android)",
                    "vi":"App Bán Hàng TMĐT (App Cửa Hàng trên iOS, Android)"
                },
                "tips":{
                    "en":"Custom App With Customizable Theme builder Supporting Ecommerce Features With Full Integration Of Shipping and Payment Methods",
                    "vi":"App bán hàng với công cụ tùy chỉnh giao diện cùng bộ tích hợp vận chuyển và phương thức thanh toán"
                },
                "plans":[
                    7
                ]
            },
            {
                "content":{
                    "en":"Integrated Logistics with shipping providers",
                    "vi":"Tích hợp Vận Chuyển với các đơn vị vận chuyển"
                },
                "tips":{
                    "en":"Giao Hang Nhanh, AhaMove, Giao Hang Tiet Kiem, VNPOST",
                    "vi":"Giao Hàng Nhanh, AhaMove, Giao Hàng Tiết Kiệm, VNPOST"
                },
                "plans":[
                    5,
                    6,
                    7
                ]
            },
            {
                "content":{
                    "en":"Integrated Online Payments and COD",
                    "vi":"Tích hợp Thanh toán Online và COD"
                },
                "tips":{
                    "en":"Zalopay, Credit Card, Debit Card VISA / MASTERCARD, ATM <br/> Bank Transfers, Cash,  COD (Cash on Delivery )",
                    "vi":"Zalopay, Thẻ tín dụng, thẻ VISA/MASTERCARD, thẻ ATM, chuyển khoản ngân hàng, tiền mặt, COD (nhận tiền khi giao hàng)"
                },
                "plans":[
                    5,
                    6,
                    7
                ]
            },
            {
                "content":{
                    "en":"Centralized Multibranch Inventory Management",
                    "vi":"Quản lý tập trung Kho hàng đa chi nhánh"
                },
                "tips":{
                    "en":"Configure and manage stock across multiple branch inventories of your online and physical shops . Add unique products stock and SKU values for each branch and check its inventory or inventory history. Centralized management detects and updates specific inventory depending on which branch the order was made at.",
                    "vi":"Thiết lập cấu hình và quản lý hàng tồn kho của nhiều chi nhánh tại cửa hàng online và offline. Thêm giá trị kho hàng và mã SKU riêng biệt cho từng chi nhánh, và kiểm tra tồn kho và lịch sử tồn kho. Quản lý tập trung phát hiện và cập nhật số lượng hàng tồn kho khi bất kỳ chi nhánh nào có đơn hàng."
                },
                "plans":[
                    5,
                    6,
                    7,
                    8,
                    10
                ]
            },
            {
                "content":{
                    "en":"GOPOS - POS system",
                    "vi":"GoPOS - Hệ thống POS"
                },
                "tips":{
                    "en":"An integrated O2O POS allowing Create orders , Apply promotion, Manage product list, Manage synchronised online and offline customer data,  Add existing or create new customers  , Add delivery information ,Order receipt printing",
                    "vi":"Hệ thống POS tích hợp O2O cho phép tạo đơn hàng, áp dụng mã giảm giá, quản lý danh sách sản phẩm, quản lý danh sách khách hàng đồng bộ online và offline, thêm khách hàng, thêm thông tin giao hàng, in hóa đơn. "
                },
                "plans":[
                    8
                ]
            },
            {
                "content":{
                    "en":"{{providerSeller}} App - Mobile GOPOS",
                    "vi":"Ứng Dụng {{providerSeller}} - GoPOS trên điện thoại"
                },
                "tips":{
                    "en":"An integrated O2O POS System allowing to Create multiple orders at once, Apply promotion, Manage product list, Add customer to order and manage customer data from your online and offline channels simultaneously, Print order receipts (Applicable for SUNMI V2 devices only) ",
                    "vi":"Tích hợp hệ thống bán hàng Online, Offline giúp bạn thao tác Tạo đơn hàng, Áp dụng khuyến mãi, Quản lý danh sách sản phẩm, Xử lý Đơn Hàng, Đặt Chỗ dễ dàng, tiện lợi hơn tại cửa hàng và quản lý Đặt Chỗ dễ dàng"
                },
                "plans":[
                    8
                ]
            },
            {
                "content":{
                    "en":"Offline payment methods in GoPOS",
                    "vi":"Phương Thức Thanh Toán Mua Hàng Tại Shop Offline khi sử dụng GoPOS"
                },
                "tips":{
                    "en":"Cash, Bank Transfers, Mobile payment terminal",
                    "vi":"Tiền mặt, Chuyển khoản, Thiết bị thanh toán di động"
                },
                "plans":[
                    8
                ]
            },
            {
                "content":{
                    "en":"Mobile payment terminal",
                    "vi":"Thiết bị thanh toán di động"
                },
                "tips":{
                    "en":"Accept Credit card VISA / MASTERCARD, or ATM for instore payments",
                    "vi":"Chấp nhận thanh toán mua hàng bằng hình thức quẹt thẻ tín dụng VISA / MASTERCARD, hoặc thẻ ATM"
                },
                "plans":[
                    8
                ]
            },
            {
                "content":{
                    "en":"{{providerSeller}} App - Manage order list, process orders in App",
                    "vi":"Ứng Dụng {{providerSeller}} - Quản lý danh sách đơn hàng, xử lý đơn hàng trên App"
                },
                "tips":{
                    "en":"Manage Orders from {{providerName}}(Website, Mobile App, Instore), Marketplaces (Lazada ,Shopee, GoMUA) <br/> Receive push and an in-app notification whenever a new order is created and process orders in the app",
                    "vi":"Quản lý các đơn hàng đến từ kênh bán hàng {{providerName}} (Website, App Bán Hàng, Mua tại cửa hàng), Sàn TMĐT (Lazada, Shopee, GoMUA) <br/> Nhận thông báo nhanh chóng khi có đơn hàng mới, xử lý đơn hàng ngay trên app"
                },
                "plans":[
                    5,
                    6,
                    7,
                    10
                ]
            },
            {
                "content":{
                    "en":"{{providerSeller}} App - Create livestream to Buyers App",
                    "vi":"Ứng Dụng {{providerSeller}} - Livestream trên App Bán Hàng"
                },
                "tips":{
                    "en":"Create livestream and stream video with chat option. Customers can place orders directly in the livestream of your buyers App",
                    "vi":"Phát trực tiếp trên App Bán Hàng với tính năng nhắn tin, đặt hàng trực tiếp trên livestream"
                },
                "plans":[
                    7

                ]
            },
            {
                "content":{
                    "en":"{{providerSeller}} App - Reservation Management",
                    "vi":"Ứng Dụng {{providerSeller}} - Quản lý danh sách đặt chỗ, xử lý đặt chỗ trên App"
                },
                "tips":{
                    "en":"Manage Reservations from Website / Mobile App <br/>Receive push and in-app notification whenever the new reservaton is created and requires action <br/>Scan Reservation barcode to quickly view reservation details",
                    "vi":"Quản lý các lịch đặt chỗ đến từ kênh {{providerName}} (Website, App Bán Hàng) <br/>Nhận thông báo nhanh chóng khi có đặt chỗ mới, xử lý đặt dịch vụ ngay trên app<br/>Quét Mã Đặt Chỗ để xem thông tin đặt chỗ chi tiết nhanh chóng"
                },
                "plans":[
                    5,
                    6,
                    7
                ]
            },
            {
                "content":{
                    "en":"Orders Management",
                    "vi":"Quản Lý Đơn Hàng"
                },
                "tips":{
                    "en":"Manage online and offline orders from sale channels centralized at {{providerName}} (Website, Mobile App, Instore) and Marketplaces ( GoMUA, Lazada, Shopee).<br/>Print order and shipping label",
                    "vi":"Quản lý đơn hàng Online, Offline từ nhiều kênh bán hàng về {{providerName}} (Website, App Bán Hàng, Tại Cửa Hàng) và từ các Sàn TMĐT (Shopee, Lazada, GoMUA) <br/> In đơn hàng, phiếu vận chuyển"
                },
                "plans":[
                    5,
                    6,
                    7,
                    8,
                    10
                ]
            },
            {
                "content":{
                    "en":"Export Order Data",
                    "vi":"Xuất Dữ Liệu Đơn Hàng"
                },
                "tips":{
                    "en":"Export Order Data Details",
                    "vi":"Xuất chi tiết dữ liệu đơn hàng "
                },
                "plans":[
                    5,
                    6,
                    7,
                    8,
                    10
                ]
            },
            {
                "content":{
                    "en":"Create Order",
                    "vi":"Xuất Dữ Liệu Đơn Hàng"
                },
                "tips":{
                    "en":"Create and manage orders  created from social medias",
                    "vi":"Tạo và quản lý đơn hàng từ các mạng xã hội"
                },
                "plans":[
                    8,
                    10
                ]
            },
            {
                "content":{
                    "en":"Quotations",
                    "vi":"Báo giá"
                },
                "tips":{
                    "en":"Create an exportable order drafts ( quotations ) for your customers within seconds. Add products from your product inventory to quotation list and export the quotation file with all the important information for the client without having to spend hours preparing it in the excel sheets.",
                    "vi":"Tạo các bản nháp đơn hàng cho khách hàng trong vòng vài giây. Thêm sản phẩm từ kho hàng vào danh sách báo giá và xuất file báo giá với mọi thông tin quan trọng tới khách hàng, mà không cần phải tốn thời gian soạn file excel."
                },
                "plans":[
                    5,
                    6,
                    7,
                    8,
                    10
                ]
            },
            {
                "content":{
                    "en":"Print Product Barcodes",
                    "vi":"In Mã Vạch Sản Phẩm"
                },
                "tips":{
                    "en":"Automatically generated  or self input barcodes for all Products with Multi-select Option to Print Barcodes for Product Labels",
                    "vi":"Hệ thống tự tạo mã vạch sản phẩm với tùy chọn in mã vạch để làm nhãn cho các sản phẩm tại cửa hàng"
                },
                "plans":[
                    5,
                    6,
                    7,
                    8,
                    10
                ]
            },
            {
                "content":{
                    "en":"Create and print customer Barcodes - Loyalty cards",
                    "vi":"Mã Khách Hàng Thành Viên - Thẻ Thành Viên Thân Thiết"
                },
                "tips":{
                    "en":"Identify your customer by automatically generated unique barcodes and print them as loyalty cards to reward your customers when they make a purchase",
                    "vi":"Nhận dạng khách hàng bằng mã khách hàng thành viên (Mã Barcode Thành Viên tự  tạo trên hệ thống) cho phép in mã làm thẻ thành viên thân thiết tích điểm khi thanh toán mua hàng tại shop"
                },
                "plans":[
                    5,
                    6,
                    7,
                    8,
                    10
                ]
            },
            {
                "content":{
                    "en":"Create and Manage Products Listing",
                    "vi":"Tạo & Quản Lý Danh Sách Sản Phẩm"
                },
                "tips":{
                    "en":"Create Unlimited Number of Products, numerous Product Variations , Collections and List Them On Your Website, Mobile App",
                    "vi":"Tạo và đăng tải Không Giới Hạn các sản phẩm, mẫu mã, bộ sưu tập trên Website, App Bán Hàng"
                },
                "plans":[
                    5,
                    6,
                    7,
                    8,
                    10
                ]
            },
            {
                "content":{
                    "en":"Import Product List",
                    "vi":"Xuất danh sách sản phẩm"
                },
                "tips":{
                    "en":"Export product data from {{providerName}} to Excel, CSV files",
                    "vi":"Xuất danh sách sản phẩm ra file Excel từ hệ thống {{providerName}}"
                },
                "plans":[
                    5,
                    6,
                    7,
                    8,
                    10
                ]
            },
            {
                "content":{
                    "en":"TAX Management",
                    "vi":"Quản lý thuế"
                },
                "tips":{
                    "en":"Create and manage various Sales taxes for products in your store,  Display Tax amount in order details,  checkouts and order receipts , Enable\\ disable showing label \"Excl. VAT\" on products pages in online store ",
                    "vi":"Tạo và quản lý hàng loạt thuế bán hàng cho sản phẩm tại cửa hàng, hiển thị giá trị thuế tại mục thông tin chi tiết sản phẩm, thanh toán và hóa đơn, bật/tắt việc hiển thị \"Excl. VAT\" trên trang sản phẩm tại cửa hàng trực tuyến."
                },
                "plans":[
                    5,
                    6,
                    7,
                    8,
                    10
                ]
            },
            {
                "content":{
                    "en":"Create and Manage Service Listing",
                    "vi":"Tạo & Quản Lý Danh Sách Dịch Vụ"
                },
                "tips":{
                    "en":"Create Unlimited Services with multiple locations, available time slots and services collection and list them on your Website, Mobile App",
                    "vi":"Tạo và đăng tải Không Giới Hạn các dịch vụ đặt chỗ với nhiều chi nhánh, khung giờ đặt hẹn khác nhau, bộ sưu tập dịch vụ trên Website, App"
                },
                "plans":[
                    5,
                    6,
                    7
                ]
            },
            {
                "content":{
                    "en":"Reservation Management",
                    "vi":"Quản Lý Đặt Chỗ"
                },
                "tips":{
                    "en":"Manage and process reservations from Website, Mobile App",
                    "vi":"Quản lý và xử lý đặt chỗ dịch vụ trên Website, App"
                },
                "plans":[
                    5,
                    6,
                    7
                ]
            },
            {
                "content":{
                    "en":"Listing Website (Hidden prices - suitable for Real-estate / Car dealership/ Consultant Agencies)",
                    "vi":"Website Liên Hệ (Ẩn giá bán - phù hợp với ngành bất động sản, cho thuê nhà, đại lý bán ô tô, các dịch vụ tư vấn)"
                },
                "tips":{
                    "en":"Convert E-commerce Website into a Listing Site where product and service prices are hidden and buyer request information via Phone Number, Zalo, Facebook or Email",
                    "vi":"Chuyển Website Bán Hàng TMĐT thành Website sản phẩm, dịch vụ Liên Hệ nơi khách hàng liên hệ trực tiếp qua Số điện thoại, Zalo, Facebook, Email"
                },
                "plans":[
                    5,
                    6
                ]
            },
            {
                "content":{
                    "en":"Listing App (Hidden prices - suitable for Real-estate / Car dealership/ Consultant Agencies)",
                    "vi":"App Liên Hệ (Ẩn giá bán - phù hợp với ngành bất động sản, cho thuê nhà, đại lý bán ô tô, các dịch vụ tư vấn)"
                },
                "tips":{
                    "en":"Convert E-commerce App into a Listing App where product and service prices are hidden and buyer request information via Phone Number, Zalo, Facebook or Email",
                    "vi":"Chuyển App Bán Hàng TMĐT thành App Liên Hệ nơi khách hàng liên hệ đăng ký, nhận báo giá trực tiếp qua Số điện thoại, Zalo, Facebook, Email"
                },
                "plans":[
                    7
                ]
            },
            {
                "content":{
                    "en":"Multiple shopee account management",
                    "vi":"Quản lý nhiều tài khoản Shopee"
                },
                "tips":{
                    "en":"Manage synchronised Orders and Products from multiple shopee stores",
                    "vi":"Quản lý các đơn hàng và sản phẩm đồng bộ từ nhiều cửa hàng shopee"
                },
                "plans":[
                    5,
                    6,
                    7,
                    10
                ]
            },
            {
                "content":{
                    "en":"Multiple shopee Inventory management automation",
                    "vi":"Tự động hoá quản lý hàng tồn kho nhiều cửa hàng Shopee"
                },
                "tips":{
                    "en":"Automation of stock deduction and stock updates of multiple shopee stores from one or more inventories",
                    "vi":"Tự động khấu trừ và cập nhật kho của nhiều cửa hàng trên shopee từ một hoặc nhiều kho"
                },
                "plans":[
                    5,
                    6,
                    7,
                    10
                ]
            },
            {
                "content":{
                    "en":"Synchronise, manage Order + Product on Shopee, Lazada, GoMUA",
                    "vi":"Đồng bộ, quản lý Đơn Hàng + Sản Phẩm cùng lúc trên nhiều kênh bán hàng Shopee, Lazada, GoMUA"
                },
                "tips":{
                    "en":"Manage synchronised Orders and Products from Shopee, Lazada, GoMUA in a Single Platform",
                    "vi":"Quản lý đơn hàng và sản phẩm được đồng bộ từ Shopee, Lazada, GoMUA về cùng một nơi"
                },
                "plans":[
                    5,
                    6,
                    7,
                    10
                ]
            },
            {
                "content":{
                    "en":"Upload Unlimited number of Products to Shopee, GoMUA",
                    "vi":"Đăng tải Không Giới Hạn Sản Phẩm lên Shopee, GoMUA"
                },
                "tips":{
                    "en":"Upload products, product variations and manage existing products in Shopee, GoMUA",
                    "vi":"Đăng tải sản phẩm mới, các mẫu mã thuộc tính và quản lý các sản phẩm hiện tại có trên Shopee, GoMUA"
                },
                "plans":[
                    5,
                    6,
                    7,
                    10
                ]
            },
            {
                "content":{
                    "en":"{{providerSeller}} App - Create Livestream to GoMUA Marketplace",
                    "vi":"Ứng Dụng {{providerSeller}} - Livestream trên Sàn TMĐT GoMUA"
                },
                "tips":{
                    "en":"Create livestream and stream video with chat option to GoMUA marketplace, place and process orders directly on livestream without stopping",
                    "vi":"Phát trực tiếp trên Sàn TMĐT GoMUA với tính năng nhắn tin, đặt hàng trực tiếp trên livestream, xử lý đơn hàng trực tiếp trong lúc livestream mà không cần dừng lại"
                },
                "plans":[
                    5,
                    6,
                    7,
                    8,
                    9,
                    10
                ]
            },
            {
                "content":{
                    "en":"FREE Online Shop at GoMUA Marketplace",
                    "vi":"Tạo Gian Hàng GoMUA MIỄN PHÍ"
                },
                "tips":{
                    "en":"Create a shop at new Vietnamese marketplace with unlimited product listing, Payment and Shipping Integration <br/>No Business Licence Required<br/>No Commission<br/>No Fee",
                    "vi":"Tạo gian hàng, đăng tải sản phẩm không giới hạn trên Sàn TMĐT Việt Nam tích hợp thanh toán mua hàng online, giao hàng tận nơi<br/>Không cần giấy phép kinh doanh<br/>Không phí hoa hồng<br/>Không bất kì chi phí nào"
                },
                "plans":[
                    5,
                    6,
                    7,
                    10
                ]
            }
        ]
    },
    {
        "groupName":{
            "en":"Business Analytics and Staff Management",
            "vi":"Phân Tích Dữ Liệu Kinh Doanh và Quản Lý Nhân Viên"
        },
        "features":[
            {
                "content":{
                    "en":"Business Analytics",
                    "vi":"Phân Tích, Báo Cáo Dữ Liệu Cửa Hàng"
                },
                "tips":{
                    "en":"Track Performance Of Your Business With Total revenue, Total Orders,Average Order Value, Pending Revenue and Other Statistics.",
                    "vi":"Thống kê tổng doanh thu, tổng đơn hàng,Giá trị trung bình mỗi đơn hàng, Doanh thu từ những đơn hàng cần được xử lý"
                },
                "plans":[
                    5,
                    6,
                    7,
                    8,
                    10
                ]
            },
            {
                "content":{
                    "en":"Lazada, Shopee, GoMUA - Revenue and Customer Reports",
                    "vi":"Báo cáo doanh thu và khách hàng trên Shopee, Lazada, GoMUA"
                },
                "tips":{
                    "en":"Report sales, customers orders history, and total purchases from customers on Shopee, GoMUA",
                    "vi":"Báo cáo doanh thu, khách hàng với lịch sử đặt hàng và tổng số tiền mua sắm từ khách hàng trên Shopee, GoMUA"
                },
                "plans":[
                    5,
                    6,
                    7,
                    8,
                    10
                ]
            },
            {
                "content":{
                    "en":"Staff Management - Unlimited staff account",
                    "vi":"Quản Lý Tài Khoản Nhân Viên <br/>Không giới hạn số lượng tài khoản nhân viên"
                },
                "tips":{
                    "en":"Create unlimited number of Staff accounts ,define staff permission ,Assigning staff to branches",
                    "vi":"Tạo không giới hạn số lượng tài khoản nhân viên, phân quyền dựa trên vị trí và bộ phận nhân sự làm việc và quản lý toàn quyền các tài khoản nhân viên."
                },
                "plans":[
                    5,
                    6,
                    7,
                    8,
                    10
                ]
            }
        ]
    },
    {
        "groupName":{
            "en":"CRM - Customer Relationship Management",
            "vi":"CRM - Quản Lý Khách Hàng"
        },
        "features":[
            {
                "content":{
                    "en":"Call Center CRM",
                    "vi":"Tổng Đài Gọi CRM"
                },
                "tips":{
                    "en":"Manage calls and view customers information including: call history, customer status, customers responsible staff , contact information and customers purchasing history  all in one place.",
                    "vi":"Quản lý cuộc gọi và xem thông tin khách hàng chi tiết bao gồm: lịch sử cuộc gọi, trạng thái khách hàng, người phụ trách, thông tin liên hệ chi tiết và lịch sử thanh toán khách hàng tập trung tại một nơi."
                },
                "plans":[
                    Constants.CALL_CENTER_PLAN_ID
                ]
            },
            {
                "content":{
                    "en":"Call Center - Call Recording",
                    "vi":"Ghi Âm Cuộc Gọi"
                },
                "tips":{
                    "en":"GoCALL records all calls so you can check quality of your staff calls and further analyse calls based on who made the call, call duration and call status",
                    "vi":"GoCALL ghi lại các cuộc gọi thoại cho phép bạn kiểm tra lại chất lượng cuộc gọi của nhân sự và có thể xem phân tích chi tiết, ai là người thực hiện cuộc gọi, thời lượng cuộc gọi, trạng thái cuộc gọi"
                },
                "plans":[
                    Constants.CALL_CENTER_PLAN_ID
                ]
            },
            {
                "content":{
                    "en":"Call Center Extentions management",
                    "vi":"Quản Lý Số Nhánh Tổng Đài"
                },
                "tips":{
                    "en":"Manage and assign extentions to your Staff. Increase number of extentions  easily from the {{providerName}} Dashboard .No need to purchase any additional physical phones as all calls are dialed from you {{providerName}} interface.",
                    "vi":"Quản lý và phân số nhánh cho nhân sự. Có thể tăng số lượng máy nhánh nhanh chóng trên giao diện quản lý {{providerName}}. Không cần tốn chi phí cho bất kỳ máy điện thoại bàn, tất cả cuộc gọi đều thực hiện được trên {{providerName}}"
                },
                "plans":[
                    Constants.CALL_CENTER_PLAN_ID
                ]
            },
            {
                "content":{
                    "en":"Customer Relationship Management",
                    "vi":"Quản Lý Khách Hàng"
                },
                "tips":{
                    "en":"Create new customers, manage customer details, customer order history on multiple channels",
                    "vi":"Tạo khách hàng mới, quản lý thông tin chi tiết khách hàng, lịch sử đặt hàng của khách trên nhiều kênh"
                },
                "plans":[
                    5,
                    6,
                    7,
                    8,
                    10
                ]
            },
            {
                "content":{
                    "en":"Customer Debt Management",
                    "vi":"Quản lý công nợ khách hàng"
                },
                "tips":{
                    "en":"Track customers' debt and payment history of orders",
                    "vi":"Theo dõi công nợ và lịch sử thanh toán của đơn hàng"
                },
                "plans":[
                    6,
                    7,
                    8,
                    10
                ]
            },
            {
                "content":{
                    "en":"Customer - Contact User",
                    "vi":"Khách Hàng - Thông Tin Liên Hệ"
                },
                "tips":{
                    "en":"Unlimited Contact User Data (Name, Phone Number, Email)",
                    "vi":"Không Giới Hạn Dữ Liệu Khách Hàng (Họ Tên, Số Điện Thoại, Email)"
                },
                "plans":[
                    5,
                    6,
                    7,
                    8,
                    9,
                    10
                ]
            },
            {
                "content":{
                    "en":"Customer Accounts",
                    "vi":"Khách Hàng - Thông Tin Thành Viên"
                },
                "tips":{
                    "en":"Unlimited Account User Data (Name, Phone Number, Email)",
                    "vi":"Không Giới Hạn Dữ Liệu Khách Hàng Thành Viên (Họ Tên, Số Điện Thoại, Email)"
                },
                "plans":[
                    5,
                    6,
                    7,
                    8
                ]
            },
            {
                "content":{
                    "en":"Create Customer segments based on registration date",
                    "vi":"Phân Loại Khách Hàng Theo Ngày Đăng Ký"
                },
                "tips":{
                    "en":"Group customers into segments based on the date their account was created on Website , Mobile App",
                    "vi":"Phân loại khách hàng dựa trên ngày khách hàng xác thực đăng ký tài khoản trên Website, App Bán Hàng"
                },
                "plans":[
                    5,
                    6,
                    7,
                    8,
                    10
                ]
            },
            {
                "content":{
                    "en":"Create Customer segments based on Order data",
                    "vi":"Phân Loại Khách Hàng Theo Dữ Liệu Đơn Hàng"
                },
                "tips":{
                    "en":"Categorize customers based on their ordered data like:<br/>- Where the order is delivered <br/>- Total amount paid by customers <br/>- Total number of orders purchased by customers.",
                    "vi":"Phân loại khách hàng dựa trên dữ liệu đơn hàng khách đã đặt như: <br/>- Địa điểm đơn hàng được giao <br/>- Tổng số tiền khách hàng thanh toán <br/>- Tổng số đơn hàng khách đã mua."
                },
                "plans":[
                    5,
                    6,
                    7,
                    8,
                    10
                ]
            },
            {
                "content":{
                    "en":"Create Customer segments based on Customer Tag",
                    "vi":"Phân Loại Khách Hàng bằng Thẻ Tags"
                },
                "tips":{
                    "en":"Classifying customers by tags for example tagging customers according to preferences, shopping behaviors, promotions, ...",
                    "vi":"Phân loại khách hàng bằng thẻ tags ví dụ như gán tags cho khách hàng theo sở thích, hành vi mua sắm, ưu đãi, ..."
                },
                "plans":[
                    5,
                    6,
                    7,
                    8,
                    9,
                    10
                ]
            },
            {
                "content":{
                    "en":"Create Customer segments based on App download",
                    "vi":"Phân Loại Khách Hàng Theo Hành Vi Cài Đặt Ứng Dụng"
                },
                "tips":{
                    "en":"Group customers based on the list of downloading the application on iPhone (iOS) or Android",
                    "vi":"Phân loại khách hàng dựa trên danh sách khách hàng tải ứng dụng trên iPhone (iOS) hoặc Android"
                },
                "plans":[
                    7
                ]
            },
            {
                "content":{
                    "en":"Import Customer Data",
                    "vi":"Nhập Dữ Liệu Khách Hàng"
                },
                "tips":{
                    "en":"Expand your customer list with customers imported from the CSV file",
                    "vi":"Mở rộng danh sách khách hàng của bạn với file CSV nhập liệu khách hàng"
                },
                "plans":[
                    5,
                    6,
                    7,
                    8
                ]
            },
            {
                "content":{
                    "en":"Export Customer Data",
                    "vi":"Xuất Dữ Liệu Khách Hàng"
                },
                "tips":{
                    "en":"Export Customer Data from {{providerName}} into your device (Full name, Phone number, recent order, total order, total payment, customers source)",
                    "vi":"Xuất danh sách toàn bộ dữ liệu khách hàng từ {{providerName}} về thiết bị (Họ Tên, Số Điện Thoại, Lần đặt hàng gần nhất, Tổng Đơn Hàng, Tổng Số Tiền Thanh Toán, Nguồn Khách Hàng)"
                },
                "plans":[
                    5,
                    6,
                    7,
                    8,
                    9,
                    10
                ]
            },
            {
                "content":{
                    "en":"GoCHAT- Integrated Facebook Chat",
                    "vi":"GoCHAT - Kết Nối Fanpage Facebook Chat"
                },
                "tips":{
                    "en":"Receive and Send Messages To Customers coming from Facebook Fanpage, Website or App and manage them in Single GoCHAT Interface.",
                    "vi":"Nhắn tin trực tiếp với khách hàng, quản lý các tin nhắn đến từ kênh Fanpage Facebook, Website, Ứng Dụng trên cùng giao diện GoCHAT"
                },
                "plans":[
                    10
                ]
            },
            {
                "content":{
                    "en":"GoCHAT CRM - Facebook Fanpage",
                    "vi":"Hệ Thống Quản Lý Khách Hàng trên GoCHAT - Facebook Fanpage"
                },
                "tips":{
                    "en":"Connect Shop's Customer Accounts With Facebook Users, <br/>Create, Add Customer Contact Information, Take Notes and See Customer's Purchase Behaviour, <br/>Customer Total Average Purchase Value and Purchase Value Of Past 3 Months",
                    "vi":"Kết nối và nhóm những thông tin khách hàng trong hệ thống với tài khoản Facebook của khách hàng. Tạo, lưu trữ thu thập thông tin khách hàng mới, ghi chú, xem lại lịch sử mua hàng trước đó, tổng số tiền khách hàng đã mua từ cửa hàng,  xem lại tổng số tiền của khách mua sắm trong 3 tháng gần nhất"
                },
                "plans":[
                    10
                ]
            },
            {
                "content":{
                    "en":"GoCHAT- Integrated Zalo Chat",
                    "vi":"GoCHAT - Kết Nối Zalo OA Chat"
                },
                "tips":{
                    "en":"Receive and Send Messages To Customers coming from Zalo Official Account, Website or App and manage them in Single GoCHAT Interface.",
                    "vi":"Nhắn tin trực tiếp với khách hàng, quản lý các tin nhắn đến từ kênh Zalo Official Account, Website, Ứng Dụng trên cùng giao diện GoCHAT"
                },
                "plans":[
                    10
                ]
            },
            {
                "content":{
                    "en":"GoCHAT CRM - Zalo OA",
                    "vi":"Hệ Thống Quản Lý Khách Hàng trên GoCHAT - Zalo OA"
                },
                "tips":{
                    "en":"Connect Shop's Customer Accounts With Facebook Users, <br/>Create, Add Customer Contact Information, Take Notes and See Customer's Purchase Behaviour,<br/>Customer Total Average Purchase Value and Purchase Value Of Past 3 Months ",
                    "vi":"Kết nối và nhóm những thông tin khách hàng trong hệ thống với tài khoản Zalo của khách hàng. Tạo, lưu trữ thu thập thông tin khách hàng mới, ghi chú, xem lại lịch sử mua hàng trước đó, tổng số tiền khách hàng đã mua từ cửa hàng,  xem lại tổng số tiền của khách mua sắm trong 3 tháng gần nhất"
                },
                "plans":[
                    10
                ]
            },
        ]
    },
    {
        "groupName":{
            "en":"MARKETING",
            "vi":"MARKETING"
        },
        "features":[
            {
                "content":{
                    "en":"Landing Page",
                    "vi":"Landing Page"
                },
                "tips":{
                    "en":"Create Unlimited amount of landing pages with {{providerName}} subdomain",
                    "vi":"Tạo Không Giới Hạn Landing Page <br/> Xuất bản landing page miễn phí với tên miền phụ"
                },
                "plans":[
                    5,
                    6,
                    7,
                    8,
                    9,
                    10
                ]
            },
            {
                "content":{
                    "en":"Landing Page Analytics",
                    "vi":"Cài Đặt Theo Dõi Phân Tích Landing Page"
                },
                "tips":{
                    "en":"Integration with Google analytics and facebook Pixel",
                    "vi":"Tích hợp với Google Analytics ID và Facebook Pixel ID"
                },
                "plans":[
                    9
                ]
            },
            {
                "content":{
                    "en":"SEO Landing Page",
                    "vi":"Cài Đặt SEO Landing Page"
                },
                "tips":{
                    "en":"Optimise SEO Meta title and description of your landing pages",
                    "vi":"Tối ưu hóa tiêu đề SEO Meta và mô tả Landing Page của bạn"
                },
                "plans":[
                    9
                ]
            },
            {
                "content":{
                    "en":"Landing Page Tag",
                    "vi":"Landing Page Tag"
                },
                "tips":{
                    "en":"Create a custom tag for every landing page,  every lead who completes a contact form will be assigned a langing page tag which is displayed in the lead's profile.",
                    "vi":"Tạo thẻ tùy chỉnh cho mỗi trang Landing Page, các khách hàng tiềm năng khi nhập thông tin vào form liên hệ sẽ được phân loại theo thẻ Landing Page hiển thị sẵn trong hồ sơ của các khách hàng tiềm năng"
                },
                "plans":[
                    5,
                    6,
                    7,
                    8,
                    9,
                    10
                ]
            },
            {
                "content":{
                    "en":"Publish Landing Page With Custom Domain",
                    "vi":"Xuất Bản Landing Page Với Tên Miền Tùy Chỉnh "
                },
                "tips":{
                    "en":"Create unlimited amount of landing pages using a custom domain.",
                    "vi":"Tạo Landing page không giới hạn và xuất bản với tên miền cá nhân."
                },
                "plans":[
                    9
                ]
            },
            {
                "content":{
                    "en":"Create Discount Codes For Products",
                    "vi":"Tạo Mã Giảm Giá Sản Phẩm"
                },
                "tips":{
                    "en":"Generate discount codes valid for a specific time , specific product,  platform or a specific customer segment",
                    "vi":"Thiết lập mã giảm giá, ưu đãi sản phẩm cho một nhóm khách hàng đã phân loại theo số lượng đặt hàng tối thiểu, trong một thời hạn nhất định."
                },
                "plans":[
                    5,
                    6,
                    7,
                    8
                ]
            },
            {
                "content":{
                    "en":"Create Free Shipping Code ",
                    "vi":"Tạo Mã Miễn Phí Vận Chuyển"
                },
                "tips":{
                    "en":"Generate Free Shipping Codes valid for a specific time , specific product,  platform or a specific customer segment",
                    "vi":"Tạo mã giao hàng miễn phí có hiệu lực theo mốc thời gian, điều kiện, nền tảng cụ thể hoặc một phân khúc khách hàng cụ thể"
                },
                "plans":[
                    5,
                    6,
                    7,
                    8
                ]
            },
            {
                "content":{
                    "en":"Create Reward - Discount Code  For Products",
                    "vi":"Tạo Ưu đãi - Mã giảm giá cho sản phẩm"
                },
                "tips":{
                    "en":"Create a reward discount code which appears in the customers profile reward section to motivate buyer in making purchases before the reward expires.  Reward can be created for specific time, discount type, specific product,  platform or a specific customer segment ",
                    "vi":"Tạo mã giảm giá ưu đãi, xuất hiện trong mục hồ sơ của khách hàng để thúc đẩy mua hàng trước khi mã ưu đãi hết hạn. Ưu đãi có thể được tạo cho một khoảng thời gian cụ thể, loại giảm giá, sản phẩm cụ thể, nền tảng hoặc một nhóm khách hàng nhất định."
                },
                "plans":[
                    5,
                    6,
                    7
                ]
            },
            {
                "content":{
                    "en":"Create Wholesale Price Levels for products",
                    "vi":"Tạo Giá Bán Buôn / Bán Sỉ Sản Phẩm"
                },
                "tips":{
                    "en":"Create Wholesale Pricing Levels For specific time , different set of minimum purchase conditions or a specific customer segment .",
                    "vi":"Thiết lập giá bán sỉ sản phẩm cho một nhóm khách hàng đã phân loại theo số lượng đặt hàng tối thiểu, trong một thời hạn nhất định."
                },
                "plans":[
                    5,
                    6,
                    7,
                    8
                ]
            },
            {
                "content":{
                    "en":"Create Discount Codes For Services",
                    "vi":"Tự Tạo Mã Giảm Giá Dịch Vụ"
                },
                "tips":{
                    "en":"Generate discount codes valid for a specific time , specific service,  platform or a specific customer segment",
                    "vi":"Thiết lập mã giảm giá, ưu đãi dịch vụ cho một nhóm khách hàng đã phân loại theo số lượng đặt hàng tối thiểu, trong một thời hạn nhất định."
                },
                "plans":[
                    5,
                    6,
                    7
                ]
            },
            {
                "content":{
                    "en":"Create Wholesale Price Levels for services\n",
                    "vi":"Tạo Giá Bán Buôn / Bán Sỉ Dịch Vụ"
                },
                "tips":{
                    "en":"Create Wholesale Pricing Levels For specific time , different set of minimum purchase conditions or a specific customer segment ",
                    "vi":"Thiết lập giá bán sỉ dịch vụ cho một nhóm khách hàng đã phân loại theo số lượng đặt hàng tối thiểu, trong một thời hạn nhất định."
                },
                "plans":[
                    5,
                    6,
                    7
                ]
            },
            {
                "content":{
                    "en":"Flashsale Promotion",
                    "vi":"Khuyến mãi Flash Sale"
                },
                "tips":{
                    "en":"Create powerful marketing campaigns that helps you sell goods for a certain period of time at special prices, stimulating the customers to purchase quickly before the campaign expires. Add and customize Flashsale elements in your App or WEB editors  for the highest  impact on your flashsale campaigns.",
                    "vi":"Tạo chiến dịch marketing mạnh mẽ giúp bạn bán hàng với giá cực hấp dẫn trong một khoảng thời gian ngắn, kích thích khách hàng mua sắm nhanh chóng trước khi hết chiến dịch. Thêm và tùy chỉnh các thành tố của Flash Sale bằng trình chỉnh sửa trên App hoặc Web để thu hút khách hàng."
                },
                "plans":[
                    5,
                    6,
                    7
                ]
            },
            {
                "content":{
                    "en":"Customer Membership & Loyalty Programs",
                    "vi":"Chương Trình Khách Hàng Thân Thiết"
                },
                "tips":{
                    "en":"Create loyalty progames and set membership conditions such as minimum amount spend per specific period, downloaded app, registered date and more",
                    "vi":"Tạo thẻ thành viên và chương trình khách hàng thân thiết"
                },
                "plans":[
                    5,
                    6,
                    7,
                    8
                ]
            },
            {
                "content":{
                    "en":"Automated loyalty program discounts",
                    "vi":"Tự động giảm giá từ chương trình khách hàng thân thiết"
                },
                "tips":{
                    "en":"Configure automated membership discount with maximum limit per order for each membership tier when customer checking out in APP\\ WEB or making instore purchase",
                    "vi":"Thiết lập mã giảm giá tự động cho cấp độ khách hàng với giới hạn tối đa cho từng đơn hàng khi khách hàng thanh toán trên App/Web hoặc tại cửa hàng."
                },
                "plans":[
                    5,
                    6,
                    7,
                    8
                ]
            },
            {
                "content":{
                    "en":"Blog",
                    "vi":"Blog"
                },
                "tips":{
                    "en":"Create hundreds of articles and blog categories for your customers visiting your online shop",
                    "vi":"Viết hàng trăm nội dung blog với nhiều danh mục khác nhau để khách hàng truy cập vào cửa hàng trực tuyến của bạn"
                },
                "plans":[
                    5,
                    6,
                    7

                ]
            },
            {
                "content":{
                    "en":"SEO Optimisation",
                    "vi":"SEO Tối Ưu Hóa Tìm Kiếm"
                },
                "tips":{
                    "en":"Optimise SEO Title's and Description's Length, Add Keywords , Edit URL for : Home page, Blog articles, Custom Pages, Product and Service Pages, Product and Service Collections",
                    "vi":"Tối ưu SEO tiêu đề, độ dài nội dung mô tả, thêm từ khóa, và tùy chỉnh URL cho Trang Chủ, Trang Blog, Trang Tùy Chỉnh Trang Sản Phẩm, Trang Dịch Vụ, Các Trang Bộ Sưu Tập Sản Phẩm, Dịch Vụ"
                },
                "plans":[
                    6

                ]
            },
            {
                "content":{
                    "en":"Google Shopping",
                    "vi":"Google Shopping "
                },
                "tips":{
                    "en":"Verify your website domain to connect with Google Ads, Google merchant center and easily export product feed from {{providerName}}  ",
                    "vi":"Xác thực tên miền Website và kết nối với tài khoản Google Ads, Google Merchant Center và dễ dàng xuất danh sách sản phẩm từ {{providerName}}"
                },
                "plans":[
                    6

                ]
            },
            {
                "content":{
                    "en":"Google Analytics - Web and App",
                    "vi":"Cài Đặt Google Analytics ID Trên Website và Mobile App"
                },
                "tips":{
                    "en":"Google Analytics Integration in Just One Click",
                    "vi":"Tích hợp Google Analytics chỉ trong 1 click chuột"
                },
                "plans":[
                    5,
                    6,
                    7

                ]
            },
            {
                "content":{
                    "en":"Facebook Pixel - Web and App",
                    "vi":"Cài Đặt Facebook Pixel ID Trên Website và Mobile App"
                },
                "tips":{
                    "en":"Web, App Facebook Pixel and App ID Integration In Just One Click",
                    "vi":"Tích hợp Facebook Pixel vào Website, App chỉ trong tích tắc"
                },
                "plans":[
                    5,
                    6,
                    7

                ]
            },
            {
                "content":{
                    "en":"Push App Notification iOS, Android",
                    "vi":"Gửi Thông Báo Qua Ứng Dụng Di Động"
                },
                "tips":{
                    "en":"Increase the engagement of your customers by creating an app notification campaigns reaching to thousands of customers using your custom app",
                    "vi":"Tăng tương tác khách hàng của bạn bằng công cụ tạo chiến dịch gửi thông báo qua App Bán Hàng của riêng mình tiếp cận đến hàng ngàn khách hàng"
                },
                "plans":[
                    7

                ]
            },
            {
                "content":{
                    "en":"Schedule Push App Notification iOS, Android",
                    "vi":"Lên lịch gửi thông báo tới ứng dụng Android, iOS"
                },
                "tips":{
                    "en":"Schedule sending push notification at specific time and date",
                    "vi":"Lên lịch gửi thông báo vào một thời gian bất kì"
                },
                "plans":[
                    7
                ]
            },
            {
                "content":{
                    "en":"Email Marketing with Editor and Customizable Templates",
                    "vi":"Email Marketing với Mẫu Giao Diện Thiết Kế Sẵn"
                },
                "tips":{
                    "en":"Reach to thousands of Customer' s Inboxes With Your Latest News, Deals and Increase Traffic to Your Shop For Free. Choose email templates and customize them to fit your audience for even better results ",
                    "vi":"Tiếp cận hàng ngàn khách hàng qua hộp thư đến bằng tin tức, ưu đãi mới nhất gia tăng lưu lượng truy cập đến cửa hàng của mình miễn phí. <br/>Lựa chọn các mẫu nội dung email được thiết kế sẵn rồi chỉnh sửa sao cho phù hợp với các đối tượng khách hàng khác nhau để đạt được kết quả tốt hơn"
                },
                "plans":[
                    5,
                    6,
                    7,
                    8,
                    10

                ]
            },
            {
                "content":{
                    "en":"Ministry of Industry and Trade Logo",
                    "vi":"Logo Bộ Công Thương"
                },
                "tips":{
                    "en":"Shop Certification logo by Ministry of Industry",
                    "vi":"Logo chứng nhận shop từ Bộ Công Thương"
                },
                "plans":[

                    6


                ]
            }
        ]
    }
]

const convertToLanguagePackage = (langKey, provider) => {
    let {providerName, providerSeller} = {
        providerName: provider,
        providerSeller: provider === '12121' ? '12121' : provider
    };
    let result = {}
    const langKeys = ['en','vi']
    langKeys.forEach(lngKey => result[lngKey] = [])

    langKeys.forEach(lngKey => {

        featureGroup.forEach(group => {
            result[lngKey].push({
                groupName: replaceProviderKeyInContent(group.groupName[lngKey], providerName, providerSeller),
                features: group.features.map(feature => ({
                    content: replaceProviderKeyInContent(feature.content[lngKey], providerName, providerSeller),
                    tips: replaceProviderKeyInContent(feature.tips[lngKey], providerName, providerSeller),
                    plans: feature.plans
                }))
            })
        })

    })
    return result[langKey];
}

const replaceProviderKeyInContent = (content, providerName, providerSeller) => {
    return content.replaceAll("{{providerName}}", providerName).replaceAll("{{providerSeller}}", providerSeller);
}

export const PackagePlanService = {
    convertToLanguagePackage
}
