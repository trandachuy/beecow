/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 27/09/2021
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
const GosellCityCode = {
    'VN-01': '30000', //Lai Châu
    'VN-02': '31000', //Lào Cai
    'VN-03': '20000', //Hà Giang
    'VN-04': '21000', //Cao Bằng
    'VN-05': '34000', //Sơn La
    'VN-06': '33000', //Yên Bái
    'VN-07': '22000', //Tuyên Quang
    'VN-09': '25000', //Lạng Sơn
    'VN-13': '01000', //Quảng Ninh
    'VN-14': '36000', //Hòa Bình
    'VN-18': '08000', //Ninh Bình
    'VN-20': '06000', //Thái Bình
    'VN-21': '40000', //Thanh Hóa
    'VN-22': '43000', //Nghệ An
    'VN-23': '45000', //Hà Tĩnh
    'VN-24': '47000', //Quảng Bình
    'VN-25': '48000', //Quảng Trị
    'VN-26': '49000', //Thừa Thiên Huế
    'VN-27': '51000', //Quảng Nam
    'VN-28': '60000', //Kon Tum
    'VN-29': '53000', //Quảng Ngãi
    'VN-30': '61000', //Gia Lai
    'VN-31': '55000', //Bình Định
    'VN-32': '56000', //Phú Yên
    'VN-33': '63000', //Đắc Lăk
    'VN-34': '57000', //Khánh Hòa
    'VN-35': '66000', //Lâm Đồng
    'VN-36': '59000', //Ninh Thuận
    'VN-37': '80000', //Tây Ninh
    'VN-39': '76000', //Đồng Nai
    'VN-40': '77000', //Bình Thuận
    'VN-41': '82000', //Long An
    'VN-43': '78000', //Bà Rịa–Vũng Tàu
    'VN-44': '90000', //An Giang
    'VN-45': '81000', //Đồng Tháp
    'VN-46': '84000', //Tiền Giang
    'VN-47': '91000', //Kiên Giang
    'VN-49': '85000', //Vĩnh Long
    'VN-50': '86000', //Bến Tre
    'VN-51': '87000', //Trà Vinh
    'VN-52': '96000', //Sóc Trăng
    'VN-53': '23000', //Bắc Cạn
    'VN-54': '26000', //Bắc Giang
    'VN-55': '97000', //Bạc Liêu
    'VN-56': '16000', //Bắc Ninh
    'VN-57': '75000', //Bình Dương
    'VN-58': '67000', //Bình Phước
    'VN-59': '98000', //Cà Mau
    'VN-61': '03000', //Hải Dương
    'VN-63': '18000', //Hà Nam
    'VN-66': '17000', //Hưng Yên
    'VN-67': '07000', //Nam Định
    'VN-68': '35000', //Phú Thọ
    'VN-69': '24000', //Thái Nguyên
    'VN-70': '15000', //Vĩnh Phúc
    'VN-71': '32000', //Điện Biên
    'VN-72': '65000', //Đắk Nông
    'VN-73': '95000', //Hậu Giang
    'VN-CT': '94000', //Cần Thơ
    'VN-DN': '50000', //Đà Nẵng
    'VN-HN': '10000', //Hà Nội
    'VN-HP': '04000', //Hải Phòng
    'VN-OTHER': '', //Khác
    'VN-SG': '70000', //Hồ Chí Minh
}

const getByGosellCityCode = (cityCode) => {
    return GosellCityCode[cityCode]
}

export const ZipCodeUtils = {
    getByGosellCityCode
}