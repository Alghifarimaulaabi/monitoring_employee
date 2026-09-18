import { getServerSession } from "@/lib/auth";
import PwaInstallView from "@/components/pwa-install-view";

export const dynamic = "force-dynamic";

export default async function RootPage() {
  let userSession: { name: string | null; role: string | null } | null = null;

  try {
    const session = await getServerSession();
    if (session?.user) {
      userSession = {
        name: session.user.name || null,
        role: session.user.role || null,
      };
    }
  } catch (error) {
    console.warn("[RootPage] Failed to fetch session:", error);
  }

  return <PwaInstallView userSession={userSession} />;
}
