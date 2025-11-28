// Statistics Types

export interface OverviewStats {
    total_reports: number;
    verified_reports: number;
    resolved_reports: number;
    total_votes: number;
    city_points: number;
    reputation_score: number;
    accuracy_rate: number;
    badge_level: number;
}

export interface CategoryStats {
    category: number; // 0:traffic, 1:environment, 2:fire, 3:waste, 4:flood, 5:other
    category_name: string;
    count: number;
    percentage: number;
    verified_count: number;
    resolved_count: number;
}

export interface TimelineStats {
    period: '7d' | '30d' | '90d' | '1y';
    data_points: TimelineDataPoint[];
}

export interface TimelineDataPoint {
    date: string; // YYYY-MM-DD
    total: number;
    verified: number;
    resolved: number;
}

export interface LeaderboardEntry {
    rank: number;
    user_id: number;
    user_name: string;
    avatar?: string;
    total_reports: number;
    city_points: number;
    badge_level: number;
    accuracy_rate: number;
}

export interface CityStats {
    total_reports: number;
    total_users: number;
    active_reports: number;
    resolved_reports: number;
    total_votes: number;
    avg_resolution_time: number; // in hours
    categories: CategoryStats[];
    recent_activity: {
        today: number;
        this_week: number;
        this_month: number;
    };
}
