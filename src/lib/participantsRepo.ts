// src/lib/participantsRepo.ts
export type Mode = "piyade";

export type Participant = {
  id: string;
  name: string;
  createdAt?: string;
};

export const participantsRepo = {
  async list(_mode: Mode): Promise<Participant[]> {
    const res = await fetch("/api/piyade/participants", { cache: "no-store" });
    if (!res.ok) throw new Error("participants list failed");
    return (await res.json()) as Participant[];
  },

  async add(_mode: Mode, name: string): Promise<Participant> {
    const res = await fetch("/api/piyade/participants", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    if (!res.ok) throw new Error("participants add failed");
    return (await res.json()) as Participant;
  },

  async updateName(
    _mode: Mode,
    id: string,
    name: string,
  ): Promise<Participant> {
    const res = await fetch(`/api/piyade/participants/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    if (!res.ok) throw new Error("participants updateName failed");
    return (await res.json()) as Participant;
  },

  async remove(_mode: Mode, id: string): Promise<void> {
    const res = await fetch(`/api/piyade/participants/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("participants remove failed");
  },
};
