// src/lib/participantsRepo.ts
export type Mode = "piyade"; // şimdilik piyade kullanıyorsun ama yapı bozulmasın

export type Participant = {
  id: string;
  name: string;
};

function apiBase(mode: Mode) {
  return `/api/${mode}`;
}

export const participantsRepo = {
  async list(mode: Mode): Promise<Participant[]> {
    const res = await fetch(`${apiBase(mode)}/participants`, {
      cache: "no-store",
    });
    if (!res.ok) throw new Error("participants list failed");
    return (await res.json()) as Participant[];
  },

  async add(mode: Mode, name: string): Promise<Participant> {
    const res = await fetch(`${apiBase(mode)}/participants`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      body: JSON.stringify({ name }), // ✅ DİKKAT: name mutlaka burada
    });

    if (!res.ok) throw new Error("participants add failed");
    return (await res.json()) as Participant;
  },

  async updateName(mode: Mode, id: string, name: string): Promise<Participant> {
    const res = await fetch(`${apiBase(mode)}/participants/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      body: JSON.stringify({ name }),
    });

    if (!res.ok) throw new Error("participants update failed");
    return (await res.json()) as Participant;
  },

  async remove(mode: Mode, id: string): Promise<void> {
    const res = await fetch(`${apiBase(mode)}/participants/${id}`, {
      method: "DELETE",
      cache: "no-store",
    });

    if (!res.ok) throw new Error("participants remove failed");
  },
};
