'use strict'

let Promise         = require('bluebird');

let utils           = require('./utils');
let coupon          = require('./coupon');
let responseMessage = require('./responseMessage');

exports.calculateCartCoupon = calculateCartCoupon;

function calculateCartCoupon(cart_items, coupon_code, outlet_id, callback){
    // check if input params are valid
    let isVerified = utils.checkIfParamsPresent(cart_items, coupon_code, outlet_id);
    
    if(!isVerified.valid){
        return callback(null, isVerified);
    }

    Promise.coroutine(function*(){
        // fetch coupons list from url
        let couponCodes = yield coupon.fetchCouponsList();
        // match the entered coupon_code from the coupon list
        let couponInfo = coupon.findCouponCode(couponCodes, coupon_code.toUpperCase(), outlet_id);
        // calculate discount on the coupon applied
        return coupon.calculateCouponByType(couponInfo, cart_items);
        
    })()
    .then(couponResult => {
        return callback(null, {
            valid: true,
            message: responseMessage.COUPON_APPLIED,
            discount: couponResult.discount || 0,
            cashback: couponResult.cashback || 0
        });
    })
    .catch(error => {
        return callback(null, {
            valid: false,
            message: error.message || responseMessage.ERROR_MESSAGE
        });
    })
}