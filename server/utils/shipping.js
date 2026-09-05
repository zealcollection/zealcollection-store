// Shipping cost calculation matching the frontend blueprint:
// - Free standard shipping on orders above $500
// - $25 flat standard rate otherwise
// - $45 express rate (chosen at checkout via "express" method)
// - $0 cash-on-delivery fee (COD handled locally)

const STANDARD_RATE = 25;
const EXPRESS_RATE = 45;
const FREE_SHIPPING_THRESHOLD = 500;

const calculateShippingCost = ({ method, subtotal }) => {
  if (subtotal >= FREE_SHIPPING_THRESHOLD) return 0;
  if (method === "express") return EXPRESS_RATE;
  if (method === "cod") return 0;
  return STANDARD_RATE;
};

module.exports = { calculateShippingCost, FREE_SHIPPING_THRESHOLD };
