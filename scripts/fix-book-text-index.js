#!/usr/bin/env node
/**
 * Fix Book text index to support languages like Nepali.
 *
 * MongoDB text indexes default to `language_override: "language"`. If a document
 * has `language: "Nepali"`, inserts/updates fail because Nepali isn't supported
 * by MongoDB's text search stemmers.
 *
 * This script drops any text index that uses the document `language` field and
 * creates a safe replacement named `book_text_search` with:
 * - default_language: "none"
 * - language_override: "textSearchLanguage" (a field we don't set)
 */

const mongoose = require('mongoose');
require('dotenv').config();

const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
  console.error('MONGODB_URI is required (set it in your .env or environment).');
  process.exit(1);
}

async function main() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(mongoUri);
  console.log('Connected\n');

  const collection = mongoose.connection.db.collection('books');
  const indexes = await collection.indexes();

  const toDrop = indexes.filter(
    (idx) =>
      idx.key?._fts === 'text' &&
      (idx.language_override === 'language' || typeof idx.language_override === 'undefined')
  );

  if (toDrop.length === 0) {
    console.log('No problematic text indexes found.\n');
  } else {
    for (const idx of toDrop) {
      console.log(`Dropping index: ${idx.name}`);
      await collection.dropIndex(idx.name);
    }
    console.log('');
  }

  const safeIndex = indexes.find(
    (idx) => idx.name === 'book_text_search' && idx.language_override === 'textSearchLanguage'
  );
  if (!safeIndex) {
    console.log('Creating safe text index: book_text_search');
    await collection.createIndex(
      {
        title: 'text',
        subtitle: 'text',
        isbn10: 'text',
        isbn13: 'text',
        tags: 'text',
      },
      {
        name: 'book_text_search',
        default_language: 'none',
        language_override: 'textSearchLanguage',
      }
    );
    console.log('Created\n');
  } else {
    console.log('Safe text index already present.\n');
  }

  await mongoose.connection.close();
}

main().catch(async (err) => {
  console.error('Failed to fix index:', err);
  try {
    await mongoose.connection.close();
  } catch {}
  process.exit(1);
});
