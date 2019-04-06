const errors = require('restify-errors');
const Order = require('../models/Order');
const Stats = require('../models/Stats');
const Invoice = require('../models/Invoice');
const PrepaidCard = require('../models/PrepaidCard');
const LoyaltyCard = require('../models/LoyaltyCard');
const Transaction = require('../models/Transaction');
const time = require('../utils/time');

module.exports = async (req, res, next) => {
    const {orderData, stats, payment} = req.body;
    orderData.date_added = time.now();
    try {
        const _order = await Order.query().insert(orderData);
        await Stats.add(stats);
        if(orderData.pay_method == 'invoice_ari'){
            await Invoice.addInvoice(_order);
        }
        if(payment){
            await addTransaction(payment, _order);
        }
        res.send({status: 'OK', nextOrderId: _order.id + 1});
        next();
    } catch (error) {
        console.log(error);
        return next(new errors.InternalError('Error:004'));
    }
};

async function addTransaction(payment, order){
    const barcode = payment.barcode;
    let cardId = 0;
    if(payment.type == 'prepaid'){
        const card = await PrepaidCard.query().findOne({barcode});
        if(card) cardId = card.id;
    }else if(payment.type == 'loyalty'){
        const card = await LoyaltyCard.query().findOne({barcode});
        if(card) cardId = card.id;
    }else{
        return;
    }

    await Transaction.query().insert({
        order_id: order.id,
        xtype: payment.type,
        xamount: order.total,
        ref_code: cardId,
        client_id: order.client_id,
        date_added: time.now(),
    });
}