import { STAGES } from "@/lib/stages";

export default async function StagePage({
  params,
}: {
  params: Promise<{ stageId: string }>;
}) {
  const { stageId } = await params;

  const stage = STAGES.find((s) => s.id === stageId);

  return (
    <>
      <h1>{stage?.title ?? `Etap: ${stageId}`}</h1>
      <p>Bu etap için süre girişleri ve sonuçlar burada olacak.</p>
    </>
  );
}
