const fs = require("fs");
const path = require("path");

const p = path.join(
  path.dirname(process.mainModule.filename),
  "data",
  "cart.json" // ❌ removed leading space
);

module.exports = class Cart {
  static addProduct(id, productPrice) {
    // Fetch the previous cart
    fs.readFile(p, (err, fileContent) => {
      let cart = { products: [], totalPrice: 0 };

      if (!err && fileContent.length > 0) {
        try {
          cart = JSON.parse(fileContent);
        } catch (e) {
          console.log("Cart JSON corrupted, resetting...");
        }
      }

      const existingProductIndex = cart.products.findIndex(
        (prod) => prod.id === id
      );

      let updatedProduct;

      if (existingProductIndex >= 0) {
        const existingProduct = cart.products[existingProductIndex];

        updatedProduct = {
          ...existingProduct,
          totalQuantity: existingProduct.totalQuantity + 1,
        };

        cart.products[existingProductIndex] = updatedProduct;
      } else {
        updatedProduct = {
          id,
          totalQuantity: 1,
        };

        cart.products.push(updatedProduct);
      }

      // ALWAYS ensure totalPrice exists
      cart.totalPrice = Number(cart.totalPrice) + Number(productPrice);

      fs.writeFile(p, JSON.stringify(cart), (err) => {
        if (err) console.log(err);
      });
    });
  }

  static getProducts = (cb) => {
    fs.readFile(p, (err, fileContent) => {
      const cart = JSON.parse(fileContent);
      if (err) {
        console.log(err);
      } else {
        cb(cart);
      }
    });
  };

  static deleteCart = (id, price) => {
    Cart.getProducts((cart) => {
      const product = cart.products.find((p) => p.id === id);

      if (product) {
        cart.products = cart.products.filter((p) => p.id !== product.id);
        cart.totalPrice = cart.totalPrice - price;
        fs.writeFile(p, JSON.stringify(cart), (err) => {
          console.log(err);
        });
      } else {
        console.log("product does not exist to delete!!");
      }
    });
  };
};
