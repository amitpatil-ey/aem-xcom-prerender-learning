/**
 * Creates an individual dealer card element.
 *
 * @param {Object} dealer - Dealer data object
 * @param {string} dealer.name - Dealer name
 * @param {string} dealer.address - Street address
 * @param {string} dealer.city - City
 * @param {string} dealer.phone - Phone number
 * @param {Function} onSelect - Callback when dealer is selected
 * @returns {HTMLElement} The dealer card element
 */
export function createDealerCard(dealer, onSelect) {
  const card = document.createElement('div');
  card.className = 'dealer-card';

  const name = document.createElement('h4');
  name.className = 'dealer-card__name';
  name.textContent = dealer.name;

  const address = document.createElement('p');
  address.className = 'dealer-card__address';
  address.textContent = `${dealer.address}, ${dealer.city}`;

  const phone = document.createElement('p');
  phone.className = 'dealer-card__phone';
  phone.textContent = dealer.phone;

  const selectBtn = document.createElement('button');
  selectBtn.textContent = 'Select Dealer';
  selectBtn.addEventListener('click', () => {
    onSelect(dealer);
  });

  card.appendChild(name);
  card.appendChild(address);
  card.appendChild(phone);
  card.appendChild(selectBtn);

  return card;
}
