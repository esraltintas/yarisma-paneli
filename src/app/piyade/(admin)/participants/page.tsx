import ParticipantsClient from "@/components/ParticipantsClient";

export default function Page() {
  return (
    <>
      <div style={{ maxWidth: 1200, margin: "18px auto", padding: "0 18px" }}>
        <ParticipantsClient mode="piyade" />
      </div>
    </>
  );
}
