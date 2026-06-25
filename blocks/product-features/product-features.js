/**
 * Product Features Block
 *
 * Authored table structure (Google Doc / AEM page):
 * | Product Features |                   |   ← block name row (auto-removed by EDS)
 * |------------------|-------------------|
 * | Heading text     |                   |   ← row 0 : section heading
 * | [feature image]  |                   |   ← row 1 : left-column image
 * | Title 1          | Description 1     |   ← row 2+ : repeatable feature items
 * | Title N          | Description N     |
 */
export default function decorate(block) {
  const rows = [...block.children];
  if (rows.length < 2) return;

  // Row 0: section heading
  const headingText = rows[0].firstElementChild?.textContent?.trim() || 'Product Features';

  // Row 1: feature image (picture or img)
  const imgEl = rows[1].querySelector('img');
  const pictureEl = rows[1].querySelector('picture') || imgEl;
  if (imgEl) imgEl.classList.add('feature-image');

  // Rows 2+: repeatable feature items (title | description)
  const featureItems = [];
  for (let i = 2; i < rows.length; i += 1) {
    const [titleCell, detailCell] = [...rows[i].children];
    if (titleCell || detailCell) {
      featureItems.push({
        title: titleCell?.innerHTML || '',
        detail: detailCell?.innerHTML || '',
      });
    }
  }

  // Heading
  const heading = document.createElement('div');
  heading.className = 'section-heading';
  heading.textContent = headingText;

  // Left column (image)
  const leftSection = document.createElement('div');
  leftSection.className = 'left-section';
  if (pictureEl) leftSection.append(pictureEl);

  // Right column (feature items)
  const rightSection = document.createElement('div');
  rightSection.className = 'right-section';
  featureItems.forEach(({ title, detail }) => {
    const item = document.createElement('div');
    item.className = 'section-item';

    const titleEl = document.createElement('div');
    titleEl.className = 'inner-item-line';
    titleEl.innerHTML = title;

    const detailEl = document.createElement('div');
    detailEl.className = 'inner-item-detail';
    detailEl.innerHTML = detail;

    item.append(titleEl, detailEl);
    rightSection.append(item);
  });

  block.textContent = '';
  block.append(heading, leftSection, rightSection);
}
