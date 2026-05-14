/**
 * Image Grid Block — Premium masonry/grid layout for /home-test POC.
 * Features: clickable cards, hover zoom, IntersectionObserver reveal.
 * Follows EDS block lifecycle.
 *
 * @param {Element} block The image-grid block element
 */
export default async function decorate(block) {
  /* console.log('Image Grid Loaded'); */

  block.textContent = '';

  const items = [
    { title: 'Luxury Design', img: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=1200', large: true },
    { title: 'Electric Future', img: 'https://images.unsplash.com/photo-1489824904134-891ab64532f1?q=80&w=800', large: false },
    { title: 'Adventure', img: 'https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?q=80&w=800', large: false },
    { title: 'Premium Interiors', img: 'https://images.unsplash.com/photo-1493238792000-8113da705763?q=80&w=800', large: false },
  ];

  const gridHTML = items.map((item) => `
    <a href="#" class="ig-grid-item${item.large ? ' ig-large' : ''}">
      <img src="${item.img}" alt="${item.title}" loading="lazy" />
      <div class="ig-overlay-text">${item.title}</div>
    </a>
  `).join('');

  const section = document.createElement('section');
  section.classList.add('ig-section');

  section.innerHTML = `
    <div class="ig-container">
      <div class="ig-section-heading">
        <h2>Explore Experiences</h2>
        <p>Discover innovation, engineering and luxury.</p>
      </div>
      <div class="ig-grid">${gridHTML}</div>
    </div>
  `;

  block.append(section);

  // Scroll-reveal animation (block-scoped)
  const gridItems = block.querySelectorAll('.ig-grid-item');
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('ig-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 },
  );
  gridItems.forEach((item) => observer.observe(item));
}
