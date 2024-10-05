db.createCollection("users");
db.createCollection("products");
db.createCollection("baskets");
db.createCollection("orders");

const popol = ObjectId();
const vikoviko = ObjectId();
const paririkos = ObjectId();
const kokos = ObjectId();
const eggs = ObjectId();
const tomatoes = ObjectId();
const potatoes = ObjectId();
const carrots = ObjectId();
const pasta = ObjectId();
const baskets = [ObjectId(), ObjectId(), ObjectId(), ObjectId()];

db.users.insertMany([
  {
    _id: popol,
    name: "popol",
    age: 31,
  },
  {
    _id: vikoviko,
    name: "vikovikos",
    age: 29,
  },
  {
    _id: paririkos,
    name: "paririkos",
    age: 27,
  },
  {
    _id: kokos,
    name: "kokos",
    age: 37,
  },
]);
db.products.insertMany([
  {
    _id: eggs,
    name: "eggs",
    price: 3,
  },
  {
    _id: tomatoes,
    name: "tomatoes",
    price: 12.5,
  },
  {
    _id: potatoes,
    name: "potatoes",
    price: 6.1,
  },
  {
    _id: carrots,
    name: "carrots",
    price: 3.1,
  },
  {
    _id: pasta,
    name: "pasta",
    price: 10.0,
  },
]);

db.baskets.insertMany([
  {
    _id: baskets[0],
    _p_user: "users$" + popol.toString(),
    products: [
      {
        _p_products: "products$" + eggs.toString(),
        count: 2,
      },
      {
        _p_products: "products$" + tomatoes.toString(),
        count: 3,
      },
      {
        _p_products: "products$" + potatoes.toString(),
      },
    ],
  },
  {
    _id: baskets[1],
    _p_user: "users$" + vikoviko.toString(),
    products: [
      {
        _p_products: "products$" + carrots.toString(),
        count: 4,
      },
      {
        _p_products: "products$" + eggs.toString(),
        count: 0,
      },
      {
        _p_products: "products$" + eggs.toString(),
        count: 2,
      },
    ],
  },
  {
    _id: baskets[2],
    _p_user: "users$" + paririkos.toString(),
    products: [
      {
        _p_products: "products$" + eggs.toString(),
        count: 4,
      },
      {
        _p_products: "products$" + tomatoes.toString(),
        count: 0,
      },
      {
        _p_products: "products$" + pasta.toString(),
        count: 2,
      },
    ],
  },
  {
    _id: baskets[3],
    _p_user: "users$" + kokos.toString(),
    products: [
      {
        _p_products: "products$" + carrots.toString(),
        count: 4,
      },
      {
        _p_products: "products$" + potatoes.toString(),
        count: 0,
      },
      {
        _p_products: "products$" + pasta.toString(),
        count: 2,
      },
    ],
  },
]);

db.orders.insertMany([
  {
    _p_basket: "baskets$" + baskets[0],
    _p_user: "users$" + popol.toString(),
    price: 10,
  },
  {
    _p_basket: "baskets$" + baskets[1],
    _p_user: "users$" + vikoviko.toString(),
    price: 110.1,
  },
  {
    _p_basket: "baskets$" + baskets[2],
    _p_user: "users$" + paririkos.toString(),
    price: 103.1,
  },
  {
    _p_basket: "baskets$" + baskets[3],
    _p_user: "users$" + kokos.toString(),
    price: 3.6,
  },
]);
