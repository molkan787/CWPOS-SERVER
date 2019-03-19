const errors = require('restify-errors');
const Category = require('../models/Category');
const Product = require('../models/Product');
const Stats = require('../models/Stats');

module.exports = async (req, res, next) => {
    try {
        const categories = await Category.query();
        const products = await Product.query();
        const stats = await Stats.getTodays();
        res.send({
            categories,
            products: Product.mapByCategory(products, true),
            productsByIds: Product.mapById(products),
            stats
        });
        next();
    } catch (error) {
        next(new errors.InternalError('Error:002 ' + error));
    }
};