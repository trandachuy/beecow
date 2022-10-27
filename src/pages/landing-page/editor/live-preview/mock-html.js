export const mockHtml = `
<!DOCTYPE html>
<html>
   <head>
      <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.1/css/bootstrap.min.css">
      <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js"></script>
      <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.1/js/bootstrap.min.js"></script>
  <style>
.landing-page-content {
background-color: #fff;
height: fit-content;
}

.landing-page-content .landing-page-header {
display: flex;
align-items: center;
margin-top: 10px;
}

.landing-page-content .landing-page-header .header-logo img {
width: 150px;
}

.landing-page-content .landing-page-header .header-nav a {
color: unset;
font-weight: bold;
}

@media (min-width: 768px) {
.landing-page-content .landing-page-header .header-logo {
flex: 1;
}
.landing-page-content .landing-page-header .header-nav {
flex: 3;
text-align: right;
}
.landing-page-content .landing-page-header .header-nav nav {
display: flex;
flex-direction: row;
align-items: center;
}
.landing-page-content .landing-page-header .header-nav nav a {
margin-left: 20px;
}
}

@media (max-width: 767px) {
.landing-page-content .landing-page-header {
flex-direction: column;
}
.landing-page-content .landing-page-header .header-nav nav {
display: flex;
flex-direction: column;
align-items: center;
}
}

.landing-page-content .header-divider {
border-top: 8px solid #253b97;
}

.landing-page-content .landing-page-body .body-title article {
text-align: center;
font-weight: bold;
}

.landing-page-content .landing-page-body .body-title article p {
margin: 0px auto;
}

@media (min-width: 768px) {
.landing-page-content .landing-page-body .body-title article p {
width: 70%;
}
}

@media (max-width: 767px) {
.landing-page-content .landing-page-body .body-title article p {
width: 90%;
}
}

.landing-page-content .landing-page-body .body-video {
margin-top: 10px;
display: flex;
flex-direction: column;
justify-content: center;
align-items: center;
}

.landing-page-content .landing-page-body .body-video .body-banner-after {
width: 100%;
border-radius: 180% / 50%;
border-top-right-radius: 0;
border-top-left-radius: 0;
}

@media (min-width: 768px) {
.landing-page-content .landing-page-body .body-video .body-banner-after {
height: 400px;
}
}

@media (max-width: 767px) {
.landing-page-content .landing-page-body .body-video .body-banner-after {
height: 270px;
}
}

@media (min-width: 768px) {
.landing-page-content .landing-page-body .body-video iframe {
width: 70%;
height: 380px;
margin-top: -350px;
}
}

@media (max-width: 767px) {
.landing-page-content .landing-page-body .body-video iframe {
width: 90%;
height: 250px;
margin-top: -220px;
}
}

.landing-page-content .landing-page-body .body-reservation {
margin: 0px auto;
margin-top: 30px;
font-weight: bold;
}

@media (min-width: 768px) {
.landing-page-content .landing-page-body .body-reservation {
width: 70%;
}
}

@media (max-width: 767px) {
.landing-page-content .landing-page-body .body-reservation {
width: 90%;
}
}

.landing-page-content .landing-page-body .body-reservation .reservation-button {
text-align: center;
color: #fff;
border-radius: 10px;
padding: 10px 30px;
}

.landing-page-content .landing-page-body .body-reservation .reservation-button h3,
.landing-page-content .landing-page-body .body-reservation .reservation-button h6 {
margin-bottom: 0px;
}

.landing-page-content .landing-page-body .body-reservation.margintop-70 {
margin-top: 70px !important;
}

.landing-page-content .landing-page-body .body-propositions {
margin: 0px auto;
margin-top: 70px;
}

@media (min-width: 768px) {
.landing-page-content .landing-page-body .body-propositions {
width: 70%;
}
}

@media (max-width: 767px) {
.landing-page-content .landing-page-body .body-propositions {
width: 90%;
}
}

.landing-page-content .landing-page-body .body-propositions article {
text-align: center;
font-weight: bold;
}

.landing-page-content .landing-page-body .body-propositions-image {
margin: 0px auto;
margin-top: 70px;
}

@media (min-width: 768px) {
.landing-page-content .landing-page-body .body-propositions-image {
width: 70%;
}
}

@media (max-width: 767px) {
.landing-page-content .landing-page-body .body-propositions-image {
width: 90%;
}
}

.landing-page-content .landing-page-body .body-propositions-image img {
width: 100%;
}

.landing-page-content .landing-page-body .body-collection {
margin-top: 90px;
}

.landing-page-content .landing-page-body .body-collection .collection-left {
text-align: right;
}

.landing-page-content .landing-page-body .body-collection .collection-left img {
width: 90%;
height: 400px;
}

.landing-page-content .landing-page-body .body-collection .collection-right {
display: flex;
flex-direction: column;
justify-content: space-between;
}

.landing-page-content .landing-page-body .body-collection .collection-right .collection-right-content {
width: 90%;
display: flex;
}

.landing-page-content .landing-page-body .body-collection .collection-right .collection-right-content i {
width: 50px;
height: 50px;
background-image: url(/assets/images/icon-stick.svg);
background-repeat: no-repeat;
display: inline-block;
background-position-y: 8px;
}

.landing-page-content .landing-page-body .body-collection .collection-right .collection-right-content p {
margin-left: 10px;
font-weight: bold;
}

.landing-page-content .landing-page-body .body-review-title {
margin: 0px auto;
margin-top: 60px;
}

@media (min-width: 768px) {
.landing-page-content .landing-page-body .body-review-title {
width: 70%;
}
}

@media (max-width: 767px) {
.landing-page-content .landing-page-body .body-review-title {
width: 90%;
}
}

.landing-page-content .landing-page-body .body-review-title article {
text-align: center;
}

.landing-page-content .landing-page-body .body-review-title article hr {
margin: 0px auto;
width: 100px;
border-top: 4px solid #253b97;
margin-top: 0px;
border-radius: 5px;
}

.landing-page-content .landing-page-body .body-review-title article p {
font-weight: bold;
}

.landing-page-content .landing-page-body .body-review-image {
margin: 0px auto;
margin-top: 60px;
}

@media (min-width: 768px) {
.landing-page-content .landing-page-body .body-review-image {
width: 70%;
}
}

@media (max-width: 767px) {
.landing-page-content .landing-page-body .body-review-image {
width: 90%;
}
}

.landing-page-content .landing-page-body .body-review-image img {
width: 100%;
}

.landing-page-content .landing-page-body .body-review-list {
margin: 0px auto;
margin-top: 60px;
display: flex;
flex-direction: column;
}

@media (min-width: 768px) {
.landing-page-content .landing-page-body .body-review-list {
width: 70%;
}
}

@media (max-width: 767px) {
.landing-page-content .landing-page-body .body-review-list {
width: 90%;
}
}

.landing-page-content .landing-page-body .body-review-list .review-row {
margin-top: 20px;
display: flex;
flex-direction: row;
width: 100%;
}

.landing-page-content .landing-page-body .body-review-list .review-row .review-image {
flex-basis: 200px;
display: inline-block;
position: relative;
width: 200px;
height: 200px;
overflow: hidden;
border-radius: 50%;
}

.landing-page-content .landing-page-body .body-review-list .review-row .review-image img {
width: auto;
height: 100%;
margin-left: -50px;
}

.landing-page-content .landing-page-body .body-review-list .review-row .review-detail {
flex: 1;
margin-left: 15px;
}

.landing-page-content .landing-page-body .body-review-list .review-row .review-detail .address {
font-style: italic;
}

.landing-page-content .landing-page-body .body-review-list .review-row .review-detail .content {
color: #565555;
font-weight: bold;
}

.landing-page-content .landing-page-body .body-form {
margin: 0px auto;
margin-top: 60px;
display: flex;
flex-direction: column;
align-items: center;
border-radius: 10px;
border: 1px solid #707070;
padding-bottom: 30px;
}

@media (min-width: 768px) {
.landing-page-content .landing-page-body .body-form {
width: 70%;
}
}

@media (max-width: 767px) {
.landing-page-content .landing-page-body .body-form {
width: 90%;
}
}

.landing-page-content .landing-page-body .body-form .form-line {
height: 20px;
width: 100%;
border-top-left-radius: 9px;
border-top-right-radius: 9px;
}

.landing-page-content .landing-page-body .body-form .form-image {
margin-top: 50px;
text-align: center;
}

.landing-page-content .landing-page-body .body-form .form-image img {
width: 50%;
}

.landing-page-content .landing-page-body .body-form .form-title {
width: 80%;
margin-top: 30px;
}

.landing-page-content .landing-page-body .body-form .form-title article {
text-align: center;
}

.landing-page-content .landing-page-body .body-form .form-title article p {
margin: 0px auto;
}

.landing-page-content .landing-page-body .body-form .form-input {
width: 80%;
display: flex;
flex-direction: column;
margin-top: 20px;
}

.landing-page-content .landing-page-body .body-form .form-input .input-field {
line-height: 50px;
border-radius: 10px;
font-size: 20px;
padding-left: 20px;
padding-right: 20px;
margin-top: 20px;
}

.landing-page-content .landing-page-body .body-form .form-button {
width: 80%;
margin-top: 30px;
}

.landing-page-content .landing-page-body .body-form .form-button .button-field {
width: 100%;
padding-top: 15px;
padding-bottom: 15px;
color: #fff;
background-color: #799528;
border: 1px solid #799528;
border-radius: 10px;
}

.landing-page-content .landing-page-body .body-form .form-button .button-field h1 {
margin-bottom: 0px;
}

.landing-page-content .landing-page-body .body-form .form-policy {
width: 80%;
margin-top: 30px;
}

.landing-page-content .landing-page-body .body-form .form-policy p {
margin: 0px auto;
}

.landing-page-content .landing-page-footer {
color: #fff;
margin-top: 70px;
padding-top: 20px;
padding-bottom: 20px;
}

.landing-page-content .landing-page-footer article {
margin: 0px auto;
text-align: center;
}

@media (min-width: 768px) {
.landing-page-content .landing-page-footer article {
width: 70%;
}
}

@media (max-width: 767px) {
.landing-page-content .landing-page-footer article {
width: 90%;
}
}

.landing-page-content .landing-page-footer article img {
margin-bottom: 20px;
width: 100px;
}

.landing-page-content .landing-page-footer article p {
margin: 0px auto;
}

.landing-page-content .landing-page-copy-right {
margin-top: 20px;
text-align: center;
}

.landing-page-content .thank-you-popup .body-form {
margin: 0px auto;
margin-top: 60px;
display: flex;
flex-direction: column;
align-items: center;
border-radius: 10px;
border: 1px solid #707070;
padding-bottom: 30px;
}

@media (min-width: 768px) {
.landing-page-content .thank-you-popup .body-form {
width: 70%;
}
}

@media (max-width: 767px) {
.landing-page-content .thank-you-popup .body-form {
width: 90%;
}
}

.landing-page-content .thank-you-popup .body-form .form-line {
height: 20px;
width: 100%;
border-top-left-radius: 9px;
border-top-right-radius: 9px;
}

.landing-page-content .thank-you-popup .body-form .form-image {
margin-top: 50px;
text-align: center;
}

.landing-page-content .thank-you-popup .body-form .form-image img {
width: 50%;
}

.landing-page-content .thank-you-popup .body-form .form-title {
width: 80%;
margin-top: 30px;
}

.landing-page-content .thank-you-popup .body-form .form-title article {
text-align: center;
}

.landing-page-content .thank-you-popup .body-form .form-title article p {
margin: 0px auto;
}

.landing-page-content .thank-you-popup .body-form .form-main-image {
margin-top: 50px;
text-align: center;
}

.landing-page-content .thank-you-popup .body-form .form-main-image img {
width: 70%;
}

.landing-page-content .thank-you-popup .body-form .form-button {
width: 80%;
margin-top: 30px;
}

.landing-page-content .thank-you-popup .body-form .form-button .button-field {
width: 100%;
padding-top: 15px;
padding-bottom: 15px;
color: #fff;
background-color: #799528;
border: 1px solid #799528;
border-radius: 10px;
}

.landing-page-content .thank-you-popup .body-form .form-button .button-field h1 {
margin-bottom: 0px;
}

.landing-page-content .thank-you-popup .body-form .form-policy {
width: 80%;
margin-top: 30px;
}

.landing-page-content .thank-you-popup .body-form .form-policy p {
margin: 0px auto;
}

.landing-page-content .gs-background-color {
background-color: #253b97;
}

.landing-page-content .gs-border-color {
border-color: #253b97;
}

.landing-page-content .gs-font-color {
color: #253b97;
}

@media (min-width: 768px) {
.landing-page-content h1 {
font-size: 30px;
font-weight: bold;
}
.landing-page-content h3 {
font-size: 26px;
font-weight: bold;
}
.landing-page-content h6 {
font-size: 20px;
font-weight: bold;
}
.landing-page-content p {
font-size: 18px;
}
}

@media (max-width: 767px) {
.landing-page-content h1 {
font-size: 26px;
font-weight: bold;
}
.landing-page-content h3 {
font-size: 22px;
font-weight: bold;
}
.landing-page-content h6 {
font-size: 16px;
font-weight: bold;
}
.landing-page-content p {
font-size: 14px;
}
}
  </style>
   </head>
   <body>
<div class="landing-page-content container"><section gsmain="" id="gsMainId"><header class="landing-page-header"><section class="header-logo"><img gscp="" gsimg="" src="https://admin.gosell.vn/assets/images/gosell-logo.svg" alt=""></section><section class="header-nav"><nav><a href="#"><h3 gscp="" gstext="">Values propositions</h3></a><a href="#"><h3 gscp="" gstext="">Testtimoneals</h3></a><a href="#"><h3 gscp="" gstext="">SIGN UP FOR FREE</h3></a></nav></section></header><hr class="header-divider gs-border-color"><main class="landing-page-body"><section class="body-title"><article><h1 gscp="" gstext="">THIS IS THE ATTRACTIVE TITLE TO HELP YOU ATTRACT MORE CUSTOMER !!!</h1><p gscp="" gstext="">Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old</p></article></section><section class="body-video"><div class="body-banner-after gs-background-color"></div><iframe width="560" height="315" src="https://www.youtube.com/embed/nrpjNgZCdlM" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"></iframe></section><section class="body-reservation"><article class="reservation-button gs-background-color"><h3 gscp="" gstext="">YES! CALL TO ACTION NOW!</h3><h6 gscp="" gstext="">You pay only 79.000d for shipping and handling in VN (129.000d)</h6></article></section><section class="body-propositions"><article><h1 gscp="" gstext="">WHAT IS LOREM ISPUM</h1><p gscp="" gstext="">Contrary to popular belief, Lorem Ipsum is not simply random text.</p></article></section><section class="body-propositions-image"><img gscp="" gsimg="" src="https://ipub.vn/upload/files/201905/8344574595466675a73f9c43e4120d8f.jpeg" alt=""></section><section class="body-collection row"><section class="collection-left col-xl-6 col-lg-6 col-md-12 col-sm-12"><img gscp="" gsimg="" src="https://ipub.vn/upload/files/201905/8344574595466675a73f9c43e4120d8f.jpeg" alt=""></section><section class="collection-right col-xl-6 col-lg-6 col-md-12 col-sm-12"><article class="collection-right-content"><h1 gscp="" gstext="">WHY DO WE USE IT?</h1></article><section class="collection-right-content"><i></i><p gscp="" gstext="">Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC</p></section><section class="collection-right-content"><i></i><p gscp="" gstext="">Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC</p></section><section class="collection-right-content"><i></i><p gscp="" gstext="">Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC</p></section></section></section><section class="body-reservation margintop-70"><article class="reservation-button gs-background-color"><h3 gscp="" gstext="">YES! CALL TO ACTION NOW!</h3><h6 gscp="" gstext="">You pay only 79.000d for shipping and handling in VN (129.000d)</h6></article></section><section class="body-review-title"><article class="review-title text-center"><h1 gscp="" gstext="">OUR TESTIMONEAL</h1><hr class="gs-border-color"><p gscp="" gstext="">Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC</p></article></section><section class="body-review-image"><img gscp="" gsimg="" src="https://ipub.vn/upload/files/201905/8344574595466675a73f9c43e4120d8f.jpeg" alt=""></section><section class="body-review-list"><section class="review-row"><section class="review-image"><img gscp="" gsimg="" src="https://ipub.vn/upload/files/201905/8344574595466675a73f9c43e4120d8f.jpeg" alt=""></section><section class="review-detail"><h6 class="name" gscp="" gstext="">Amanda Baker = Customer's name</h6><p class="address" gscp="" gstext="">Position / City</p><p class="content" gscp="" gstext="">Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC</p></section></section><section class="review-row"><section class="review-image"><img gscp="" gsimg="" src="https://ipub.vn/upload/files/201905/8344574595466675a73f9c43e4120d8f.jpeg" alt=""></section><section class="review-detail"><h6 class="name" gscp="" gstext="">Amanda Baker = Customer's name</h6><p class="address" gscp="" gstext="">Position / City</p><p class="content" gscp="" gstext="">Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC</p></section></section><section class="review-row"><section class="review-image"><img gscp="" gsimg="" src="https://ipub.vn/upload/files/201905/8344574595466675a73f9c43e4120d8f.jpeg" alt=""></section><section class="review-detail"><h6 class="name" gscp="" gstext="">Amanda Baker = Customer's name</h6><p class="address" gscp="" gstext="">Position / City</p><p class="content" gscp="" gstext="">Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC</p></section></section></section><section class="body-form"><div class="form-line gs-background-color"></div><section class="form-image"><img gscp="" gsimg="" src="https://ipub.vn/upload/files/201905/8344574595466675a73f9c43e4120d8f.jpeg" alt=""></section><section class="form-title"><article><h1 gscp="" gstext="" class="gs-font-color">Enter title form here</h1><p gscp="" gstext="">Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC</p></article></section><section class="form-input"><input type="text" class="input-field" placeholder="Enter your full name here ..."><input type="text" class="input-field" placeholder="Enter your phone numer here ..."><input type="text" class="input-field" placeholder="Enter your note here ..."></section><section class="form-button"><button class="button-field"><h1 gscp="" gstext="">CALL TO ACTION NOW!</h1></button></section><section class="form-policy"><p gscp="" gstext="">Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC</p></section></section><section class="body-review-image"><img gscp="" gsimg="" src="https://ipub.vn/upload/files/201905/8344574595466675a73f9c43e4120d8f.jpeg" alt=""></section></main><footer class="landing-page-footer gs-background-color"><article><img gscp="" gsimg="" src="https://admin.gosell.vn/assets/images/gosell-logo-white.svg" alt=""><p gscp="" gstext="">Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC. It has roots in a piece of classical Latin literature from 45 BC. It has roots in a piece of classical Latin literature from 45 BC</p></article></footer><section class="landing-page-copy-right"><p gscp="" gstext="">Copy right "your shop's name here"</p></section></section><section class="thank-you-popup" gspopup="" id="gsPopup1Id"><section class="body-form"><div class="form-line gs-background-color"></div><section class="form-image"><img gscp="" gsimg="" src="https://ipub.vn/upload/files/201905/8344574595466675a73f9c43e4120d8f.jpeg" alt=""></section><section class="form-title"><article><h1 gscp="" gstext="" class="gs-font-color">THANK YOU SO MUCH!!!</h1><p gscp="" gstext="">Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC</p></article></section><section class="form-main-image"><img gscp="" gsimg="" src="https://ipub.vn/upload/files/201905/8344574595466675a73f9c43e4120d8f.jpeg" alt=""></section><section class="form-button"><button class="button-field"><h1 gscp="" gstext="">CALL TO ACTION NOW!</h1></button></section><section class="form-policy"><p gscp="" gstext="">Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC</p></section></section></section></div>
   </body>
</html>
`
