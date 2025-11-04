export interface LeaderboardUser {
  id: string;
  name: string | null;
  image: string | null;
  score: number;
}

export interface LeaderboardResponse {
  data: LeaderboardUser[];
  meta: {
    totalUsers: number;
    page: number;
    limit: number;
    totalPages: number;
    isFrozen?: boolean;
  };
}
