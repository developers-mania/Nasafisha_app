import type { DumpingSite } from "../types/dumpingSite";

const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

export async function getDumpingSites(): Promise<DumpingSite[]> {
    const response = await fetch(`${API_URL}/admin/dumping-sites`);

    if (!response.ok) {
        throw new Error("Failed to load dumping sites");
    }

    return response.json();
}

export async function getDumpingSite(id: string): Promise<DumpingSite> {
    const response = await fetch(`${API_URL}/admin/dumping-sites/${id}`);

    if (!response.ok) {
        throw new Error("Failed to load dumping site");
    }

    return response.json();
}
