// blocks/category/category.js
// import { getConfig } from '../../scripts/scripts.js'; // adjust to your config helper
// import the Commerce category drop-in per your project setup
// e.g. import { render as renderCategory } from '@dropins/storefront-product-list-page/render.js';

import { render as renderPLP } from '@dropins/storefront-product-discovery/render.js';

function getCategorySlugFromPath() {
  const segments = window.location.pathname.split('/').filter(Boolean);
  // Expect: ['category', '<slug>']
  if (segments[0] !== 'category' || !segments[1]) return null;
  return decodeURIComponent(segments[1]);
}

// Show loading state
function showLoader(block) {
  block.innerHTML = '<div class="category-loading">Loading products...</div>';
}

export default async function decorate(block) {
  const slug = getCategorySlugFromPath();
  if (!slug) {
    block.innerHTML = '<p class="category-error">Category not found.</p>';
    return;
  }

  // Expose slug for other blocks/breadcrumbs on the page
  document.documentElement.dataset.categorySlug = slug;
  showLoader(block);
  try {
    await renderPLP({
      container: block,
      config: {
        commerce: {
          endpoint: 'https://na1-sandbox.api.commerce.adobe.com/Xun223LbRqWUYemTUEBb8y/graphql',
          apiKey: '3047cdff93ce43cbba3e6d0bc0725f68',
          storeViewCode: 'en_US',
        },
        category: {
          urlKey: slug,
        },
        pagination: {
          pageSize: 24,
        },
        sorting: {
          default: 'position',
        },
        filters: {
          enabled: true,
        },
      },
    });
  } catch (err) {
    console.error('Category render failed:', err);
    block.innerHTML = '<p class="category-error">Failed to load category.</p>';
  }
}
