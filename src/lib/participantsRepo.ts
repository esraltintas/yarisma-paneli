export type Participant = { id: string; name: string };

async function throwIfNotOk(res: Response, msg: string) {
  if (res.ok) return;

  const text = await res.text().catch(() => "");
  throw new Error(
    `${msg} (status ${res.status}) ${text ? `\n${text.slice(0, 500)}` : ""}`,
  );
}

export const participantsRepo = {
  async list(): Promise<Participant[]> {
    const res = await fetch("/api/piyade/participants", { cache: "no-store" });
    await throwIfNotOk(res, "participants list failed");
    return (await res.json()) as Participant[];
  },

  async add(name: string): Promise<Participant> {
    const res = await fetch("/api/piyade/participants", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    await throwIfNotOk(res, "participants add failed");
    return (await res.json()) as Participant;
  },
};
