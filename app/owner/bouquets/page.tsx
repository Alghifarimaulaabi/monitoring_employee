import {
  getOwnerMonthlyBouquetsAction,
  getBouquetPeriodsAction,
} from "@/lib/actions/bouquet";
import OwnerBouquetGallery from "@/components/owner-bouquet-gallery";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Galeri Buket & Laporan Bulanan - B-Tracker",
};

export default async function OwnerBouquetsPage() {
  const now = new Date();
  const currentMonth = now.getUTCMonth() + 1;
  const currentYear = now.getUTCFullYear();

  const [initialMonthlyData, periodsResult] = await Promise.all([
    getOwnerMonthlyBouquetsAction({
      month: currentMonth,
      year: currentYear,
    }),
    getBouquetPeriodsAction(),
  ]);

  return (
    <OwnerBouquetGallery
      initialData={initialMonthlyData}
      initialPeriods={periodsResult.periods}
      initialMonth={currentMonth}
      initialYear={currentYear}
    />
  );
}
