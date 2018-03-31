'use strict'

let responseMessage = require('./responseMessage');

exports.checkIfParamsPresent = checkIfParamsPresent;

function checkIfParamsPresent(cart_items, coupon_code, outlet_id){
    if(!Array.isArray(cart_items) || (Array.isArray(cart_items) && !cart_items.length)){
        return {
            valid: false,
            message: responseMessage.NO_ITEMS
        };
    }

    if(!coupon_code){
        return {
            valid: false,
            message: responseMessage.NO_COUPON
        };
    }

    if(!outlet_id){
        return {
            valid: false,
            message: responseMessage.NO_OUTLET
        };
    }

    return {
        valid: true
    };
}