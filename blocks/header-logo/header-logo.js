/**
 * Header Logo Block
 *
 * POC: shared header logo between Classic AEM and EDS via AEM GraphQL.
 *
 * Fetches `headermodelByPath.item` from a persisted GraphQL query
 * and renders a clickable logo:
 *
 *   <a href="{ctaurl}" aria-label="{ctalabel}">
 *     <img src="{logolinkurl}" alt="{logoalttext}" />
 *   </a>
 *
 * The endpoint URL can be overridden in AEM via the `endpoint` field
 * declared in component-models.json. If not provided, it falls back to
 * the default shared endpoint below.
 *
 * @param {HTMLElement} block The header-logo block element
 */

const DEFAULT_ENDPOINT = 'https://publish-p153424-e1601770.adobeaemcloud.com/graphql/execute.json/shared/Header';

const ABSOLUTE_URL_RE = /^(https?:)?\/\//i;
const ASSET_PATH_RE = /^\/(content|conf)\//i;
const IMAGE_LIKE_RE = /\.(svg|png|jpe?g|gif|webp|avif)(\?|#|$)/i;

function normaliseHref(url) {
  if (!url) return '#';
  const trimmed = String(url).trim();
  if (!trimmed) return '#';
  if (ABSOLUTE_URL_RE.test(trimmed) || trimmed.startsWith('/') || trimmed.startsWith('#') || trimmed.startsWith('mailto:') || trimmed.startsWith('tel:')) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

function looksLikeImage(value) {
  if (!value) return false;
  const v = String(value).trim();
  if (!v) return false;
  return ABSOLUTE_URL_RE.test(v) || ASSET_PATH_RE.test(v) || IMAGE_LIKE_RE.test(v) || v.startsWith('data:image/');
}

function resolveAssetUrl(value, endpoint) {
  const v = String(value).trim();
  if (ABSOLUTE_URL_RE.test(v) || v.startsWith('data:image/')) return v;
  if (v.startsWith('/')) {
    try {
      const { origin } = new URL(endpoint);
      return `${origin}${v}`;
    } catch {
      return v;
    }
  }
  return v;
}

/**
 * Reads optional config rows authored inside the block (key/value pairs)
 * before they get cleared. Mirrors the convention used by other blocks
 * in this project (e.g. commerce-mini-cart).
 *
 * @param {HTMLElement} block
 * @returns {Record<string, string>}
 */
function readAuthoredConfig(block) {
  const config = {};
  block.querySelectorAll(':scope > div').forEach((row) => {
    const cells = row.querySelectorAll(':scope > div');
    if (cells.length >= 2) {
      const key = cells[0].textContent.trim().toLowerCase();
      const value = cells[1].textContent.trim();
      if (key) config[key] = value;
    }
  });
  return config;
}

async function fetchHeaderModel(endpoint) {
  // Note: AEM publish must send `Access-Control-Allow-Origin` for this fetch
  // to succeed from a different origin (localhost, *.aem.page, *.aem.live).
  // If you see a TypeError here, it's almost always CORS.
  const res = await fetch(endpoint, { method: 'GET', mode: 'cors' });
  if (!res.ok) {
    throw new Error(`Header GraphQL request failed: ${res.status} ${res.statusText}`);
  }
  const json = await res.json();
  const item = json?.data?.headermodelByPath?.item;
  if (!item) {
    throw new Error('Header GraphQL response is missing data.headermodelByPath.item');
  }
  return item;
}

function isDevHost() {
  const { hostname } = window.location;
  return hostname === 'localhost'
    || hostname === '127.0.0.1'
    || hostname.endsWith('.aem.page')
    || hostname.endsWith('.hlx.page');
}

function renderError(block, err, endpoint) {
  // Likely-CORS = a TypeError with no response status (fetch threw before reading).
  const looksLikeCors = err instanceof TypeError;
  const message = looksLikeCors
    ? 'header-logo: blocked by CORS. Add Access-Control-Allow-Origin on the AEM publish CORS config.'
    : `header-logo: ${err.message}`;

  // eslint-disable-next-line no-console
  console.error('[header-logo] failed to load logo from GraphQL', { endpoint, error: err });
  if (looksLikeCors) {
    // eslint-disable-next-line no-console
    console.warn(
      '[header-logo] The browser blocked reading the response from',
      endpoint,
      '\nFix: configure com.adobe.granite.cors.impl.CORSPolicyImpl on AEM publish to allow your EDS origin.',
    );
  }

  block.classList.add('header-logo--error');
  // Only show a visible hint on dev/preview hosts so production stays clean.
  if (isDevHost()) {
    const hint = document.createElement('span');
    hint.className = 'header-logo__error';
    hint.textContent = message;
    block.append(hint);
  }
}

function buildLogo(item, endpoint) {
  const {
    logolinkurl = '',
    logoalttext = '',
    ctalabel = '',
    ctaurl = '',
  } = item;

  const link = document.createElement('a');
  link.className = 'header-logo__link';
  link.href = normaliseHref(ctaurl);
  if (ctalabel) link.setAttribute('aria-label', ctalabel);
  if (ABSOLUTE_URL_RE.test(link.href) && !link.href.startsWith(window.location.origin)) {
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
  }

  if (looksLikeImage(logolinkurl)) {
    const img = document.createElement('img');
    img.className = 'header-logo__img';
    img.src = resolveAssetUrl(logolinkurl, endpoint);
    img.alt = logoalttext || ctalabel || 'Logo';
    img.loading = 'eager';
    img.decoding = 'async';
    link.append(img);
  } else {
    // Fallback for placeholder / non-image values (e.g. plain text).
    // Keeps the POC renderable even before authors upload a real asset.
    const text = document.createElement('span');
    text.className = 'header-logo__text';
    text.textContent = logolinkurl || ctalabel || 'Logo';
    if (logoalttext) text.setAttribute('aria-label', logoalttext);
    link.append(text);
  }

  return link;
}

export default async function decorate(block) {
  const config = readAuthoredConfig(block);
  const endpoint = config.endpoint || DEFAULT_ENDPOINT;

  block.textContent = '';
  block.setAttribute('aria-busy', 'true');

  const placeholder = document.createElement('div');
  placeholder.className = 'header-logo__skeleton';
  placeholder.setAttribute('aria-hidden', 'true');
  block.append(placeholder);

  try {
    const item = await fetchHeaderModel(endpoint);
    block.textContent = '';
    block.append(buildLogo(item, endpoint));
  } catch (err) {
    block.textContent = '';
    renderError(block, err, endpoint);
  } finally {
    block.removeAttribute('aria-busy');
  }
}
