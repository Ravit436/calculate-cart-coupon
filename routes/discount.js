'use strict'

let responseMessage = require('./responseMessage');

exports.calculatePercentageCoupon       = calculatePercentageCoupon;
exports.calculateDiscountCoupon         = calculateDiscountCoupon;
exports.calculateDiscountAndCBCoupon    = calculateDiscountAndCBCoupon;
exports.calculatePercentageAndCBCoupon  = calculatePercentageAndCBCoupon;
exports.calculateBogoCoupon             = calculateBogoCoupon;

function calculatePercentageCoupon(couponInfo, cartItems){
    let cartAmount = calculateCart(cartItems);
    return {
        discount: calculatePercentDiscount(cartAmount, couponInfo),
        cashback: 0
    }
}

function calculateDiscountCoupon(couponInfo, cartItems){
    let cartAmount = calculateCart(cartItems);
    return {
        discount: calculateDiscount(cartAmount, couponInfo),
        cashback: 0
    }
}

function calculateDiscountAndCBCoupon(couponInfo, cartItems){
    let cartAmount = calculateCart(cartItems);
    return {
        discount: calculateDiscount(cartAmount, couponInfo),
        cashback: calculateCashback(cartAmount, couponInfo)
    }
}

function calculatePercentageAndCBCoupon(couponInfo, cartItems){
    let cartAmount = calculateCart(cartItems);
    return {
        discount: calculatePercentDiscount(cartAmount, couponInfo),
        cashback: calculateCashback(cartAmount, couponInfo)
    }
}

function calculateBogoCoupon(couponInfo, cartItems){
    let cartQuantity = calculateCartQuantity(cartItems);
    return {
        discount: calculateBogo(cartQuantity, cartItems, couponInfo),
        cashback: 0
    }
}

function calculateCart(cartItems){
    return cartItems.reduce((cartAmount, cartItem) => {
        return cartAmount + cartItem.quantity * cartItem.unit_cost;
    }, 0);
}

function calculatePercentDiscount(cartAmount, couponInfo){
    let discountValue = parseFloat((couponInfo.value * cartAmount / 100).toFixed(1));
    let minDeliveryAmtAftDiscount = couponInfo.minimum_delivery_amount_after_discount;
    let maximumDiscount = couponInfo.maximum_discount;
    let maxDiscount = Math.min(discountValue, maximumDiscount);

    if(cartAmount < minDeliveryAmtAftDiscount){
        throw new Error(responseMessage.CART_DELIVERY_AMOUNT_ISSUE);
    }
    return Math.min(maxDiscount, Math.max(cartAmount - minDeliveryAmtAftDiscount, 0));
}

function calculateDiscount(cartAmount, couponInfo){
    let discountValue = couponInfo.value;
    let minDeliveryAmtAftDiscount = couponInfo.minimum_delivery_amount_after_discount;
    let maximumDiscount = couponInfo.maximum_discount;
    // here discountValue will be equal to maximumDiscount

    if(cartAmount < minDeliveryAmtAftDiscount){
        throw new Error(responseMessage.CART_DELIVERY_AMOUNT_ISSUE);
    }
    return Math.min(maximumDiscount, Math.max(cartAmount - minDeliveryAmtAftDiscount, 0));
}

function calculateCashback(cartAmount, couponInfo){
    let discountValue = couponInfo.cashback_value;
    let minDeliveryAmtAftDiscount = couponInfo.minimum_delivery_amount_after_discount;
    let maximumDiscount = couponInfo.maximum_discount;
    // here discountValue will be equal to maximumDiscount

    if(cartAmount < minDeliveryAmtAftDiscount){
        throw new Error(responseMessage.CART_DELIVERY_AMOUNT_ISSUE);
    }
    return Math.min(maximumDiscount, Math.max(cartAmount - minDeliveryAmtAftDiscount, 0));
}

function calculateCartQuantity(cartItems){
    return cartItems.reduce((cartAmount, cartItem) => {
        return cartAmount + cartItem.quantity;
    }, 0);
}

function calculateBogo(cartQuantity, cartItems, couponInfo){
    if(!cartQuantity){
        throw new Error(responseMessage.BOGO_CART_LENGTH);
    }

    let cartAmount = calculateCart(cartItems);
    let minDeliveryAmtAftDiscount = couponInfo.minimum_delivery_amount_after_discount;

    if(cartAmount < minDeliveryAmtAftDiscount){
        throw new Error(responseMessage.CART_DELIVERY_AMOUNT_ISSUE);
    }

    cartItems.sort((a, b) => a.unit_cost - b.unit_cost );

    let bogoCartQuantity = Math.floor(cartQuantity / 2);

    let discountValue = 0;
    for(let i = 0; i < cartItems.length; i++){
        let cartItem = cartItems[i];
        if(bogoCartQuantity > 0){
            discountValue += cartItem.unit_cost * Math.min(bogoCartQuantity, cartItem.quantity);
            bogoCartQuantity -= cartItem.quantity;
        }
        else{
            break;
        }
    }

    let maximumDiscount = couponInfo.maximum_discount;
    let maxDiscount = Math.min(discountValue, maximumDiscount);

    return Math.min(maxDiscount, Math.max(cartAmount - minDeliveryAmtAftDiscount, 0));
}