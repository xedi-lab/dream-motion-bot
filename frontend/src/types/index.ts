export type Theme = 'dark' | 'light'

export type Page = 'home' | 'booking' | 'my-bookings' | 'admin-dashboard' | 'admin-slots'

export type BookingStep = 'date' | 'slot' | 'options' | 'phone' | 'summary' | 'done'

export type BookingStatus = 'pending' | 'approved' | 'rejected' | 'cancelled'

export interface StudioConfig {
  studio_name: string
  city: string
  address?: string
  about?: string
  features?: string[]
  currency: string
  min_session_hours: number
  price_per_hour: number
  price_per_hour_with_engineer: number
  working_hours: { from: number; to: number }
  admin_ids: number[]
}

export interface SlotOut {
  id: number
  date: string        // ISO date "2025-01-15"
  start_time: string  // "HH:MM:SS"
  end_time: string
  is_available: boolean
}

export interface UserOut {
  id: number
  username: string | null
  first_name: string | null
  phone: string | null
  is_admin: boolean
}

export interface BookingOut {
  id: number
  slot_id: number
  with_engineer: boolean
  duration_hours: number
  total_price: number
  phone: string
  status: BookingStatus
  admin_comment: string | null
  created_at: string
  user: UserOut
  slot: SlotOut
}

export interface BookingDraft {
  date: string | null
  slot: SlotOut | null
  durationHours: number
  withEngineer: boolean
  phone: string
}
