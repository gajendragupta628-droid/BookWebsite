const buildMeta = ({ title, description, canonical }) => ({ title, description, canonical });

const orgJSONLD = ({ name, url, logo }) => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name, url, logo
});

const breadcrumbJSONLD = (items) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, i) => ({
    '@type': 'ListItem', position: i + 1, name: item.name, item: item.item
  }))
});

const productJSONLD = (book) => ({
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: book.title,
  image: (book.images || []).map(i => i.src),
  description: book.summary || '',
  sku: book.sku || '',
  brand: book.publisher || 'Unknown',
  offers: {
    '@type': 'Offer',
    priceCurrency: book.currency || 'USD',
    price: book.priceSale,
    availability: (book.stock || 0) > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock'
  }
});

module.exports = { buildMeta, orgJSONLD, breadcrumbJSONLD, productJSONLD };

