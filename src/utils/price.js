const currencySymbol = (code = 'NPR') => {
  switch (code) {
    case 'USD': return '$';
    case 'EUR': return '€';
    case 'GBP': return '£';
    case 'NPR': return '₨';
    default: return code + ' ';
  }
};

const formatPrice = (amount, code = 'NPR') => `${currencySymbol(code)}${(amount || 0).toFixed(2)}`;

module.exports = { currencySymbol, formatPrice };

