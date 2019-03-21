const {Model} = require('objection');

module.exports = class Product extends Model{

    static get tableName(){
        return 'products';
    }

    static get jsonSchema(){
        return {
            type: 'object',

            properties: {
                id: {type: 'integer'},
                category_id: {type: 'integer'},
                name: {type: 'string'},
                price: {type: 'integer'},
                can_exclude_taxes: {type: 'integer'},
                product_type: {type: 'integer'}
            }
        }
    }

}