const errors = require('restify-errors');
const resMaker = require('../utils/response');
const Client = require('../models/Client');
const wb = require('../utils/whereBuilder');

module.exports = async (req, res, next) => {
    try {
        const offset = req.body.offset || 0;
        const phone = (req.body.phone || '').replace(/\s/g, '');
        const clients = await Client.query().where({is_company: 0})
        .andWhere(wb.dateRange(req.body)).andWhere('phone', 'like', `%${phone}%`)
        .offset(offset).limit(10).orderBy('id', 'DESC');
        res.send(resMaker.success({items: clients}));
        next();
    } catch (error) {
        return next(new errors.InternalError('ERROR:011'));
    }
};