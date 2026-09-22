/**
 * Bouquet Packages and Pricing Configuration
 * Centralized business logic separating pricing & billing rules from UI components.
 */

export interface BouquetPackageConfig {
  id: string;
  label: string;
  price: number;
}

export const BOUQUET_PACKAGES = [
  {
    id: "REGULER",
    label: "Reguler",
    price: 10000,
  },
  {
    id: "VIP",
    label: "VIP",
    price: 15000,
  },
  {
    id: "MEDIUM_PHOTO_TAKING",
    label: "Medium (photo taking)",
    price: 150000,
  },
] as const satisfies readonly BouquetPackageConfig[];

export type BouquetPackageType = (typeof BOUQUET_PACKAGES)[number]["id"];

/**
 * Price mapping strictly maintained in backend logic for billing/tagihan.
 */
export const BOUQUET_PACKAGE_PRICING: Record<BouquetPackageType, number> = {
  REGULER: 10000,
  VIP: 15000,
  MEDIUM_PHOTO_TAKING: 150000,
};

/**
 * Client-facing options without prices (as required: "di tampilanya jangan tampilkan harga nya").
 */
export const CLIENT_BOUQUET_PACKAGE_OPTIONS = BOUQUET_PACKAGES.map(
  ({ id, label }) => ({
    id,
    label,
  })
);

/**
 * Resolves the unit price in IDR for a given package type.
 * Defaults to 10000 (Reguler) if unknown.
 */
export function getBouquetPackagePrice(packageType?: string | null): number {
  if (!packageType) return BOUQUET_PACKAGE_PRICING.REGULER;
  return (
    BOUQUET_PACKAGE_PRICING[packageType as BouquetPackageType] ??
    BOUQUET_PACKAGE_PRICING.REGULER
  );
}

/**
 * Validates whether a given package type is a valid option.
 */
export function isValidBouquetPackageType(
  type: string
): type is BouquetPackageType {
  return BOUQUET_PACKAGES.some((pkg) => pkg.id === type);
}

/**
 * Calculates total price for a bouquet post based on unit price and quantity (pcs / flowerCount).
 * Formula: unit price * count.
 * Applicable to all categories: REGULER, VIP, MEDIUM_PHOTO_TAKING.
 */
export function calculateBouquetPostTotal(
  packageType?: string | null,
  packagePrice?: number | null,
  flowerCount?: number | null
): number {
  const unitPrice =
    packagePrice !== undefined && packagePrice !== null && packagePrice > 0
      ? packagePrice
      : getBouquetPackagePrice(packageType);
  const count = flowerCount && flowerCount > 0 ? flowerCount : 1;
  return unitPrice * count;
}
