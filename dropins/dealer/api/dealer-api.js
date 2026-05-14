export async function getDealersByPincode(pincode = '') {
  const response = await fetch('/mock-api/dealers.json');

  if (!response.ok) {
    throw new Error('Failed to load dealers');
  }

  const dealers = await response.json();

  if (!pincode) {
    return dealers;
  }

  return dealers.filter(
    (dealer) => dealer.pincode.includes(pincode),
  );
}
