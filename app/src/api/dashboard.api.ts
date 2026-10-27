const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

export interface DashboardData {
  missed: number;
  collectionRate: number;
  avgResolutionHours: number;
  routeAdherence: number;
  ticketsOpened: number;
  cleanlinessScore: number;
}

type WeeklyMetrics = Omit<DashboardData, 'cleanlinessScore'>;

export async function getDashboardData(): Promise<DashboardData> {
  const weeklyResponse = await fetch(`${API_URL}/dashboard/week`);
  if (!weeklyResponse.ok) {
    throw new Error(`Failed to load dashboard data (HTTP ${weeklyResponse.status}).`);
  }
  const weekly = (await weeklyResponse.json()) as WeeklyMetrics;

  const params = new URLSearchParams({
    collectionRate: String(weekly.collectionRate),
    avgResolutionHours: String(weekly.avgResolutionHours),
    routeAdherence: String(weekly.routeAdherence),
  });
  const scoreResponse = await fetch(`${API_URL}/dashboard/score?${params}`);
  if (!scoreResponse.ok) {
    throw new Error(`Failed to load the cleanliness score (HTTP ${scoreResponse.status}).`);
  }

  return {
    ...weekly,
    cleanlinessScore: (await scoreResponse.json()) as number,
  };
}
