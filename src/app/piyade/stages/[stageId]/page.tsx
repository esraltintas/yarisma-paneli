import StageRankingClient from "@/components/StageRankingClient";

export default async function Page({
  params,
}: {
  params: Promise<{ stageId: string }>;
}) {
  const { stageId } = await params;
  return <StageRankingClient mode="piyade" stageId={stageId} />;
}
