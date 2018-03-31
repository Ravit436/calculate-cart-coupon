'use strict'

let cart = require('./routes/cart');

let cartItems = [
    {
        "product_id": 1,
        "quantity": 1,
        "unit_cost": 500
    },
    {
        "product_id": 1,
        "quantity": 2,
        "unit_cost": 191
    }
];

let couponCode = 'BOX8LOVE';

let outletId = 100;

// there was no description about how cashback to be calculated so I calculated it same as discount
cart.calculateCartCoupon(cartItems, couponCode, outletId, function(error, response){
    if(error){
        console.error(error);
    }
    console.log(response)
});
