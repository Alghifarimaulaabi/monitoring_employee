import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth";
import EmployeeNav from "@/components/employee-nav";

export default async function EmployeeLayout({
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

  if (isOwner) {
    redirect("/owner/employees");
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-20">
      <EmployeeNav
        userName={session.user.name}
        userEmail={session.user.email}
      />
      <main className="flex-1 max-w-md w-full mx-auto p-4">
        {children}
      </main>
    </div>
  );
}
