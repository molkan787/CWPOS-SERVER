const { Model } = require('objection');
const Knex = require('knex');

module.exports = function (){
    // Initialize knex.
    const knex = require('knex')({
        client: 'mysql2',
        connection: {
        host : '127.0.0.1',
        user : 'm_user',
        password : 'pwd123',
        database : 'apos'
        }
    });

    // Give the knex object to objection.
    Model.knex(knex);

    console.log('MySQL: Connected');
}
