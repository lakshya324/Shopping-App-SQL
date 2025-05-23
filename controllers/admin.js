const Product = require('../models/product');

exports.getAddProduct = (req, res, next) => {
    res.render('admin/edit-product', { pageTitle: 'Add Product', path: '/admin/add-product', editing: false });
};

exports.postAddProduct = (req, res, next) => {
    const title = req.body.title;
    const imageUrl = req.body.imageUrl;
    const description = req.body.description;
    const price = req.body.price;
    req.user.createProduct({
        title: title,
        price: price,
        imageUrl: imageUrl,
        description: description
    })
        .then(result => {
            console.log("Product Created Successfully");
            res.redirect('/admin/products');
        }
        )
        .catch(err => {
            console.log("Error while Inserting Data: " + err);
        });
};

exports.getEditProduct = (req, res, next) => {
    const editMode = req.query.edit;
    if (!editMode) {
        return res.redirect('/');
    }
    const productId = req.params.productId;
    req.user.getProducts({ where: { id: productId } })
        .then(products => {
            const product = products[0];
            if (!product) {
                return res.redirect('/');
            }
            res.render('admin/edit-product', {
                pageTitle: 'Edit Product',
                path: '/admin/edit-product',
                editing: editMode,
                product: product
            });
        })
        .catch(err => {
            console.log("Error while Fetching Data of Single Product: " + err);
        });
};

exports.postEditProduct = (req, res, next) => {
    const productId = req.body.productId;
    const updatedTitle = req.body.title;
    const updatedImageUrl = req.body.imageUrl;
    const updatedDescription = req.body.description;
    const updatedPrice = req.body.price;
    req.user.getProducts({ where: { id: productId } })
        .then(products => {
            const product = products[0];
            product.title = updatedTitle;
            product.price = updatedPrice;
            product.imageUrl = updatedImageUrl;
            product.description = updatedDescription;
            return product.save();
        })
        .then(result => {
            console.log("Product Updated Successfully! [Product ID: " + productId + "]");
            res.redirect('/admin/products');
        })
        .catch(err => {
            console.log("Error while Updating Data: " + err);
        });
};

exports.getProducts = (req, res, next) => {
    req.user.getProducts()
        .then(products => {
            res.render('admin/products', { prods: products, pageTitle: 'Admin Products', path: 'admin/products' });
        }).catch(err => {
            console.log("Error while Fetching Data: " + err);
        });
};

exports.postDeleteProduct = (req, res, next) => {
    const productId = req.body.productId;
    req.user.getProducts({ where: { id: productId } })
        .then(products => {
            const product = products[0];
            return product.destroy();
        })
        .then(result => {
            console.log("Product Deleted Successfully! [Product ID: " + productId + "]");
            res.redirect('/admin/products');
        })
        .catch(err => {
            console.log("Error while Deleting Data: " + err);
        });
};