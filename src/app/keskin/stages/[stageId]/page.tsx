import StageRankingClient from "@/components/StageRankingClient";

export default function Page({ params }: { params: { stageId: string } }) {
  return <StageRankingClient mode="keskin" stageId={params.stageId} />;
}
