import api from '../utils/Api';
import { ApiResponse } from '../types/api/common';
import { MapReport, HeatmapPoint, Route, MapBounds } from '../types/api/map';
import env from '../config/env';

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
    },

    reverseGeocode: async (lat: number, long: number): Promise<string> => {
        try {
            // Using OpenStreetMap Nominatim API
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${long}&zoom=18&addressdetails=1`,
                {
                    headers: {
                        'User-Agent': 'CityResQ360App/1.0', // Required by Nominatim usage policy
                        'Accept-Language': 'vi' // Request Vietnamese results
                    }
                }
            );
            const data = await response.json();
            console.log('Reverse geocoding response:', data);
            if (data.display_name) {
                return data.display_name;
            }
            return `${lat.toFixed(6)}, ${long.toFixed(6)}`;
        } catch (error) {
            console.error('Reverse geocoding error:', error);
            return `${lat.toFixed(6)}, ${long.toFixed(6)}`;
        }
    }
};
