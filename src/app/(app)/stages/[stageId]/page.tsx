import StageRankingClient from "@/components/StageRankingClient";

export default async function StagePage({
  params,
}: {
  params: Promise<{ stageId: string }>;
}) {
  const { stageId } = await params; // ✅ Next 15
  return <StageRankingClient stageId={stageId} />;
}
