import { getOwnerMonthlyBouquetsAction } from "@/lib/actions/bouquet";
import OwnerBouquetGallery from "@/components/owner-bouquet-gallery";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Galeri Buket & Laporan Bulanan - B-Tracker",
};

export default async function OwnerBouquetsPage() {
  const now = new Date();
  const currentMonth = now.getUTCMonth() + 1;
  const currentYear = now.getUTCFullYear();

  const initialData = await getOwnerMonthlyBouquetsAction({
    month: currentMonth,
    year: currentYear,
  });

  return (
    <OwnerBouquetGallery
      initialData={initialData}
      initialMonth={currentMonth}
      initialYear={currentYear}
    />
  );
}
