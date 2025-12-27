import StageRankingClient from "@/components/StageRankingClient";

export default function Page({ params }: { params: { stageId: string } }) {
  return <StageRankingClient mode="piyade" stageId={params.stageId} />;
}
