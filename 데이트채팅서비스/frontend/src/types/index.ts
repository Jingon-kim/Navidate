// User Types
export interface User {
  id: string
  email: string
  nickname: string
  profileImage?: string
  coupleId?: string
  createdAt: Date
}

// Couple Types
export interface Couple {
  id: string
  coupleCode: string
  users: [string, string]
  region: string[]
  transport: string
  createdAt: Date
}

// Preference Types
export interface CouplePreference {
  coupleId: string
  categoryScores: {
    food: Record<string, number>
    activity: Record<string, number>
    mood: Record<string, number>
  }
  regionScores: Record<string, number>
  budgetPreference: 'budget' | 'medium' | 'luxury'
  recentInterests: string[]
  updatedAt: Date
}

// Place Types
export interface Place {
  id: string
  name: string
  category: string
  location: {
    lat: number
    lng: number
    address: string
    region: string
  }
  description: string
  imageUrl?: string
  rating?: number
  priceRange?: 'budget' | 'medium' | 'luxury'
  tags: string[]
}

// Date Plan Types
export interface DatePlan {
  id: string
  coupleId: string
  date: Date
  places: DatePlanPlace[]
  status: 'planned' | 'completed'
  rating?: number
  memo?: string
}

export interface DatePlanPlace {
  placeId: string
  name: string
  category: string
  time: string
  matchedBy: 'sync' | 'ai' | 'manual'
}

// Message Types
export interface Message {
  id: string
  coupleId: string
  senderId: string
  text: string
  createdAt: Date
  keywords?: string[]
}

// Daily Content Types
export interface DailyContent {
  date: Date
  hotPlaces: HotPlace[]
  events: Event[]
  weather: Weather
  updatedAt: Date
}

export interface HotPlace {
  name: string
  category: string
  reason: string
  location: string
  source: string
}

export interface Event {
  title: string
  period: { start: Date; end: Date }
  location: string
  type: 'popup' | 'exhibition' | 'festival' | 'sale'
}

export interface Weather {
  condition: string
  temperature: number
  recommendation: string
}

// Category Types
export type CategoryId =
  | 'food'
  | 'cafe'
  | 'movie'
  | 'game'
  | 'activity'
  | 'walk'
  | 'shopping'
  | 'exhibition'
  | 'bar'
  | 'karaoke'
  | 'park'
  | 'random'

export interface Category {
  id: CategoryId
  icon: string
  name: string
  color: string
}
