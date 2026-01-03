const Category = require('../models/Category');
const Author = require('../models/Author');
const { slugify } = require('../utils/slugify');

exports.categories = async (req, res) => {
  if (req.method === 'POST') {
    const { id, name, description } = req.body;
    const data = { name, description, slug: slugify(name) };
    if (id) await Category.findByIdAndUpdate(id, data); else await Category.create(data);
    return res.redirect('/admin/categories');
  }
  const categories = await Category.find();
  res.render('admin/categories', { categories });
};

exports.deleteCategory = async (req, res) => {
  await Category.findByIdAndDelete(req.params.id);
  res.redirect('/admin/categories');
};

exports.authors = async (req, res) => {
  if (req.method === 'POST') {
    const { id, name, bio } = req.body;
    const data = { name, bio, slug: slugify(name) };
    if (id) await Author.findByIdAndUpdate(id, data); else await Author.create(data);
    return res.redirect('/admin/authors');
  }
  const authors = await Author.find();
  res.render('admin/authors', { authors });
};

exports.deleteAuthor = async (req, res) => {
  await Author.findByIdAndDelete(req.params.id);
  res.redirect('/admin/authors');
};

