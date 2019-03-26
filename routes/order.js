const errors = require('restify-errors');
const Order = require('../models/Order');
const Stats = require('../models/Stats');
const Invoice = require('../models/Invoice');
const time = require('../utils/time');

module.exports = async (req, res, next) => {
    const {orderData, stats} = req.body;
    orderData.date_added = time.now();
    try {
        const _order = await Order.query().insert(orderData);
        await Stats.add(stats);
        if(orderData.pay_method == 'invoice_ari'){
            await Invoice.addInvoice(_order);
        }
        res.send({status: 'OK'});
        next();
    } catch (error) {
        // console.log(error);
        return next(new errors.InternalError('Error:004'));
    }
};