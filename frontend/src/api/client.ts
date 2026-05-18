const BASE = '/api'

let _initData = ''

export function setInitData(initData: string) {
  _initData = initData
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  let res: Response
  try {
    res = await fetch(`${BASE}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'X-Init-Data': _initData,
        ...options.headers,
      },
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    throw new Error(`Сеть: ${msg} | url: ${BASE}${path} | initData: ${_initData ? _initData.length + 'б' : 'пусто'}`)
  }

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    let detail = res.status + ' ' + res.statusText
    try { detail = JSON.parse(body).detail ?? detail } catch { if (body) detail = body }
    throw new Error(detail)
  }

  if (res.status === 204) return undefined as T
  return res.json()
}

// ── Config ──────────────────────────────────────────────
import type { StudioConfig, SlotOut, BookingOut, UserOut } from '../types'

export const api = {
  getConfig: () => request<StudioConfig>('/config'),

  getMe: () => request<UserOut>('/users/me'),

  // Slots
  getSlots: (params?: { from_date?: string; to_date?: string; available_only?: boolean }) => {
    const q = new URLSearchParams()
    if (params?.from_date) q.set('from_date', params.from_date)
    if (params?.to_date) q.set('to_date', params.to_date)
    if (params?.available_only !== undefined) q.set('available_only', String(params.available_only))
    return request<SlotOut[]>(`/slots?${q}`)
  },

  createSlot: (data: { date: string; start_time: string; end_time: string }) =>
    request<SlotOut>('/slots', { method: 'POST', body: JSON.stringify(data) }),

  deleteSlot: (id: number) =>
    request<void>(`/slots/${id}`, { method: 'DELETE' }),

  toggleSlot: (id: number) =>
    request<SlotOut>(`/slots/${id}/toggle`, { method: 'PATCH' }),

  // Bookings
  createBooking: (data: {
    slot_id: number
    with_engineer: boolean
    duration_hours: number
    phone: string
    chosen_start_time?: string
  }) => request<BookingOut>('/bookings', { method: 'POST', body: JSON.stringify(data) }),

  getMyBookings: () => request<BookingOut[]>('/bookings/my'),

  getAllBookings: () => request<BookingOut[]>('/bookings'),

  updateBookingStatus: (id: number, status: string, admin_comment?: string) =>
    request<BookingOut>(`/bookings/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, admin_comment }),
    }),

  cancelBooking: (id: number) =>
    request<void>(`/bookings/${id}`, { method: 'DELETE' }),

  deleteBookingAdmin: (id: number) =>
    request<void>(`/bookings/${id}/admin`, { method: 'DELETE' }),
}
