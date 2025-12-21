export default async function StagePage({
  params,
}: {
  params: Promise<{ stageId: string }>;
}) {
  const { stageId } = await params;

  return (
    <>
      <h1>Etap: {stageId}</h1>
      <p>Bu etap için süre girişleri ve etap sonuçları burada olacak.</p>
    </>
  );
}
