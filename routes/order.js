const errors = require('restify-errors');
const Order = require('../models/Order');
const Stats = require('../models/Stats');
const time = require('../utils/time');

module.exports = async (req, res, next) => {
    const {orderData, stats} = req.body;
    orderData.date_added = time.now();
    try {
        await Order.query().insert(orderData);
        await Stats.add(stats);
        res.send({status: 'OK'});
        next();
    } catch (error) {
        // console.log(error);
        return next(new errors.InternalError('Error:004'));
    }
};