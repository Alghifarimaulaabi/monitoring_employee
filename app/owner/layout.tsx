import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth";
import OwnerHeader from "@/components/owner-header";

export default async function OwnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();

  if (!session || !session.user) {
    redirect("/login");
  }

  const isOwner =
    session.user.role === "OWNER" || session.user.role === "admin";

  if (!isOwner) {
    redirect("/employee/tasks");
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col print:bg-white print:min-h-0">
      <OwnerHeader
        userName={session.user.name}
        userEmail={session.user.email}
      />
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 print:p-0 print:max-w-none">
        {children}
      </main>
    </div>
  );
}
