const {Model} = require('objection');

module.exports = class User extends Model{

    static get tableName(){
        return 'users';
    }

    static get jsonSchema(){
        return {
            type: 'object',

            properties: {
                id: 'integer',
                user_type: 'integer',
                username: 'string',
                password: 'string',
                first_name: 'string',
                last_name: 'string',
                date_added: 'integer',
                is_active: 'integer'
            }
        };
    }

}