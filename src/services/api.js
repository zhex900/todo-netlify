const API_BASE = "/api";

export async function getAds() {
  const res = await fetch(`${API_BASE}/ads`);

  if (!res.ok) {
    throw new Error("Failed to fetch ads");
  }

  return res.json();
}
