import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import EmployeeNav from "@/components/employee-nav";

export default async function EmployeeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headerList = await headers();
  const session = await auth.api.getSession({
    headers: headerList,
  });

  if (!session || !session.user) {
    redirect("/login");
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
