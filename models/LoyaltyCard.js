const {Model} = require('objection');

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

}