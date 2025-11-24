import api from '../utils/Api';
import { ApiResponse } from '../types/api/common';
import { MapReport, HeatmapPoint, Route, MapBounds } from '../types/api/map';

export const mapService = {
    getMapReports: async (bounds: MapBounds, filters?: any): Promise<ApiResponse<MapReport[]>> => {
        const boundsStr = `${bounds.min_lat},${bounds.min_lon},${bounds.max_lat},${bounds.max_lon}`;
        const response = await api.get<ApiResponse<MapReport[]>>('/map/reports', {
            params: { bounds: boundsStr, ...filters }
        });
        return response.data;
    },

    getHeatmap: async (bounds: MapBounds, filters?: any): Promise<ApiResponse<HeatmapPoint[]>> => {
        const boundsStr = `${bounds.min_lat},${bounds.min_lon},${bounds.max_lat},${bounds.max_lon}`;
        const response = await api.get<ApiResponse<HeatmapPoint[]>>('/map/heatmap', {
            params: { bounds: boundsStr, ...filters }
        });
        return response.data;
    },

    getRoutes: async (lat: number, long: number, radius: number = 2): Promise<ApiResponse<Route[]>> => {
        const response = await api.get<ApiResponse<Route[]>>('/map/routes', {
            params: { vi_do: lat, kinh_do: long, radius }
        });
        return response.data;
    }
};
