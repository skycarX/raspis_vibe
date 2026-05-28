const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '')
const ACCESS_KEY = 'raspis_access_token'
const REFRESH_KEY = 'raspis_refresh_token'

const endpoint = (path) => `${API_BASE_URL}${path}`

export const tokenStore = {
  get access() {
    return localStorage.getItem(ACCESS_KEY)
  },
  get refresh() {
    return localStorage.getItem(REFRESH_KEY)
  },
  set(tokens) {
    if (tokens.access) localStorage.setItem(ACCESS_KEY, tokens.access)
    if (tokens.refresh) localStorage.setItem(REFRESH_KEY, tokens.refresh)
  },
  clear() {
    localStorage.removeItem(ACCESS_KEY)
    localStorage.removeItem(REFRESH_KEY)
  },
}

async function request(path, options = {}, retry = true) {
  const headers = new Headers(options.headers)

  if (!(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }

  if (tokenStore.access) {
    headers.set('Authorization', `Bearer ${tokenStore.access}`)
  }

  const response = await fetch(endpoint(path), {
    ...options,
    headers,
    body:
      options.body && !(options.body instanceof FormData) && typeof options.body !== 'string'
        ? JSON.stringify(options.body)
        : options.body,
  })

  if (response.status === 401 && retry && tokenStore.refresh) {
    const refreshed = await refreshToken()
    if (refreshed) return request(path, options, false)
  }

  if (response.status === 204) return null

  const text = await response.text()
  const data = text ? JSON.parse(text) : null

  if (!response.ok) {
    const detail = data?.detail || data?.non_field_errors?.join?.(', ') || response.statusText
    throw new Error(detail)
  }

  return data
}

async function refreshToken() {
  try {
    const data = await request('/api/auth/refresh/', {
      method: 'POST',
      body: { refresh: tokenStore.refresh },
    }, false)
    tokenStore.set(data)
    return true
  } catch {
    tokenStore.clear()
    return false
  }
}

const asQuery = (params = {}) => {
  const query = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.set(key, value)
    }
  })

  const value = query.toString()
  return value ? `?${value}` : ''
}

const list = async (path, params) => {
  const data = await request(`${path}${asQuery(params)}`)
  return Array.isArray(data) ? data : data?.results ?? []
}

export const api = {
  baseUrl: API_BASE_URL || 'same-origin',
  login: (payload) => request('/api/auth/login/', { method: 'POST', body: payload }),
  register: (payload) => request('/api/auth/register/', { method: 'POST', body: payload }),
  me: () => request('/api/auth/me/'),
  schools: (params) => list('/api/schools/', params),
  academicYears: (params) => list('/api/academic-years/', params),
  classGroups: (params) => list('/api/class-groups/', params),
  rooms: (params) => list('/api/rooms/', params),
  subjects: (params) => list('/api/subjects/', params),
  teachers: (params) => list('/api/teachers/', params),
  bellSchedules: (params) => list('/api/bell-schedules/', params),
  vacationTypes: (params) => list('/api/vacation-types/', params),
  vacationPeriods: (params) => list('/api/vacation-periods/', params),
  schedule: (params) => list('/api/schedule/', params),
  scheduleByClass: (id, params) => request(`/api/schedule/by-class/${id}/${asQuery(params)}`),
  scheduleByTeacher: (id, params) => request(`/api/schedule/by-teacher/${id}/${asQuery(params)}`),
  scheduleByRoom: (id, params) => request(`/api/schedule/by-room/${id}/${asQuery(params)}`),
  createScheduleEntry: (payload) => request('/api/schedule/', { method: 'POST', body: payload }),
  updateScheduleEntry: (id, payload) => request(`/api/schedule/${id}/`, { method: 'PUT', body: payload }),
  patchScheduleEntry: (id, payload) => request(`/api/schedule/${id}/`, { method: 'PATCH', body: payload }),
  deleteScheduleEntry: (id) => request(`/api/schedule/${id}/`, { method: 'DELETE' }),
  generateSchedule: (academicYearId) =>
    request('/api/schedule/generate/', {
      method: 'POST',
      body: { academic_year_id: Number(academicYearId) },
    }),
}
