import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CampaignDetails } from "./campaign-details";

export const metadata: Metadata = {
  title: "Campaign details — FundSpark",
};

export default async function CampaignDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <>
      <Navbar />
      <main className="grow">
        <CampaignDetails campaignId={id} />
      </main>
      <Footer />
    </>
  );
}
