import { redirect } from "next/navigation";

export default async function OldWorkspaceDomains(
  props: {
    params: Promise<{
      slug: string;
    }>;
  }
) {
  const params = await props.params;
  // Domains page removed - redirect to settings home
  redirect(`/${params.slug}/settings`);
}
