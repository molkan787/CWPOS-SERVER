const errors = require('restify-errors');
const resMaker = require('../utils/response');
const Client = require('../models/Client');
const LoyaltyCard = require('../models/LoyaltyCard');
const time = require('../utils/time');

module.exports = async (req, res, next) => {
    try {
        const data = req.body;
        const loyaltyCardId = data.loyaltyCardId;
        const id = data.id;
        delete data.id;
        delete data.loyaltyCardId;
        if(id == 'new') data.date_added = time.now();
        const client = await (id == 'new' ? Client.query().insert(data) : Client.query().update(data).where({id}));
        if(loyaltyCardId){
            await LoyaltyCard.query().patch({client_id: client.id}).findById(parseInt(loyaltyCardId));
        }
        res.send(resMaker.success(client));
        next();
    } catch (error) {
        return next(new errors.InternalError('Error:017'));
    }
};