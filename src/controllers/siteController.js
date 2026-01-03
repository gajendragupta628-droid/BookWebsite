const { homeData } = require('../services/catalogService');
const { buildMeta, orgJSONLD } = require('../utils/seo');
const Banner = require('../models/Banner');

exports.getHome = async (req, res, next) => {
  try {
    const data = await homeData();
    const meta = buildMeta({ 
      title: 'Motivational Books — Inspire Nepal Through Books', 
      description: 'Nepal\'s premier platform for motivational and self-help books. Discover powerful stories and strategies that inspire change, fuel success, and unlock your full potential. Transform your life with books that matter.' 
    });
    const jsonld = orgJSONLD({ name: 'Motivational Books', url: req.baseUrl || '/', logo: '/public/assets/images/logo.svg' });
    res.render('site/home', { meta, jsonld, ...data });
  } catch (e) { next(e); }
};

exports.getAbout = (req, res) => res.render('site/about', { meta: { title: 'About' } });
exports.getContact = (req, res) => res.render('site/contact', { meta: { title: 'Contact' } });
exports.getPolicies = (req, res) => res.render('site/policies', { meta: { title: 'Policies' } });

