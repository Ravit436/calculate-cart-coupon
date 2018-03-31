'use strict'

let request                 = require('request');
let redis                   = require('redis');
let moment                  = require('moment');

let discount                = require('./discount');
let responseMessage         = require('./responseMessage');

let client                  = redis.createClient();

exports.fetchCouponsList    = fetchCouponsList;
exports.findCouponCode      = findCouponCode;
exports.calculateCouponByType = calculateCouponByType;

function fetchCouponsList(){
    return new Promise((resolve, reject) => {
        client.get('couponCode', (error, data) => {
            if(error){
                return reject(error);
            }

            if(data){
                // fetching cached response
                let coupons = JSON.parse(data);
                return resolve(coupons.coupon_codes);
            }

            let url = 'https://gist.githubusercontent.com/mntdamania/9a74afefbbc7e853fb84146d3c81676d/raw/0ae8aa2846dcf1fadb02dc605126e9ea3b8676ae/coupon_codes.json';
        
            request(url, function(error, response, body){
                if(error){
                    return reject(error);
                }
    
                // parse stringified object
                try{
                    let coupons = JSON.parse(body);
                    // setting cached response
                    client.set('couponCodes', body);
                    return resolve(coupons.coupon_codes);
                }
                catch(e){
                    return reject(new Error(responseMessage.COUPON_FETCH_FAILED));
                }
            });
        });
    });
}

function findCouponCode(couponCodesList, couponCode, outletId){
    let couponIndex = couponCodesList.findIndex(coupon => coupon.code === couponCode);
    // check if the coupon exists
    if(~couponIndex){
        let couponInfo = couponCodesList[couponIndex];
        // check if the coupon has expired or is inactive
        isCouponExpired(couponInfo);
        // check if the coupon is valid for the specified outlet
        checkCouponOutlet(couponInfo, outletId);
        return couponInfo;
    }
    throw new Error(responseMessage.NO_COUPON_EXISTS);;
}

function isCouponExpired(couponInfo){
    if(!couponInfo.active){
        throw new Error(responseMessage.COUPON_DISABLED);
    }

    let currentDate = moment().format('YYYY-MM-DD');
    if(!(couponInfo.start_date <= currentDate && couponInfo.end_date >= currentDate)){
        throw new Error(responseMessage.COUPON_EXPIRED);
    }
}

function checkCouponOutlet(couponInfo, outletId){
    let applicableOutletIds = couponInfo.applicable_outlet_ids;
    let outletIndex = applicableOutletIds.indexOf(outletId);
    // check if the coupon exists for this outlet or is applied everywhere
    if(applicableOutletIds.length && !~outletIndex){
        throw new Error(responseMessage.COUPON_OUTLET_ISSUE);
    }
}

function calculateCouponByType(couponInfo, cartItems){

    // call the function on the basis of coupon type
    let couponTypes = {
        "Percentage"            : discount.calculatePercentageCoupon,
        "Discount"              : discount.calculateDiscountCoupon,
        "Discount&Cashback"     : discount.calculateDiscountAndCBCoupon,
        "Percentage&Cashback"   : discount.calculatePercentageAndCBCoupon,
        "Bogo"                  : discount.calculateBogoCoupon
    };
    return couponTypes[couponInfo.type] (couponInfo, cartItems);
}
