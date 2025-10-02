// app/[locale]/admin/reconcile/page.tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import ReconcileClient from "./ReconcileClient";

// app/[locale]/admin/reconcile/page.tsx
export const robots = {
  index: false,
  follow: false,
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Props = {
  params: { locale: "en" | "lg" };
  searchParams?: { token?: string };
};

export default async function Page({ params, searchParams }: Props) {
  const tokens = [process.env.RECONCILE_TOKEN, process.env.AUDIT_TOKEN]
    .filter(Boolean) as string[];

  const urlToken = (searchParams?.token || "").trim();

  // If a token is provided in the URL, hand off to the Route Handler to set the cookie.
  if (tokens.length && urlToken && tokens.includes(urlToken)) {
    const target = `/${params.locale}/admin/reconcile`; // clean URL
    const authUrl = `/api/admin/auth?token=${encodeURIComponent(
      urlToken
    )}&redirect=${encodeURIComponent(target)}`;
    redirect(authUrl);
  }

  // Otherwise, require an existing cookie
  const cookieStore = await cookies();
  const cookieToken = cookieStore.get("hv_admin")?.value || "";
  const authed = tokens.length && tokens.includes(cookieToken);

  if (!authed) {
    return (
      <main className="max-w-xl mx-auto p-6">
        <h1 className="text-xl font-semibold mb-2">Admin access required</h1>
        <p className="mb-4">
          Append <code>?token=YOUR_ADMIN_TOKEN</code> to this URL once to unlock this page.
        </p>
      </main>
    );
  }

  return <ReconcileClient locale={params.locale} />;
}
