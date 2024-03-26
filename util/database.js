const Sequelize = require('sequelize');

const sequelize = new Sequelize('node-complete', 'root', '312004lakshya', {
    // 'dialect' and 'host' are optional (given parameters are default values)
    dialect: 'mysql',
    host: 'localhost'
});

module.exports = sequelize;