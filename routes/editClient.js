const errors = require('restify-errors');
const resMaker = require('../utils/response');
const Client = require('../models/Client');
const LoyaltyCard = require('../models/LoyaltyCard');
const PrepaidCard = require('../models/PrepaidCard');
const time = require('../utils/time');

module.exports = async (req, res, next) => {
    try {
        const data = req.body;
        const loyaltyCardId = data.loyaltyCardId;
        const prepaidCardId = data.prepaidCardId;

        // const client = await (id == 'new' ? Client.query().insert(data) : Client.query().update(data).where({id}));
        const client = await patchOrAddClient(data);

        if(loyaltyCardId){
            await LoyaltyCard.query().patch({client_id: client.id}).findById(parseInt(loyaltyCardId));
        }
        if(prepaidCardId){
            await PrepaidCard.query().patch({client_id: client.id}).findById(parseInt(prepaidCardId));
        }
        res.send(resMaker.success(client));
        next();
    } catch (error) {
        return next(new errors.InternalError('Error:017'));
    }
};

async function patchOrAddClient(data){
    const {id, phone, email, first_name, last_name} = data;

    let client = await Client.query().findOne(id == 'new' ? {phone} : {id}).eager('[prepaid, loyalty]');

    if(client){
        const patch = id == 'new' ? {first_name} : {phone, first_name, last_name, email};
        await Client.query().patch(patch).findById(client.id);
        
        for(let k in patch){
            if(!patch.hasOwnProperty(k)) continue;
            client[k] = patch[k];
        }
    }else{
        client = await Client.query().insert({
            phone, email, first_name, last_name,
            date_added: time.now(),
        });
    }

    return client;
}