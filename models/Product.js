const {Model} = require('objection');

module.exports = class Product extends Model{

    static get tableName(){
        return 'products';
    }

    static get jsonSchema(){
        return {
            type: 'object',

            properties: {
                id: 'integer',
                category_id: 'integer',
                name: 'string',
                price: 'integer',
                can_exclude_taxes: 'integer',
                product_type: 'integer'
            }
        }
    }

    static mapByCategory(products, parsePrice){
        const result = {};

        for(let i = 0; i < products.length; i++){
            const prt = products[i];
            const catID = prt.category_id;
            if(!result[catID]) result[catID] = [];
            result[catID].push(prt);
            if(parsePrice){
                prt.price = prt.price / 100;
            }
        }

        return result;
    }

    static mapById(products, parsePrice){
        const result = {};

        for(let i = 0; i < products.length; i++){
            const prt = products[i];
            result[prt.id] = prt;
            if(parsePrice){
                prt.price = prt.price / 100;
            }
        }

        return result;
    }

}