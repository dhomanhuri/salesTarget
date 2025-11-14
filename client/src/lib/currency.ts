export function formatRupiah(amount: number | string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return 'Rp 0';
  
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num).replace('IDR', 'Rp');
}

export function formatRupiahCompact(amount: number | string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return 'Rp 0';
  
  if (num >= 1_000_000_000) {
    return `Rp ${(num / 1_000_000_000).toFixed(1)}M`;
  } else if (num >= 1_000_000) {
    return `Rp ${(num / 1_000_000).toFixed(1)}Jt`;
  }
  
  return formatRupiah(num);
}

export function parseRupiah(formattedAmount: string): number {
  const cleaned = formattedAmount.replace(/[^0-9]/g, '');
  return parseInt(cleaned) || 0;
}
