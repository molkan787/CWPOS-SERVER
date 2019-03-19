const {Model} = require('objection');

module.exports = class UserToken extends Model{

    static get tableName(){
        return 'user_tokens';
    }

    static get jsonSchema(){
        return {
            type: 'object',
            required: ['user_id', 'token', 'date_added'],

            properties: {
                user_id: 'integer',
                token: 'string',
                date_added: 'integer',
                is_active: 'integer'
            }
        };
    }

}