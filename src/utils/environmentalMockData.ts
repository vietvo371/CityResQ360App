/**
 * GreenEduMap - Environmental Mock Data
 * 
 * Mock data for development and testing:
 * - Air quality data
 * - Weather data
 * - Solar/energy data
 * - Green actions
 * - Courses
 * - Achievements
 */

// ============================================================================
// AIR QUALITY DATA (OpenAQ Mock)
// ============================================================================

export interface AirQualityData {
  location: {
    latitude: number;
    longitude: number;
    name: string;
    city: string;
    country: string;
  };
  measurements: {
    pm25: number;      // PM2.5 (µg/m³)
    pm10: number;      // PM10 (µg/m³)
    o3: number;        // Ozone (µg/m³)
    no2: number;       // Nitrogen Dioxide (µg/m³)
    so2: number;       // Sulfur Dioxide (µg/m³)
    co: number;        // Carbon Monoxide (µg/m³)
  };
  aqi: number;
  status: 'Good' | 'Moderate' | 'Unhealthy for Sensitive Groups' | 'Unhealthy' | 'Very Unhealthy' | 'Hazardous';
  timestamp: string;
  source: 'OpenAQ';
}

export const mockAirQualityData: AirQualityData[] = [
  {
    location: {
      latitude: 16.068882,
      longitude: 108.245350,
      name: 'Da Nang City Center',
      city: 'Da Nang',
      country: 'Vietnam',
    },
    measurements: {
      pm25: 35.2,
      pm10: 45.8,
      o3: 60.5,
      no2: 25.3,
      so2: 8.2,
      co: 450.0,
    },
    aqi: 85,
    status: 'Moderate',
    timestamp: new Date().toISOString(),
    source: 'OpenAQ',
  },
  {
    location: {
      latitude: 21.0285,
      longitude: 105.8542,
      name: 'Hanoi Center',
      city: 'Hanoi',
      country: 'Vietnam',
    },
    measurements: {
      pm25: 55.5,
      pm10: 75.2,
      o3: 45.8,
      no2: 38.5,
      so2: 12.5,
      co: 750.0,
    },
    aqi: 125,
    status: 'Unhealthy for Sensitive Groups',
    timestamp: new Date().toISOString(),
    source: 'OpenAQ',
  },
];

// ============================================================================
// WEATHER DATA (OpenWeather Mock)
// ============================================================================

export interface WeatherData {
  location: {
    latitude: number;
    longitude: number;
    name: string;
  };
  current: {
    temp: number;           // Temperature (°C)
    feelsLike: number;      // Feels like (°C)
    humidity: number;       // Humidity (%)
    pressure: number;       // Pressure (hPa)
    windSpeed: number;      // Wind speed (m/s)
    windDeg: number;        // Wind direction (degrees)
    clouds: number;         // Cloudiness (%)
    uvi: number;           // UV index
    visibility: number;     // Visibility (meters)
    description: string;
    icon: string;
  };
  forecast: Array<{
    date: string;
    temp: { min: number; max: number };
    humidity: number;
    description: string;
    icon: string;
  }>;
  timestamp: string;
  source: 'OpenWeather';
}

export const mockWeatherData: WeatherData = {
  location: {
    latitude: 16.068882,
    longitude: 108.245350,
    name: 'Da Nang',
  },
  current: {
    temp: 28,
    feelsLike: 31,
    humidity: 65,
    pressure: 1013,
    windSpeed: 3.5,
    windDeg: 180,
    clouds: 40,
    uvi: 7,
    visibility: 10000,
    description: 'Partly Cloudy',
    icon: 'weather-partly-cloudy',
  },
  forecast: [
    {
      date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      temp: { min: 24, max: 30 },
      humidity: 70,
      description: 'Light Rain',
      icon: 'weather-rainy',
    },
    {
      date: new Date(Date.now() + 172800000).toISOString().split('T')[0],
      temp: { min: 23, max: 29 },
      humidity: 75,
      description: 'Cloudy',
      icon: 'weather-cloudy',
    },
    {
      date: new Date(Date.now() + 259200000).toISOString().split('T')[0],
      temp: { min: 25, max: 31 },
      humidity: 60,
      description: 'Sunny',
      icon: 'weather-sunny',
    },
  ],
  timestamp: new Date().toISOString(),
  source: 'OpenWeather',
};

// ============================================================================
// SOLAR/ENERGY DATA (NASA POWER Mock)
// ============================================================================

export interface SolarData {
  location: {
    latitude: number;
    longitude: number;
    name: string;
  };
  solar: {
    radiation: number;        // Solar radiation (kWh/m²/day)
    uvIndex: number;          // UV index
    sunriseTime: string;
    sunsetTime: string;
    daylightHours: number;
    solarPotential: number;   // Solar energy potential (kWh/m²/day)
  };
  timestamp: string;
  source: 'NASA POWER';
}

export const mockSolarData: SolarData = {
  location: {
    latitude: 16.068882,
    longitude: 108.245350,
    name: 'Da Nang',
  },
  solar: {
    radiation: 5.8,
    uvIndex: 7,
    sunriseTime: '06:00:00',
    sunsetTime: '18:15:00',
    daylightHours: 12.25,
    solarPotential: 5.2,
  },
  timestamp: new Date().toISOString(),
  source: 'NASA POWER',
};

// ============================================================================
// GREEN ACTIONS
// ============================================================================

export interface GreenActionTemplate {
  id: string;
  type: 'transport' | 'energy' | 'waste' | 'water' | 'food' | 'education' | 'community';
  title: string;
  description: string;
  averageCarbonSaved: number; // kg CO2
  difficulty: 'easy' | 'medium' | 'hard';
  icon: string;
  tips: string[];
}

export const mockGreenActionTemplates: GreenActionTemplate[] = [
  {
    id: '1',
    type: 'transport',
    title: 'Use Public Transport',
    description: 'Take bus or metro instead of driving',
    averageCarbonSaved: 2.3,
    difficulty: 'easy',
    icon: 'bus',
    tips: [
      'Plan your route in advance',
      'Use transit apps for schedules',
      'Consider monthly passes for savings',
    ],
  },
  {
    id: '2',
    type: 'transport',
    title: 'Bike to Work',
    description: 'Cycle instead of using motorized transport',
    averageCarbonSaved: 3.5,
    difficulty: 'medium',
    icon: 'bike',
    tips: [
      'Check bike lanes in your area',
      'Invest in a good quality bike',
      'Always wear a helmet',
    ],
  },
  {
    id: '3',
    type: 'energy',
    title: 'Turn Off Unused Lights',
    description: 'Switch off lights when leaving a room',
    averageCarbonSaved: 0.5,
    difficulty: 'easy',
    icon: 'lightbulb-off',
    tips: [
      'Use natural light during day',
      'Install motion sensors',
      'Switch to LED bulbs',
    ],
  },
  {
    id: '4',
    type: 'waste',
    title: 'Recycle Waste',
    description: 'Sort and recycle household waste',
    averageCarbonSaved: 1.2,
    difficulty: 'easy',
    icon: 'recycle',
    tips: [
      'Learn local recycling rules',
      'Clean containers before recycling',
      'Separate different materials',
    ],
  },
  {
    id: '5',
    type: 'food',
    title: 'Eat Plant-Based Meal',
    description: 'Choose vegetarian/vegan meal instead of meat',
    averageCarbonSaved: 2.0,
    difficulty: 'easy',
    icon: 'food-apple',
    tips: [
      'Try meatless Mondays',
      'Explore new plant-based recipes',
      'Visit vegetarian restaurants',
    ],
  },
];

// ============================================================================
// COURSES
// ============================================================================

export interface Course {
  id: string;
  title: string;
  description: string;
  category: 'environmental_science' | 'climate_change' | 'renewable_energy' | 'sustainability';
  duration: string;
  lessons: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  icon: string;
  color: string;
  instructor: string;
  rating: number;
  enrolledStudents: number;
  thumbnail?: string;
}

export const mockCourses: Course[] = [
  {
    id: '1',
    title: 'Climate Change Basics',
    description: 'Understanding the science behind climate change, its causes, impacts, and solutions',
    category: 'climate_change',
    duration: '2 hours',
    lessons: 8,
    difficulty: 'Beginner',
    icon: 'weather-cloudy',
    color: '#2196F3',
    instructor: 'Dr. Sarah Johnson',
    rating: 4.8,
    enrolledStudents: 1250,
  },
  {
    id: '2',
    title: 'Renewable Energy 101',
    description: 'Introduction to solar, wind, hydro, and other clean energy sources',
    category: 'renewable_energy',
    duration: '3 hours',
    lessons: 12,
    difficulty: 'Beginner',
    icon: 'solar-power',
    color: '#FF9800',
    instructor: 'Prof. Michael Chen',
    rating: 4.9,
    enrolledStudents: 2100,
  },
  {
    id: '3',
    title: 'Sustainable Living Practices',
    description: 'Practical tips and strategies for eco-friendly lifestyle choices',
    category: 'sustainability',
    duration: '1.5 hours',
    lessons: 6,
    difficulty: 'Beginner',
    icon: 'leaf',
    color: '#4CAF50',
    instructor: 'Emma Green',
    rating: 4.7,
    enrolledStudents: 1800,
  },
  {
    id: '4',
    title: 'Air Quality & Health',
    description: 'How air pollution affects our health and what we can do about it',
    category: 'environmental_science',
    duration: '2.5 hours',
    lessons: 10,
    difficulty: 'Intermediate',
    icon: 'air-filter',
    color: '#9C27B0',
    instructor: 'Dr. James Wilson',
    rating: 4.6,
    enrolledStudents: 950,
  },
];

// ============================================================================
// ACHIEVEMENTS & BADGES
// ============================================================================

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: string;
  points: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export const mockAchievements: Achievement[] = [
  {
    id: '1',
    name: 'First Steps',
    description: 'Complete your first green action',
    icon: '🌱',
    condition: '1 action completed',
    points: 10,
    rarity: 'common',
  },
  {
    id: '2',
    name: 'Green Warrior',
    description: 'Complete 10 green actions',
    icon: '🌿',
    condition: '10 actions completed',
    points: 50,
    rarity: 'common',
  },
  {
    id: '3',
    name: 'Eco Champion',
    description: 'Complete 100 green actions',
    icon: '🌳',
    condition: '100 actions completed',
    points: 500,
    rarity: 'rare',
  },
  {
    id: '4',
    name: 'Streak Master',
    description: 'Maintain a 30-day action streak',
    icon: '🔥',
    condition: '30-day streak',
    points: 300,
    rarity: 'epic',
  },
  {
    id: '5',
    name: 'Carbon Crusher',
    description: 'Save 100kg of CO2',
    icon: '🏆',
    condition: '100kg CO2 saved',
    points: 1000,
    rarity: 'legendary',
  },
  {
    id: '6',
    name: 'Environmental Scholar',
    description: 'Complete 5 environmental courses',
    icon: '🎓',
    condition: '5 courses completed',
    points: 200,
    rarity: 'rare',
  },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export const getAQIColor = (aqi: number): string => {
  if (aqi <= 50) return '#4CAF50';    // Good
  if (aqi <= 100) return '#FFEB3B';   // Moderate
  if (aqi <= 150) return '#FF9800';   // Unhealthy for sensitive
  if (aqi <= 200) return '#F44336';   // Unhealthy
  if (aqi <= 300) return '#9C27B0';   // Very unhealthy
  return '#7B1FA2';                    // Hazardous
};

export const getAQIStatus = (aqi: number): string => {
  if (aqi <= 50) return 'Good';
  if (aqi <= 100) return 'Moderate';
  if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
  if (aqi <= 200) return 'Unhealthy';
  if (aqi <= 300) return 'Very Unhealthy';
  return 'Hazardous';
};

export const calculateCarbonSaved = (actionType: string): number => {
  const carbonValues: Record<string, number> = {
    transport: 2.5,
    energy: 1.0,
    waste: 1.2,
    water: 0.8,
    food: 2.0,
    education: 0.5,
    community: 1.5,
  };
  return carbonValues[actionType] || 1.0;
};

export default {
  mockAirQualityData,
  mockWeatherData,
  mockSolarData,
  mockGreenActionTemplates,
  mockCourses,
  mockAchievements,
  getAQIColor,
  getAQIStatus,
  calculateCarbonSaved,
};

