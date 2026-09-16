import { getBouquetPeriodsAction } from "@/lib/actions/bouquet";
import EmployeeBouquetPeriodsView from "@/components/employee-bouquet-periods-view";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Foto Buket - B-Tracker",
};

export default async function SubmitBouquetPage() {
  const result = await getBouquetPeriodsAction();

  return (
    <div className="py-2">
      <EmployeeBouquetPeriodsView initialPeriods={result.periods} />
    </div>
  );
}
