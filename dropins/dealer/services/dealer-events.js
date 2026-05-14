export function emitDealerSelected(dealer) {
  document.dispatchEvent(
    new CustomEvent('dealer:selected', {
      detail: dealer,
    })
  );
}

export function emitDealerRequired() {
  document.dispatchEvent(
    new CustomEvent('dealer:required')
  );
}