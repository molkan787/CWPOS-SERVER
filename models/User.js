const {Model} = require('objection');

module.exports = class User extends Model{

    static get tableName(){
        return 'users';
    }

    static get jsonSchema(){
        return {
            type: 'object',

            properties: {
                id: { type: 'integer' },
                user_type: { type: 'integer' },
                username: { type: 'string' },
                password: { type: 'string' },
                first_name: { type: 'string' },
                last_name: { type: 'string' },
                date_added: { type: 'integer' },
                is_active: { type: 'integer' }
            }
        };
    }

}