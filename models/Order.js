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
                other_data: {type: 'object'},
                receipt: {type: 'integer'},
                date_added: {type: 'integer'},
            }
        };
    };

    static get relationMappings(){
        return {
            client: {
                relation: Model.BelongsToOneRelation,
                modelClass: __dirname + '/Client',
                join: {
                    from: 'orders.client_id',
                    to: 'clients.id'
                }
            },
            cashier: {
                relation: Model.BelongsToOneRelation,
                modelClass: __dirname + '/User',
                join: {
                    from: 'orders.user_id',
                    to: 'users.id'
                }
            }
        };
    }


}