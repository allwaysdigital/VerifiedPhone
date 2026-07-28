export type Brand = {
  id: string;
  name: string;
};

const initialBrands: Brand[] = [
  { id: '1', name: 'Apple' },
  { id: '2', name: 'Samsung' },
  { id: '3', name: 'OnePlus' },
  { id: '4', name: 'Xiaomi' },
  { id: '5', name: 'Others' },
  { id: '6', name: 'VIVO' },
  { id: '7', name: 'Oppo' },
  { id: '8', name: 'Google' },
];

let brands: Brand[] = [...initialBrands];

export function getBrands(): Brand[] {
  return brands;
}

export function getBrandNames(): string[] {
  return brands.map(b => b.name);
}

export function brandExists(name: string): boolean {
  const normalized = name.trim().toLowerCase();
  return brands.some(brand => brand.name.toLowerCase() === normalized);
}

export function addBrand(name: string): Brand | null {
  const trimmed = name.trim();
  if (!trimmed || brandExists(trimmed)) {
    return null;
  }

  const brand: Brand = {
    id: String(Date.now()),
    name: trimmed,
  };
  brands = [...brands, brand];
  return brand;
}
