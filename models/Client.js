const {Model} = require('objection');
const time = require('../utils/time');

module.exports = class Client extends Model{

    static get tableName(){
        return 'clients'
    }

    static get jsonSchema(){
        return {
            type: 'object',
            required: ['phone', 'first_name', 'date_added'],

            properties: {
                id: {type: 'integer'},
                is_company: {type: 'integer'},
                phone: {type: 'string'},
                email: {type: 'string'},
                first_name: {type: 'string'},
                first_name: {type: 'string'},
                want_receipt: {type: 'integer'},
                date_added: {type: 'integer'},
            }
        }
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

}