const {Model} = require('objection');

module.exports = class Order extends Model{

    static get tableName(){
        return 'orders';
    }

    static get jsonSchema(){
        return {
            type: 'object',

            properties: {
                id: 'integer',
                user_id: 'integer',
                client_id: 'integer',
                total: 'integer',
                pay_method: 'string',
                totals: 'object',
                
            }
        };
    }

}