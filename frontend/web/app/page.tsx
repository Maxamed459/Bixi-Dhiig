import { redirect } from "next/navigation";

// The web app has no marketing/landing page — the first screen is always
// the auth experience.
export default function RootPage() {
  redirect("/login");
}
