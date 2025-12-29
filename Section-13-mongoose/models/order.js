const mongoose = require("mongoose");

const schema = mongoose.Schema;

const orderSchema = new schema({
  user: {
    userId: { type: schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
  },
  products: [
    {
      product: {
        type: Object,
        ref: "Product",
        required: true,
      },
      quantity: { type: Number, required: true },
    },
  ],
});

module.exports = mongoose.model("Order", orderSchema);
