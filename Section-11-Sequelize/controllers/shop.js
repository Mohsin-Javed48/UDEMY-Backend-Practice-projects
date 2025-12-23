const Product = require("../models/product");
const Cart = require("../models/cart.js");
const { where } = require("sequelize");

exports.getProducts = (req, res, next) => {
  Product.findAll().then((products) => {
    res.render("shop/product-list", {
      prods: products,
      pageTitle: "All Products",
      path: "/products",
    });
  });
};

exports.postCart = (req, res, next) => {
  const productId = req.body.productId;
  Product.findById("23", (product) => {
    Cart.addProduct(productId, product.price);
  });
};

exports.getProductById = (req, res, next) => {
  const productId = req.params.productId;
  Product.findAll({ where: { id: Number(productId) } }).then((product) => {
    res.render("shop/product-detail", {
      product: product[0],
      pageTitle: product[0].title,
      path: "/products",
    });
  });
};

exports.getIndex = (req, res, next) => {
  Product.findAll()
    .then((products) => {
      res.render("shop/index", {
        prods: products,
        pageTitle: "Shop",
        path: "/",
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getCart = (req, res, next) => {
  // console.log(Object.getOwnPropertyNames(req.user.__proto__));

  req.user.getCart((cart) => {
    return cart
      .getProducts()
      .then((products) => {
        res.render("shop/cart", {
          path: "/cart",
          pageTitle: "Your Cart",
          products: products,
        });
      })
      .catch((err) => console.log(err));
  });
  // Cart.getProducts((cart) => {
  //   Product.fetchAll((products) => {
  //     const cartProducts = [];
  //     for (const product of products) {
  //       const cartProductData = cart.products.find(
  //         (prod) => prod.id === product.id
  //       );

  //       if (cartProductData) {
  //         cartProducts.push({
  //           productData: product,
  //           totalQuantity: cartProductData.totalQuantity,
  //         });
  //       }
  //     }
  //     // console.log(cartProducts);

  //     res.render("shop/cart", {
  //       path: "/cart",
  //       pageTitle: "Your Cart",
  //       products: cartProducts,
  //     });
  //   });
  // });
};

exports.getOrders = (req, res, next) => {
  res.render("shop/orders", {
    path: "/orders",
    pageTitle: "Your Orders",
  });
};

exports.getCheckout = (req, res, next) => {
  res.render("shop/checkout", {
    path: "/checkout",
    pageTitle: "Checkout",
  });
};

exports.deleteCartItem = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findById(prodId, (product) => {
    Cart.deleteCart(prodId, product.price);
    res.redirect("/cart");
  });
};
