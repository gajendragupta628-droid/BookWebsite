const mongoose = require('mongoose');
const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');

let app, mongod;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongod.getUri();
  process.env.SESSION_SECRET = 'testsecret';
  app = require('../src/server');
  // seed minimal data
  const Category = require('../src/models/Category');
  const Author = require('../src/models/Author');
  const Book = require('../src/models/Book');
  const { slugify } = require('../src/utils/slugify');
  const cat = await Category.create({ name: 'Test', slug: 'test' });
  const author = await Author.create({ name: 'Tester', slug: 'tester' });
  await Book.create({
    title: 'Hello World',
    slug: 'hello-world',
    authors: author.name,
    categories: [cat.slug],
    priceSale: 10,
    stock: 5
  });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

test('GET /search returns results', async () => {
  const res = await request(app).get('/search?q=Hello');
  expect(res.status).toBe(200);
});

test('Cart add/update/remove', async () => {
  const Book = require('../src/models/Book');
  const book = await Book.findOne();
  const agent = request.agent(app);
  let res = await agent.post('/cart/add').send({ bookId: String(book._id), qty: 2 });
  expect(res.body.ok).toBe(true);
  res = await agent.post('/cart/update').send({ lines: [{ bookId: String(book._id), qty: 1 }] });
  expect(res.body.ok).toBe(true);
  res = await agent.post('/cart/remove').send({ bookId: String(book._id) });
  expect(res.body.ok).toBe(true);
});

test('Checkout validation', async () => {
  const Book = require('../src/models/Book');
  const book = await Book.findOne();
  const agent = request.agent(app);
  await agent.post('/cart/add').send({ bookId: String(book._id), qty: 1 });
  const res = await agent.post('/checkout').type('form').send({ name: '', phone: '', address1: '', city: '', state: '', postalCode: '', country: '' });
  // Checkout is gated behind authentication; unauthenticated requests redirect to login.
  expect(res.status).toBe(302);
  expect(res.headers.location).toBe('/auth/login');
});

test('Admin guard protects dashboard', async () => {
  const res = await request(app).get('/admin');
  expect(res.status).toBe(302);
  expect(res.headers.location).toBe('/admin/login');
});
