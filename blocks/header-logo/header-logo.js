/**
 * Header Logo Block
 *
 * Fetches a persisted GraphQL query from AEM Publish and renders a
 * clickable logo. Supports both the current POC schema
 * (data.headermodelByPath.item) and the architect's target schema
 * (data.headerByPath.item) so the block survives the migration without
 * a code change.
 *
 * Authored field (see component-models.json):
 *   - endpoint: optional absolute URL of the persisted query.
 *               Defaults to the shared Publish endpoint below.
 *
 * @param {HTMLElement} block
 */

const DEFAULT_ENDPOINT = 'https://publish-p153424-e1601770.adobeaemcloud.com/graphql/execute.json/shared/Header';

function readEndpoint(block) {
  const row = block.querySelector(':scope > div');
  const cells = row ? row.querySelectorAll(':scope > div') : [];
  if (cells.length >= 2 && cells[0].textContent.trim().toLowerCase() === 'endpoint') {
    const value = cells[1].textContent.trim();
    if (value) return value;
  }
  return DEFAULT_ENDPOINT;
}

function pickFields(item) {
  return {
    src: item?.logoImage?._publishUrl || item?.logolinkurl || '',
    alt: item?.logoAltText || item?.logoalttext || '',
    href: item?.logoLinkUrl || item?.ctaUrl || item?.ctaurl || '#',
    label: item?.ctaLabel || item?.ctalabel || '',
  };
}

export default async function decorate(block) {
  const endpoint = readEndpoint(block);
  block.textContent = '';

  try {
    const res = await fetch(endpoint);
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    const json = await res.json();
    const item = json?.data?.headerByPath?.item || json?.data?.headermodelByPath?.item;
    if (!item) throw new Error('No header data in response');

    const {
      src, alt, href, label,
    } = pickFields(item);

    const link = document.createElement('a');
    link.className = 'header-logo__link';
    link.href = href;
    if (label) link.setAttribute('aria-label', label);

    const img = document.createElement('img');
    img.className = 'header-logo__img';
    img.src = src;
    img.alt = alt || label || 'Logo';
    link.append(img);

    block.append(link);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(`[header-logo] Failed to load logo from ${endpoint}:`, err.message);
  }
}
