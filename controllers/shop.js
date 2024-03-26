const Product = require('../models/product');
const Cart = require('../models/cart');

exports.getIndex = (req, res, next) => {
    Product.findAll()
        .then(products => {
            res.render('shop/index', { prods: products, pageTitle: 'Shop', path: '/' });
        }).catch(err => {
            console.log("Error while Fetching Data: " + err);
        });
};

exports.getProducts = (req, res, next) => {
    Product.findAll().then(products => {
        res.render('shop/product-list', { prods: products, pageTitle: 'All Products', path: '/products' });
    }).catch(err => {
        console.log("Error while Fetching Data: " + err);
    });
};

exports.getProduct = (req, res, next) => {
    productId = req.params.productId;
    Product.findByPk(productId)
        .then(product => {
            res.render('shop/product-detail', { product: product, pageTitle: product.title, path: '/products' });
        }).catch(err => {
            console.log("Error while Fetching Data of Single Product: " + err);
        });
};

exports.getCart = (req, res, next) => {
    req.user.getCart()
    .then(cart => {
        return cart.getProducts();
    }).then(products => {
        res.render('shop/cart', { pageTitle: 'Your Cart', path: '/cart', products: products });
        // res.render('shop/cart', { pageTitle: 'Your Cart', path: '/cart', products: cartProducts, totalPrice: cart.totalPrice });
    }).catch(err => {
        console.log("Error while Fetching Data: " + err);
    });
};

exports.postCart = (req, res, next) => {
    const productId = req.body.productId;
    let fetchedCart;
    let newQuantity = 1;
    req.user.getCart()
        .then(cart => {
            fetchedCart = cart;
            return cart.getProducts({ where: { id: productId } });
        })
        .then(products => {
            let product;
            if (products.length > 0) {
                product = products[0];
            }
            if (product) {
                const oldQuantity = product.cartItem.quantity;
                newQuantity = oldQuantity + 1;
                return product;
            }
            return Product.findByPk(productId);
        })
        .then(product => {
            return fetchedCart.addProduct(product, { through: { quantity: newQuantity } });
        })
        .then(() => {
            res.redirect('/cart');
        })
        .catch(err => {
            console.log("Error while Fetching Data: " + err);
        });
};

exports.getOrders = (req, res, next) => {
    req.user.getOrders({include: ['products']}).then(orders => {
        res.render('shop/orders', { pageTitle: 'All Orders', path: '/orders', orders: orders });
    }).catch(err => {
        console.log("Error while Fetching Data: " + err);
    });
};

// exports.getCheckout = (req, res, next) => {
//     res.render('shop/checkout', { pageTitle: 'Checkout', path: '/checkout' });
// };

exports.postCartDeleteProduct = (req, res, next) => {
    const productId = req.body.productId;
    req.user.getCart().then(cart =>{
        return cart.getProducts({where: {id: productId}});
    }).then(products => {
        const product = products[0];
        return product.cartItem.destroy();
    }).then(() => {
        res.redirect('/cart');
    }).catch(err => {
        console.log("Error while Deleting Product from Cart: " + err);
    });
}


exports.postOrder = (req, res, next) => {
    let fetchedCart;
    req.user.getCart()
    .then(cart => {
        fetchedCart = cart;
        return cart.getProducts();
    }).then(products => {
        return req.user.createOrder().then(order => {
            return order.addProducts(products.map(product => {
                product.orderItem = { quantity: product.cartItem.quantity };
                return product;
            }));
        }).catch(err => {
            console.log("Error while Creating Order: " + err);
        });
    }).then(() => {
        return fetchedCart.setProducts(null);
    }).then(() => {
        res.redirect('/orders');
    }).catch(err => {
        console.log("Error while Fetching Data: " + err);
    });
};