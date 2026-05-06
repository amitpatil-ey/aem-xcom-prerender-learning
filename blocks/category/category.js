// blocks/category/category.js
// import { getConfig } from '../../scripts/scripts.js'; // adjust to your config helper
// import the Commerce category drop-in per your project setup
// e.g. import { render as renderCategory } from '@dropins/storefront-product-list-page/render.js';

function getCategorySlugFromPath() {
  const segments = window.location.pathname.split('/').filter(Boolean);
  // Expect: ['category', '<slug>']
  if (segments[0] !== 'category' || !segments[1]) return null;
  return decodeURIComponent(segments[1]);
}

export default async function decorate(block) {
  const slug = getCategorySlugFromPath();

  if (!slug) {
    block.innerHTML = '<p>Category not found.</p>';
    return;
  }

  // Expose slug for other blocks/breadcrumbs on the page
  document.documentElement.dataset.categorySlug = slug;

  // Initialize the Commerce category drop-in with the slug / urlKey
  // The exact API depends on which drop-in the project uses.
  // Example (pseudo):
  //
  // await renderCategory(block, {
  //   urlKey: slug,
  //   pageSize: 24,
  //   // other config: sort, filters, etc.
  // });

  // TODO: replace the pseudo call above with the actual drop-in initializer
  // already used elsewhere in the project (search the repo for the existing
  // Commerce drop-in import to stay consistent).
}
