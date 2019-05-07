const errors = require('restify-errors');
const Order = require('../models/Order');
const Client = require('../models/Client');
const Stats = require('../models/Stats');
const Invoice = require('../models/Invoice');
const PrepaidCard = require('../models/PrepaidCard');
const LoyaltyCard = require('../models/LoyaltyCard');
const Transaction = require('../models/Transaction');
const time = require('../utils/time');
const Action = require('../Actions/Action');
const AC = require('../Actions/ActionConsts');

module.exports = async (req, res, next) => {
    const {orderData, stats, payment, invoiceData, loyaltyCardId, actions} = req.body;
    orderData.date_added = time.now();

    try {
        if(orderData.pay_method == 'invoice_ari' && invoiceData.clientName){
            orderData.client_id = await Client.getCompanyIdByName(invoiceData.clientName);
        }

        const _order = await Order.query().insert(orderData);
        await Stats.add(stats);
        if(orderData.pay_method == 'invoice_ari'){
            await Invoice.addInvoice(_order);
        }
        if(payment){
            await addTransaction(payment, _order);
        }
        
        if(loyaltyCardId > 0){
            if(!payment || (payment.type != 'prepaid' && payment.type != 'loyalty')) {
                // Adding 10% of the orde value to loyalty points
                const points = orderData.total / 10;
                LoyaltyCard.addValue(loyaltyCardId, points);
                Action.add(AC.GROUP_ORDER, AC.TYPE_LOYALTY_POINT_ADD, {
                    ref1: _order.id,
                    ref2: loyaltyCardId,
                }, points);
            }
        }

        if(actions && actions.length){
            patchActions(_order.id, actions);
        }

        res.send({status: 'OK', nextOrderId: _order.id + 1, date_added: orderData.date_added});
        next();
    } catch (error) {
        console.log(error);
        return next(new errors.InternalError('Error:004'));
    }
};

async function addTransaction(payment, order){
    let axType = 0;
    const barcode = payment.barcode;
    let cardId = 0;
    if(payment.type == 'prepaid'){
        axType = AC.TYPE_PREPAID_DEBIT;
        const card = await PrepaidCard.query().findOne({barcode});
        if(card) cardId = card.id;
    }else if(payment.type == 'loyalty'){
        axType = AC.TYPE_LOYALTY_DEBIT;
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

    await Action.add(AC.GROUP_ORDER, axType, {
        ref1: order.id,
        ref2: cardId,
    }, order.total);
}

async function patchActions(orderId, ids){
    await Action.patch({ref1: orderId}, ids);
}