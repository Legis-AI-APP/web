import { redirect } from "next/navigation";

type PageProps = {
  params: Promise<{
    clientId: string;
  }>;
};

export default async function Page({ params }: PageProps) {
  const { clientId } = await params;
  redirect(`/clients/${clientId}/overview`);
}
