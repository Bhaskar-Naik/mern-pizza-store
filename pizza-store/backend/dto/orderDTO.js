const orderDTO = (order) => {
 return {
  id: order._id,
  items: order.items,
  totalPrice: order.totalPrice,
  status: order.status,
  createdAt: order.createdAt
 };
};

module.exports = orderDTO;