const {Model, raw} = require('objection');

module.exports = class LoyaltyCard extends Model{

    static get tableName(){
        return 'loyalty_cards';
    }

    static get jsonSchema(){
        return {
            type: 'object',
            required: ['barcode', 'date_added', 'date_modified'],

            properties: {
                id: {type: 'integer'},
                barcode: {type: 'string'},
                client_id: {type: 'integer'},
                balance: {type: 'integer'},
                date_added: {type: 'integer'},
                date_modified: {type: 'integer'}
            }
        }
    }

    static debit(barcode, amount){
        const _amount = parseInt(amount);
        return new Promise(async (resolve, reject) => {
            try {
                const card = await this.query().findOne({barcode});
                if(card){
                    if(card.balance >= _amount){
                        await this.query()
                        .patch({balance: raw('balance - ' + _amount)})
                        .where({id: card.id});
                        resolve('OK');
                    }else{
                        resolve('BALANCE_TOO_LOW');
                    }
                }else{
                    resolve('CARD_DOES_NOT_EXIST');
                }
            } catch (error) {
                reject(error);
            }
        });
    }

}