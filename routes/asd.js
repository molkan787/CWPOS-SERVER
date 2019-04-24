const errors = require('restify-errors');
const Category = require('../models/Category');
const Product = require('../models/Product');
const Stats = require('../models/Stats');
const Client = require('../models/Client');
const Settings = require('../models/Settings');

module.exports = async (req, res, next) => {
    try {
        const categories = await Category.query();
        const products = await Product.query();
        const stats = await Stats.getTodays();
        const companies = await Client.query().where({is_company: 1});
        const settings = await Settings.getValues();
        res.send({
            categories,
            products: products,
            stats,
            companies,
            settings,
        });
        next();
    } catch (error) {
        return next(new errors.InternalError('Error:002 '));
    }
};