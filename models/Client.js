const {Model, raw} = require('objection');
const time = require('../utils/time');
const {sqlEscape} = require('../utils/utils');
const Order = require('./Order');

module.exports = class Client extends Model{

    static get tableName(){
        return 'clients'
    }

    static get jsonSchema(){
        return {
            type: 'object',
            required: ['first_name'],

            properties: {
                id: {type: 'integer'},
                is_company: {type: 'integer'},
                phone: {type: 'string'},
                email: {type: 'string'},
                first_name: {type: 'string'},
                last_name: {type: 'string'},
                want_receipt: {type: 'integer'},
                date_added: {type: 'integer'},
            }
        }
    }

    static get relationMappings(){
        return {
            prepaid: {
                relation: Model.BelongsToOneRelation,
                modelClass: __dirname + '/PrepaidCard',
                join: {
                    from: 'prepaid_cards.client_id',
                    to: 'clients.id'
                }
            },
            loyalty: {
                relation: Model.BelongsToOneRelation,
                modelClass: __dirname + '/LoyaltyCard',
                join: {
                    from: 'loyalty_cards.client_id',
                    to: 'clients.id'
                }
            },
        };
    }

    static async getClientId(clientData){
        const {phone, first_name, last_name, email, is_company} = clientData;
        let client = await Client.query().findOne({phone});
        if(client){
            return client.id;
        }
        client = await Client.query().insert({
                phone,
                first_name,
                last_name,
                email,
                is_company,
                date_added: time.now()
        });
        return client.id;
    }

    static async getClientHostory(clientId){
        try {
            const result = [];
            const orders = await Order.query().where({client_id: clientId}).orderBy('id', 'DESC').limit(6);
            if(orders){
                for(let i = 0; i < orders.length; i++){
                    const _order = orders[i];
                    result.push({
                        date: time.timestampToDate(_order.date_added),
                        amount: _order.total / 100,
                        receipt: _order.receipt,
                    });
                }
            }
            return result;
        } catch (error) {
            throw new Error(error);
        }
    }

    static async getCompanyIdByName(name){
        let company = await this.query().findOne(raw(`LOWER(first_name) = '${sqlEscape(name)}'`));
        if(!company){
            company = await this.query().insert({
                phone: '',
                first_name: name,
                last_name: '',
                email: '',
                is_company: 1,
                date_added: time.now(),
            });
        }
        return company.id;
    }

}