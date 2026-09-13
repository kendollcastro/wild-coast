/** Calcula precio del combo basado en 1 noche de casa + tours. */
export function calculateComboPrice(
  combo: { discount_pct: number },
  property: { price_per_night: number } | null | undefined,
  tours: { price: number }[],
): { original: number; comboPrice: number; savings: number } {
  const propertyPrice = property?.price_per_night ?? 0;
  const toursPrice = tours.reduce((sum, t) => sum + t.price, 0);
  const original = propertyPrice + toursPrice;
  const comboPrice = Math.round(original * (1 - combo.discount_pct / 100) * 100) / 100;
  const savings = original - comboPrice;
  return { original, comboPrice, savings };
}
