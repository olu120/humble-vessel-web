// SERVER COMPONENT (no "use client")

import SuccessClient from "./SuccessClient";

// Configure on the server file (valid in Next 15)
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function DonateSuccessPage() {
  return <SuccessClient />;
}
