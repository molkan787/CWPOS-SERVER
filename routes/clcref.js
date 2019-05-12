const errors = require('restify-errors');
const resMaker = require('../utils/response');
const Client = require('../models/Client');
const LoyaltyCard = require('../models/LoyaltyCard');

module.exports = async (req, res, next) => {
    try {
        const {by, ref} = req.params;
        if(by == 'phone'){
            const clientData = await getClient(ref);
            if(clientData){
                res.send(resMaker.success({clientData}));
            }else{
                res.send(resMaker.fail('NOT_FOUND'));
            }
        }else if(by == 'loyalty_card'){
            const loyaltyCard = await getLoyaltyCard(ref);
            if(loyaltyCard){
                res.send(resMaker.success({loyaltyCard}));
            }else{
                res.send(resMaker.fail('NOT_FOUND'));
            }
        }

        next();
    } catch (error) {
        next(new errors.InternalError('Error:008'));
    }
};

async function getClient(phone){
    const clientData = await Client.query().findOne({phone}).eager('[loyalty, prepaid]');
    if(clientData){
        clientData.history = await Client.getClientHostory(clientData.id);
    }
    return clientData;
}

async function getLoyaltyCard(barcode){
    const card = await LoyaltyCard.query().findOne({barcode}).eager('[client.prepaid]');
    if(card && card.client && card.client.id){
        card.client.history = await Client.getClientHostory(card.client.id);
    }
    return card;
}