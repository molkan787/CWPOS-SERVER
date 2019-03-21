const {Model} = require('objection');

module.exports = class Order extends Model{

    static get tableName(){
        return 'orders';
    }

    static get jsonSchema(){
        return {
            type: 'object',
            required: ['user_id', 'client_id', 'total', 'pay_method', 'totals', 'items', 'date_added'],

            properties: {
                id: {type: 'integer'},
                user_id: {type: 'integer'},
                client_id: {type: 'integer'},
                total: {type: 'integer'},
                pay_method: {type: 'string'},
                totals: {type: 'object'},
                items: {type: 'object'},
                receipt: {type: 'integer'},
                date_added: {type: 'integer'},
            }
        };
    }

}