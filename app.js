//* Run: npm start -or- node app.js
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const errorController = require('./controllers/error');
const sequelize = require('./util/database');
const Product = require('./models/product');
const User = require('./models/user');
const Cart = require('./models/cart');
const CartItem = require('./models/cart-item');
const Order = require('./models/order');
const OrderItem = require('./models/order-item');

//* Creating Express App
const app = express();

//* Setting Template Engine
app.set('view engine', 'ejs');
app.set('views', 'views');

//* Middleware to parse body
app.use(bodyParser.urlencoded({ extended: false }));

//* Middleware to serve static files
app.use(express.static(path.join(__dirname, 'public')));

//* Middlewares to store user in request
app.use((req, res, next) => {
    //this middleware will run for every incoming request
    //it will fetch the user from database and store it in request object
    //so that we can use it in request handlers.
    User.findByPk(1)
        .then(user => {
            req.user = user;
            next();
        })
        .catch(err => {
            console.log("Error while Fetching User: " + err);
        });
});
app.use('/admin', adminRoutes); // Filter for admin routes
app.use(shopRoutes); // Filter for shop routes
app.use(errorController.get404); // Filter for 404 routes

//* Defining Relationships
Product.belongsTo(User, { constraints: true, onDelete: 'CASCADE' });
User.hasMany(Product);

User.hasOne(Cart);
Cart.belongsTo(User);

Cart.belongsToMany(Product, { through: CartItem });
Product.belongsToMany(Cart, { through: CartItem });

Order.belongsTo(User);
User.hasMany(Order);

Order.belongsToMany(Product, { through: OrderItem });
Product.belongsToMany(Order, { through: OrderItem });



//* Creating Table
// sequelize.sync({ force: true }).then(result => {
sequelize.sync().then(result => {
    // Creating User
    return User.findByPk(1);
}).then(user => {
    if (!user) {
        return User.create({ name: 'Lakshya', email: 'lakshya312004@gmail.com' });
        
    }
    return user;
}).then(user => {
    Cart.findOne({ where: { userId: user.id } }).then(cart => {
        if (!cart) {
            return user.createCart();
        }
        return cart;
    });
}).then(user => {
    app.listen(3000, () => {
        console.log('Server is running on port 3000');
    });
}).catch(err => {
    console.log("Error while syncing database: " + err);
});