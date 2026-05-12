import { debounce } from '../utils/debounce.js';

export function createDealerSearch(onSearch) {
  const wrapper = document.createElement('div');
  wrapper.className = 'dealer-search';

  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder = 'Enter Pincode';

  input.addEventListener(
    'input',
    debounce((event) => {
      onSearch(event.target.value);
    }, 400)
  );

  wrapper.appendChild(input);

  return wrapper;
}