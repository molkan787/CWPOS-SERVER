const errors = require('restify-errors');
const resMaker = require('../utils/response');
const PrepaidCard = require('../models/PrepaidCard');
const LoyaltyCard = require('../models/LoyaltyCard');

module.exports = async (req, res, next) => {
    try {
        const {type, id, balance} = req.body;
        await setCardBalance(type, id, balance);
        res.send(resMaker.success());
        next();
    } catch (error) {
        return next(new errors.InternalError('Error:021'));
    }
};

async function setCardBalance(type, id, balance){
    const Model = type == 'prepaid' ? PrepaidCard : LoyaltyCard;
    await Model.query().patch({balance}).findById(id);
}