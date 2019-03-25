const errors = require('restify-errors');
const PrepaidCard = require('../models/PrepaidCard');
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
            case 'reload':
                res.send(await reloadCard(req.body));
                break;
        
            default:
                return next(new errors.NotFoundError('Unknow request path'));
        }
        next();
    } catch (error) {
        return next(new errors.InternalError('ERROR:005' + error));
    }
};

async function reloadCard(data){
    try {
        const {barcode, amount} = data;
        const card = await PrepaidCard.query().findOne({barcode});
        if(!card) return resMaker.fail('CARD_DOES_NOT_EXIST');
        await PrepaidCard.addBalance(card.id, amount);
        return resMaker.success();
    } catch (error) {
        throw new Error(error.message);
    }
}

async function addCard(data){
    try {
        let {barcode, balance, clientId, clientData} = data;
        const existingCard = await PrepaidCard.query().findOne({barcode});
        if(existingCard){
            return resMaker.fail('CARD_EXIST');
        }
        if(!clientId){
            if(clientData && clientData.phone)
                clientId = await Client.getClientId(clientData);
            else
                clientId = 0;
        }
        const card = await PrepaidCard.query().insert({
            barcode,
            balance,
            client_id: clientId,
            date_added: time.now(),
            date_modified: time.now(),
        });
        return resMaker.success({cardId: card.id});
    } catch (error) {
        throw new Error('Unknow error, Probably received data was invalid' + error);
    }

}