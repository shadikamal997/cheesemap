export function formatCurrency(amountInCents: number, locale: string = 'fr-FR'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'EUR',
  }).format(amountInCents / 100);
}

export function parseCurrency(formattedAmount: string): number {
  // Remove currency symbols and convert to cents
  const amount = parseFloat(formattedAmount.replace(/[^0-9.,]/g, '').replace(',', '.'));
  return Math.round(amount * 100);
}
