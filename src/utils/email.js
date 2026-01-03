const nodemailer = require('nodemailer');
const path = require('path');
const ejs = require('ejs');
const { env } = require('../config/env');

let transporter = null;
const getTransporter = () => {
  if (transporter) return transporter;
  if (!env.SMTP_HOST) {
    // Fallback: stream to console
    transporter = nodemailer.createTransport({ jsonTransport: true });
    return transporter;
  }
  transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined
  });
  return transporter;
};

const renderEmail = async (template, data) => {
  const tplPath = path.join(__dirname, '..', 'views', 'emails', `${template}.ejs`);
  return ejs.renderFile(tplPath, data, { async: true });
};

const sendEmail = async ({ to, subject, template, data }) => {
  const html = await renderEmail(template, data);
  const info = await getTransporter().sendMail({
    from: `${env.STORE_NAME} <${env.SMTP_USER || 'no-reply@localhost'}>`,
    to,
    subject,
    html
  });
  if (process.env.NODE_ENV !== 'production') {
    console.log('Email sent:', info.messageId || info);
  }
};

module.exports = { sendEmail };

