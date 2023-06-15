// import models
const Product = require('./Product');
const Category = require('./Category');
const Tag = require('./Tag');
const ProductTag = require('./ProductTag');

// Products belongsTo Category
Product.belongsTo(Category, {
  foreignKey: 'category_id',
  // When we delete a Reader, make sure to also delete the associated Library Card.
  onDelete: 'CASCADE',
});

// Categories have many Products
Category.hasMany(Product, {
  foreignKey: 'category_id',
});


// Products belongToMany Tags (through ProductTag)
Product.belongToMany(Tag, {
  through: ProductTag,
});

// Tags belongToMany Products (through ProductTag)
Tag.belongToMany(Product,{
  through: ProductTag,
})

module.exports = {
  Product,
  Category,
  Tag,
  ProductTag,
};
