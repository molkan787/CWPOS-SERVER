const errors = require('restify-errors');
const resMaker = require('../utils/response');
const Client = require('../models/Client');
const time = require('../utils/time');

module.exports = async (req, res, next) => {
    try {
        const data = req.body;
        const id = data.id;
        delete data.id;
        if(id == 'new') data.date_added = time.now();
        const client = await (id == 'new' ? Client.query().insert(data) : Client.query().update(data).where({id}));
        res.send(resMaker.success(client));
        next();
    } catch (error) {
        return next(new errors.InternalError('Error:017'));
    }
};