const errors = require('restify-errors');
const LoyaltyCard = require('../models/LoyaltyCard');
const Client = require('../models/Client');
const time = require('../utils/time');
const resMaker = require('../utils/response');

module.exports = async (req, res, next) => {
    const action = req.params.action;
    try {
        switch (action) {
            case 'add':
                res.send(await addCard(req.body));
                break;
            case 'del':
                res.send(await deleteCard(req.body));
                break;
        
            default:
                return next(new errors.NotFoundError('Unknow request path'));
        }
        next();
    } catch (error) {
        return next(new errors.InternalError('ERROR:006' + error));
    }
};

async function addCard(data){
    try {
        let {barcode, clientId, clientData} = data;
        const existingCard = await LoyaltyCard.query().findOne({barcode});
        if(existingCard){
            return resMaker.fail('CARD_EXIST');
        }
        if(!clientId){
            if(clientData && clientData.phone)
                clientId = await Client.getClientId(clientData);
            else
                clientId = 0;
        }
        const card = await LoyaltyCard.query().insert({
            barcode,
            client_id: clientId,
            date_added: time.now(),
            date_modified: time.now(),
        });
        return resMaker.success({cardId: card.id});
    } catch (error) {
        throw new Error('Unknow error, Probably received data was invalid' + error);
    }

}

async function deleteCard(payload){
    const id = parseInt(payload.id);
    await LoyaltyCard.query().deleteById(id);
    return resMaker.success();
}