const menuDTO = (menu) => {
 return {
  id: menu._id,
  name: menu.name,
  price: menu.price,
  category: menu.category,
  image: menu.image
 };
};

module.exports = menuDTO;