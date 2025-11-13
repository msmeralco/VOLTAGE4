// Mock data generators for GridPulse

export type UserType = "Meralco" | "Barangay" | "Consumer";

export interface User {
  id: string;
  email: string;
  password: string;
  userType: UserType;
  name: string;
  city?: string;
  barangay?: string;
}

export interface Transformer {
  id: string;
  name: string;
  city: string;
  barangay: string;
  latitude: number;
  longitude: number;
  currentLoad: number; // kW
  capacity: number; // kW
  households: string[]; // household IDs
}

export interface Household {
  id: string;
  transformerId: string;
  latitude: number;
  longitude: number;
  consumerId?: string;
}

export interface WeatherData {
  temperature: number; // Celsius
  humidity: number; // %
  pressure: number; // hPa
  windSpeed: number; // m/s
  condition: string;
}

export interface SmartMeterData {
  consumerId: string;
  currentConsumption: number; // kWh
  daily: { date: string; consumption: number }[];
  weekly: { week: string; consumption: number }[];
  monthly: { month: string; consumption: number }[];
}

// Mock users
export const mockUsers: User[] = [
  {
    id: "1",
    email: "meralco@gridpulse.com",
    password: "meralco123",
    userType: "Meralco",
    name: "Meralco Admin",
  },
  {
    id: "2",
    email: "barangay@gridpulse.com",
    password: "barangay123",
    userType: "Barangay",
    name: "Barangay Admin",
    city: "Manila",
    barangay: "Barangay 1",
  },
  {
    id: "3",
    email: "consumer@gridpulse.com",
    password: "consumer123",
    userType: "Consumer",
    name: "John Doe",
  },
];

// Mock cities
export const cities = ["Manila", "Quezon City", "Makati", "Pasig", "Taguig"];

// Mock barangays per city
export const barangaysByCity: Record<string, string[]> = {
  Manila: ["Barangay 1", "Barangay 2", "Barangay 3"],
  "Quezon City": ["Barangay A", "Barangay B", "Barangay C"],
  Makati: ["Barangay X", "Barangay Y", "Barangay Z"],
  Pasig: ["Barangay Alpha", "Barangay Beta"],
  Taguig: ["Barangay North", "Barangay South"],
};

// Generate mock transformers
export function generateMockTransformers(city?: string): Transformer[] {
  const transformers: Transformer[] = [];
  const citiesToUse = city ? [city] : cities;

  citiesToUse.forEach((c) => {
    const barangays = barangaysByCity[c] || [];
    barangays.forEach((barangay, bIndex) => {
      for (let i = 0; i < 3; i++) {
        transformers.push({
          id: `transformer-${c}-${barangay}-${i}`,
          name: `Transformer ${i + 1} - ${barangay}`,
          city: c,
          barangay,
          latitude: 14.6 + (bIndex * 0.05) + (i * 0.01) + Math.random() * 0.02,
          longitude: 121.0 + (bIndex * 0.05) + (i * 0.01) + Math.random() * 0.02,
          currentLoad: Math.random() * 500 + 100, // 100-600 kW
          capacity: 800,
          households: [],
        });
      }
    });
  });

  return transformers;
}

// Generate mock households
export function generateMockHouseholds(transformers: Transformer[]): Household[] {
  const households: Household[] = [];
  
  transformers.forEach((transformer) => {
    const householdCount = Math.floor(Math.random() * 20) + 10; // 10-30 households per transformer
    
    for (let i = 0; i < householdCount; i++) {
      const household: Household = {
        id: `household-${transformer.id}-${i}`,
        transformerId: transformer.id,
        latitude: transformer.latitude + (Math.random() - 0.5) * 0.01,
        longitude: transformer.longitude + (Math.random() - 0.5) * 0.01,
      };
      
      households.push(household);
      transformer.households.push(household.id);
    }
  });

  return households;
}

// Generate mock weather data
export function generateMockWeather(city: string): WeatherData {
  return {
    temperature: Math.random() * 10 + 25, // 25-35°C
    humidity: Math.random() * 30 + 60, // 60-90%
    pressure: Math.random() * 20 + 1010, // 1010-1030 hPa
    windSpeed: Math.random() * 10 + 5, // 5-15 m/s
    condition: ["Sunny", "Cloudy", "Partly Cloudy", "Rainy"][Math.floor(Math.random() * 4)],
  };
}

// Generate mock smart meter data
export function generateMockSmartMeterData(consumerId: string): SmartMeterData {
  const now = new Date();
  const daily: { date: string; consumption: number }[] = [];
  const weekly: { week: string; consumption: number }[] = [];
  const monthly: { month: string; consumption: number }[] = [];

  // Generate daily data for last 30 days
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    daily.push({
      date: date.toISOString().split("T")[0],
      consumption: Math.random() * 20 + 10, // 10-30 kWh
    });
  }

  // Generate weekly data for last 12 weeks
  for (let i = 11; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i * 7);
    weekly.push({
      week: `Week ${12 - i}`,
      consumption: Math.random() * 150 + 100, // 100-250 kWh
    });
  }

  // Generate monthly data for last 12 months
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  for (let i = 11; i >= 0; i--) {
    const date = new Date(now);
    date.setMonth(date.getMonth() - i);
    monthly.push({
      month: months[date.getMonth()],
      consumption: Math.random() * 600 + 400, // 400-1000 kWh
    });
  }

  return {
    consumerId,
    currentConsumption: Math.random() * 20 + 10,
    daily,
    weekly,
    monthly,
  };
}

// Calculate grid health
export function calculateGridHealth(
  currentLoad: number,
  capacity: number,
  temperature: number,
  humidity: number,
  pressure: number
): number {
  // Simple formula: health decreases with load percentage, temperature, and humidity
  const loadPercentage = (currentLoad / capacity) * 100;
  const tempFactor = temperature > 30 ? (temperature - 30) * 2 : 0;
  const humidityFactor = humidity > 80 ? (humidity - 80) * 0.5 : 0;
  
  let health = 100;
  health -= (loadPercentage - 50) * 0.5; // Penalty for high load
  health -= tempFactor;
  health -= humidityFactor;
  
  return Math.max(0, Math.min(100, health));
}

// Generate predictive insights
export function generatePredictiveInsights(
  transformer: Transformer,
  weather: WeatherData
): string[] {
  const insights: string[] = [];
  const loadPercentage = (transformer.currentLoad / transformer.capacity) * 100;

  if (loadPercentage > 75) {
    insights.push(`Transformer ${transformer.name} load nearing 80% capacity`);
  }

  if (weather.condition === "Rainy" || weather.condition === "Cloudy") {
    insights.push("Lighting usage expected to increase by 5% this evening");
  }

  if (transformer.currentLoad > transformer.capacity * 0.7) {
    insights.push("Potential overload risk detected");
  }

  if (loadPercentage < 30) {
    insights.push("Suggested maintenance window: Low load period available");
  }

  return insights;
}

