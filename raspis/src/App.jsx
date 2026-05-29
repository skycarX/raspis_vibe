/* eslint-disable react-hooks/set-state-in-effect */
import { Fragment, useCallback, useEffect, useMemo, useState } from 'react'
import { api, tokenStore } from './api'
import './App.css'

const emptyEntry = {
  day_of_week: 1,
  period_number: 1,
  week_parity: 0,
  valid_to: '',
  is_substitution: false,
  class_group: '',
  subgroup: '',
  subject: '',
  teacher: '',
  room: '',
  academic_year: '',
}

const dayNames = {
  1: 'Понедельник',
  2: 'Вторник',
  3: 'Среда',
  4: 'Четверг',
  5: 'Пятница',
  6: 'Суббота',
  7: 'Воскресенье',
}

const dayNamesShort = {
  1: 'Пн',
  2: 'Вт',
  3: 'Ср',
  4: 'Чт',
  5: 'Пт',
  6: 'Сб',
  7: 'Вс',
}

const weekParityLabels = {
  0: 'Обе недели',
  1: 'Нечетная',
  2: 'Четная',
}

const subjectColors = ['#2563eb', '#dc2626', '#b45309', '#16a34a', '#7c3aed', '#0891b2', '#0f766e', '#be185d', '#e11d48', '#ea580c']

// ============================================
// ИКОНКИ
// ============================================
function Icon({ name }) {
  const paths = {
    grid: (
      <>
        <path d="M4 4h7v7H4z" />
        <path d="M13 4h7v7h-7z" />
        <path d="M4 13h7v7H4z" />
        <path d="M13 13h7v7h-7z" />
      </>
    ),
    wand: (
      <>
        <path d="m5 19 14-14" />
        <path d="m14 5 5 5" />
        <path d="M5 5v3" />
        <path d="M3.5 6.5h3" />
        <path d="M18 16v3" />
        <path d="M16.5 17.5h3" />
      </>
    ),
    edit: (
      <>
        <path d="M4 20h4l11-11-4-4L4 16z" />
        <path d="m13.5 6.5 4 4" />
      </>
    ),
    shield: (
      <>
        <path d="M12 3 5 6v5c0 4.5 2.9 8.2 7 10 4.1-1.8 7-5.5 7-10V6z" />
        <path d="m9 12 2 2 4-5" />
      </>
    ),
    user: (
      <>
        <path d="M19 21a7 7 0 0 0-14 0" />
        <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
      </>
    ),
    plus: (
      <>
        <path d="M12 5v14" />
        <path d="M5 12h14" />
      </>
    ),
    save: (
      <>
        <path d="M5 3h12l2 2v16H5z" />
        <path d="M8 3v6h8V3" />
        <path d="M8 21v-7h8v7" />
      </>
    ),
    search: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="m16 16 4 4" />
      </>
    ),
    alert: (
      <>
        <path d="M12 4 3 20h18z" />
        <path d="M12 9v5" />
        <path d="M12 17h.01" />
      </>
    ),
    book: (
      <>
        <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21z" />
        <path d="M4 5.5v15" />
        <path d="M8 7h8" />
      </>
    ),
    bell: (
      <>
        <path d="M6 9a6 6 0 0 1 12 0c0 7 3 7 3 9H3c0-2 3-2 3-9" />
        <path d="M10 21h4" />
      </>
    ),
    trash: (
      <>
        <path d="M3 6h18" />
        <path d="M8 6V4h8v2" />
        <path d="M19 6l-1 15H6L5 6" />
      </>
    ),
    refresh: (
      <>
        <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
        <path d="M3 21v-5h5" />
        <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
        <path d="M21 3v5h-5" />
      </>
    ),
    calendar: (
      <>
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
        <circle cx="12" cy="15" r="1" />
        <circle cx="16" cy="15" r="1" />
        <circle cx="8" cy="15" r="1" />
      </>
    ),
    clock: (
      <>
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </>
    ),
    trending: (
      <>
        <path d="M23 6l-6.5 6.5-5-5L2 17" />
        <path d="M17 6h6v6" />
      </>
    ),
  }

  return (
    <svg className="icon" viewBox="0 0 24 24" aria-hidden="true">
      {paths[name]}
    </svg>
  )
}

// ============================================
// АНИМИРОВАННАЯ ВОЛНА ЗАГРУЗКИ
// ============================================
// ============================================
// КАЛЕНДАРНАЯ СЕТКА НЕДЕЛИ
// ============================================
function WeekCalendar({ schedule, onLessonClick }) {
  const [currentDate] = useState(new Date())
  const weekDays = useMemo(() => {
    const startOfWeek = new Date(currentDate)
    const day = startOfWeek.getDay()
    const diff = startOfWeek.getDate() - (day === 0 ? 6 : day - 1)
    startOfWeek.setDate(diff)
    
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(startOfWeek)
      date.setDate(startOfWeek.getDate() + i)
      return date
    })
  }, [currentDate])

  const lessonsByDay = useMemo(() => {
    const map = {}
    for (let i = 1; i <= 7; i++) {
      map[i] = schedule.filter(entry => entry.day_of_week === i)
    }
    return map
  }, [schedule])

  const maxPeriods = useMemo(() => {
    let max = 0
    for (let i = 1; i <= 7; i++) {
      max = Math.max(max, lessonsByDay[i]?.length || 0)
    }
    return Math.min(max, 8)
  }, [lessonsByDay])

  return (
    <div className="week-calendar fade-in-scale">
      <div className="week-calendar-grid">
        <div className="week-calendar-time week-calendar-day">
          <div>Время</div>
        </div>
        {weekDays.map((date, idx) => (
          <div key={idx} className="week-calendar-day">
            <div className="week-calendar-day-name">{dayNamesShort[idx + 1]}</div>
            <div className="week-calendar-day-date">{date.getDate()}</div>
          </div>
        ))}
        
        {Array.from({ length: maxPeriods }, (_, period) => (
          <Fragment key={period}>
            <div className="week-calendar-time">
              <div>{period + 1} урок</div>
            </div>
            {weekDays.map((_, dayIdx) => {
              const dayLessons = lessonsByDay[dayIdx + 1] || []
              const lesson = dayLessons.find(l => l.period_number === period + 1)
              return (
                <div 
                  key={`${dayIdx}-${period}`} 
                  className="week-calendar-cell hover-grow"
                  onClick={() => lesson && onLessonClick?.(lesson.id)}
                >
                  {lesson && (
                    <div className="calendar-lesson">
                      <div className="calendar-lesson-subject">{lesson.subject?.name}</div>
                      <div className="calendar-lesson-room">{lesson.room?.number}</div>
                      <div style={{ fontSize: 9, color: '#64748b' }}>{lesson.teacher?.full_name?.split(' ')[0]}</div>
                    </div>
                  )}
                </div>
              )
            })}
          </Fragment>
        ))}
      </div>
    </div>
  )
}

// ============================================
// ПРОГРЕСС-БАР УЧЕБНОГО ГОДА
// ============================================
// function YearProgress({ academicYear, schedule = [] }) {
//   const [progress, setProgress] = useState(0)
//   const [weeksPassed, setWeeksPassed] = useState(0)
//   
//   useEffect(() => {
//     if (!academicYear?.start_date || !academicYear?.end_date || !academicYear?.total_weeks) return
//     
//     const start = new Date(academicYear.start_date)
//     const end = new Date(academicYear.end_date)
//     const now = new Date()
//     
//     if (now < start) {
//       setProgress(0)
//       setWeeksPassed(0)
//     } else if (now > end) {
//       setProgress(100)
//       setWeeksPassed(academicYear.total_weeks)
//     } else {
//       const totalDays = (end - start) / (1000 * 60 * 60 * 24)
//       const passedDays = (now - start) / (1000 * 60 * 60 * 24)
//       const percent = (passedDays / totalDays) * 100
//       setProgress(Math.min(100, Math.max(0, percent)))
//       setWeeksPassed(Math.floor(passedDays / 7))
//     }
//   }, [academicYear])
//   
//   const substitutionsCount = schedule.filter(s => s.is_substitution).length
//   const lessonsCount = schedule.length
//   const substitutionPercent = lessonsCount ? Math.round((substitutionsCount / lessonsCount) * 100) : 0
//   
//   return (
//     <div className="progress-year-card hover-lift">
//       <div className="progress-year-header">
//         <div>
//           <div className="progress-year-title">Учебный год</div>
//           <div style={{ fontWeight: 700 }}>
//             {academicYear?.start_date?.slice(0, 4)} — {academicYear?.end_date?.slice(0, 4)}
//           </div>
//         </div>
//         <div className="progress-year-percent">{Math.round(progress)}%</div>
//       </div>
//       
//       <div className="progress-bar-container">
//         <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
//       </div>
//       
//       <div className="progress-stats">
//         <span>{weeksPassed} / {academicYear?.total_weeks || 0} недель</span>
//         <span>🔄 Замен: {substitutionPercent}%</span>
//         <span>📚 {lessonsCount} уроков</span>
//       </div>
//       
//       <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginTop: 16, flexWrap: 'wrap' }}>
//         <div className="donut-chart">
//           <div className="donut-chart-inner">{substitutionPercent}%</div>
//         </div>
//         <div style={{ fontSize: 13, opacity: 0.8 }}>
//           <div>✅ Обычные уроки: {lessonsCount - substitutionsCount}</div>
//           <div>🔄 Замены: {substitutionsCount}</div>
//         </div>
//       </div>
//     </div>
//   )
// }

// ============================================
// ВИДЖЕТЫ
// ============================================
function toMinutes(value) {
  if (!value) return null
  const [hours, minutes] = value.split(':').map(Number)
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null
  return hours * 60 + minutes
}

function formatTimeLeft(minutes) {
  if (minutes <= 0) return ''
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  return hours ? hours + ' ч ' + rest + ' мин' : rest + ' мин'
}

// ============================================
// ВИДЖЕТЫ
// ============================================
function WidgetsGrid({ bellSchedules, schedule, rooms, weekDaysCount, onLessonClick }) {
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])

  const bellPeriods = useMemo(() => {
    return bellSchedules
      .map((bell) => ({
        ...bell,
        startMinutes: toMinutes(bell.start_time),
        endMinutes: toMinutes(bell.end_time),
      }))
      .filter((bell) => bell.startMinutes !== null && bell.endMinutes !== null)
      .sort((a, b) => a.shift_number - b.shift_number || a.period_number - b.period_number)
  }, [bellSchedules])

  const nowMinutes = currentTime.getHours() * 60 + currentTime.getMinutes()
  const today = currentTime.getDay() === 0 ? 7 : currentTime.getDay()

  const currentBellByShift = useMemo(() => {
    const map = new Map()
    bellPeriods.forEach((bell) => {
      if (nowMinutes >= bell.startMinutes && nowMinutes < bell.endMinutes) {
        map.set(bell.shift_number, bell)
      }
    })
    return map
  }, [bellPeriods, nowMinutes])

  const nextBell = useMemo(() => {
    return bellPeriods.find((bell) => bell.startMinutes > nowMinutes) || null
  }, [bellPeriods, nowMinutes])

  const lessonsByDay = useMemo(() => {
    const counts = {}
    for (let day = 1; day <= weekDaysCount; day++) counts[day] = 0
    schedule.forEach((entry) => {
      if (entry.day_of_week && counts[entry.day_of_week] !== undefined) {
        counts[entry.day_of_week] += 1
      }
    })
    return counts
  }, [schedule, weekDaysCount])

  const maxLessons = Math.max(...Object.values(lessonsByDay), 1)

  const teacherLoad = useMemo(() => {
    const load = {}
    schedule.forEach((entry) => {
      if (entry.teacher?.full_name) {
        load[entry.teacher.full_name] = (load[entry.teacher.full_name] || 0) + 1
      }
    })
    return Object.entries(load).sort((a, b) => b[1] - a[1]).slice(0, 5)
  }, [schedule])

  const currentLessons = useMemo(() => {
    if (!currentBellByShift.size) return []
    return schedule.filter((entry) => {
      const shift = entry.class_group?.shift_number
      const bell = currentBellByShift.get(shift)
      return entry.day_of_week === today && bell?.period_number === entry.period_number
    })
  }, [currentBellByShift, schedule, today])

  const currentLesson = currentLessons[0] || null
  const todayLessons = lessonsByDay[today] || 0

  const busyRoomsNow = useMemo(() => {
    return [...new Map(
      currentLessons
        .map((lesson) => lesson.room)
        .filter(Boolean)
        .map((room) => [room.id, room])
    ).values()]
  }, [currentLessons])

  const nearestSubstitution = useMemo(() => {
    return schedule
      .filter((entry) => entry.is_substitution)
      .sort((a, b) => a.day_of_week - b.day_of_week || a.period_number - b.period_number)
      .find((entry) => {
        if (entry.day_of_week > today) return true
        if (entry.day_of_week < today) return false
        const shift = entry.class_group?.shift_number
        const bell = currentBellByShift.get(shift) || nextBell
        return !bell || entry.period_number >= bell.period_number
      })
  }, [currentBellByShift, nextBell, schedule, today])

  const freeRoomsNow = bellPeriods.length ? rooms.length - busyRoomsNow.length : null
  const countdown = currentBellByShift.size
    ? 'Идет урок или перемена'
    : nextBell
      ? 'До ' + nextBell.period_number + ' урока ' + formatTimeLeft(nextBell.startMinutes - nowMinutes)
      : 'Нет уроков на сегодня'

  return (
    <div className="widgets-grid">
      <div className="widget-card current-lesson-widget hover-lift" onClick={() => currentLesson && onLessonClick?.(currentLesson.id)} style={{ cursor: currentLesson ? 'pointer' : 'default' }}>
        <div className="widget-header"><div className="widget-icon"><Icon name="bell" /></div><div><div className="widget-title">Текущий урок</div></div></div>
        {currentLesson ? <><div className="widget-value">{currentLesson.subject?.name || '-'}</div><div style={{ fontSize: 13, marginTop: 4 }}>{currentLesson.teacher?.full_name?.split(' ').slice(0, 2).join(' ')}</div><div className="countdown-timer">{countdown}</div><div style={{ fontSize: 11, marginTop: 8, opacity: 0.7 }}>Кабинет: {currentLesson.room?.number || '-'}</div></> : <><div className="widget-value">Нет урока</div><div className="countdown-timer">{countdown}</div></>}
      </div>

      <div className="widget-card hover-lift"><div className="widget-header"><div className="widget-icon"><Icon name="calendar" /></div><div><div className="widget-title">Сегодня уроков</div></div></div><div className="widget-value">{todayLessons}</div><div style={{ fontSize: 13, marginTop: 8, color: 'var(--text-secondary)' }}>Всего в расписании: {schedule.length}</div></div>

      <div className="widget-card hover-lift"><div className="widget-header"><div className="widget-icon"><Icon name="refresh" /></div><div><div className="widget-title">Ближайшая замена</div></div></div>{nearestSubstitution ? <><div className="widget-value">{nearestSubstitution.subject?.name}</div><div style={{ fontSize: 13 }}>{dayNamesShort[nearestSubstitution.day_of_week]}, {nearestSubstitution.period_number} урок</div><div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Учитель: {nearestSubstitution.teacher?.full_name?.split(' ')[0]}</div></> : <div className="widget-value">Нет замен</div>}</div>

      <div className="widget-card hover-lift"><div className="widget-header"><div className="widget-icon"><Icon name="book" /></div><div><div className="widget-title">Свободные кабинеты</div></div></div><div className="widget-value">{freeRoomsNow ?? '-'}</div><div style={{ fontSize: 13, marginTop: 8 }}>{bellPeriods.length ? 'Из ' + rooms.length + ' кабинетов' : 'Нет данных о звонках'}</div>{busyRoomsNow.length > 0 && <div style={{ fontSize: 11, marginTop: 8, color: 'var(--text-secondary)' }}>Занятые кабинеты: {busyRoomsNow.slice(0, 3).map((room) => room.number).join(', ')}{busyRoomsNow.length > 3 ? '...' : ''}</div>}</div>

      <div className="widget-card hover-lift"><div className="widget-header"><div className="widget-icon"><Icon name="trending" /></div><div><div className="widget-title">Нагрузка по дням</div></div></div><div className="week-stats-chart">{Object.keys(lessonsByDay).map((day) => Number(day)).map((day) => <div key={day} style={{ flex: 1, textAlign: 'center' }}><div className="chart-bar" style={{ height: ((lessonsByDay[day] / maxLessons) * 60) + 'px' }} /><div className="chart-label">{dayNamesShort[day]}</div></div>)}</div></div>

      <div className="widget-card hover-lift"><div className="widget-header"><div className="widget-icon"><Icon name="user" /></div><div><div className="widget-title">Нагрузка учителей</div></div></div><div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>{teacherLoad.map(([name, count], idx) => <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 8 }}><div style={{ width: 24, height: 24, background: 'linear-gradient(135deg, ' + subjectColors[idx % subjectColors.length] + '40, ' + subjectColors[idx % subjectColors.length] + '20)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>{idx + 1}</div><div style={{ flex: 1, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name.length > 20 ? name.slice(0, 20) + '…' : name}</div><div style={{ fontSize: 16, fontWeight: 700 }}>{count}</div></div>)}{teacherLoad.length === 0 && <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: 16 }}>Нет данных</div>}</div></div>
    </div>
  )
}

// ============================================
// ОСНОВНОЙ КОМПОНЕНТ APP
// ============================================
function App() {
  const [screen, setScreen] = useState(tokenStore.access ? 'workspace' : 'login')
  const [user, setUser] = useState(null)
  const [loginForm, setLoginForm] = useState({ username: '', password: '' })
  const [registerForm, setRegisterForm] = useState({ username: '', email: '', password: '', password2: '' })
  const [authMode, setAuthMode] = useState('login')
  const [authError, setAuthError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [calendarView, setCalendarView] = useState(false)

  const [schools, setSchools] = useState([])
  const [academicYears, setAcademicYears] = useState([])
  const [classGroups, setClassGroups] = useState([])
  const [rooms, setRooms] = useState([])
  const [subjects, setSubjects] = useState([])
  const [teachers, setTeachers] = useState([])
  const [bellSchedules, setBellSchedules] = useState([])
  const [vacationTypes, setVacationTypes] = useState([])
  const [vacationPeriods, setVacationPeriods] = useState([])
  const [schedule, setSchedule] = useState([])

  const [filters, setFilters] = useState({
    school: '',
    academic_year: '',
    class_group: '',
    teacher: '',
    room: '',
    subject: '',
    day_of_week: '',
    week_parity: '',
    is_substitution: '',
    search: '',
    ordering: 'day_of_week,period_number',
  })
  const [selectedEntryId, setSelectedEntryId] = useState(null)
  const [entryForm, setEntryForm] = useState(emptyEntry)
  const [detailMode, setDetailMode] = useState('schedule')

  const isAuthed = Boolean(user)
  const isStaff = Boolean(user?.is_staff)
  const selectedEntry = schedule.find((entry) => entry.id === selectedEntryId)
  
  const getPageTitle = () => {
    if (screen === 'directories') return 'Данные школы'
    if (screen === 'access') return 'Доступ'
    if (screen === 'admin') return 'Управление расписанием'
    return 'Расписание школы'
  }
  
  const pageTitle = getPageTitle()

  const subjectColorById = useMemo(() => {
    const map = new Map()
    subjects.forEach((subject, index) => {
      map.set(subject.id, subjectColors[index % subjectColors.length])
    })
    return map
  }, [subjects])

  const currentSchool = schools.find((school) => String(school.id) === String(filters.school))
  const currentYear = academicYears.find((year) => String(year.id) === String(filters.academic_year))

  const loadMe = useCallback(async () => {
    if (!tokenStore.access) return

    try {
      const me = await api.me()
      setUser(me)
      setScreen('workspace')
    } catch {
      tokenStore.clear()
      setUser(null)
      setScreen('login')
    }
  }, [])

  useEffect(() => {
    loadMe()
  }, [loadMe])

  const setFilter = (field, value) => {
    setFilters((current) => ({ ...current, [field]: value }))
  }

  const loadDictionaries = useCallback(async () => {
    if (!isAuthed) return

    setLoading(true)
    setMessage('')
    try {
      const schoolParams = filters.school ? { school: filters.school } : {}
      const yearParams = {
        ...schoolParams,
        ...(filters.academic_year ? { academic_year: filters.academic_year } : {}),
      }

      const [
        schoolsData,
        yearsData,
        classesData,
        roomsData,
        subjectsData,
        teachersData,
        bellsData,
        vacationTypesData,
        vacationPeriodsData,
      ] = await Promise.all([
        api.schools(),
        api.academicYears(schoolParams),
        api.classGroups(yearParams),
        api.rooms(schoolParams),
        api.subjects(),
        api.teachers(),
        api.bellSchedules({
          ...schoolParams,
          shift_number: '',
        }),
        api.vacationTypes(),
        api.vacationPeriods(filters.academic_year ? { academic_year: filters.academic_year } : {}),
      ])

      setSchools(schoolsData)
      setAcademicYears(yearsData)
      setClassGroups(classesData)
      setRooms(roomsData)
      setSubjects(subjectsData)
      setTeachers(teachersData)
      setBellSchedules(bellsData)
      setVacationTypes(vacationTypesData)
      setVacationPeriods(vacationPeriodsData)

      setFilters((current) => ({
        ...current,
        school: current.school || schoolsData[0]?.id || '',
        academic_year: current.academic_year || yearsData[0]?.id || '',
      }))
    } catch (error) {
      setMessage(error.message)
    } finally {
      setLoading(false)
    }
  }, [filters.academic_year, filters.school, isAuthed])

  const loadSchedule = useCallback(async () => {
    if (!isAuthed) return

    setLoading(true)
    setMessage('')
    try {
      const params = {
        academic_year: filters.academic_year,
        class_group: filters.class_group,
        teacher: filters.teacher,
        room: filters.room,
        subject: filters.subject,
        day_of_week: filters.day_of_week,
        week_parity: filters.week_parity,
        is_substitution: filters.is_substitution,
        search: filters.search,
        ordering: filters.ordering,
        class_group__school: filters.school,
      }
      const data = await api.schedule(params)
      setSchedule(data)
      const nextSelected = data.find((entry) => entry.id === selectedEntryId) ?? data[0]
      setSelectedEntryId(nextSelected?.id ?? null)
      setEntryForm(nextSelected ? toForm(nextSelected) : { ...emptyEntry, academic_year: filters.academic_year })
    } catch (error) {
      setMessage(error.message)
    } finally {
      setLoading(false)
    }
  }, [filters, isAuthed, selectedEntryId])

  useEffect(() => {
    loadDictionaries()
  }, [loadDictionaries])

  useEffect(() => {
    loadSchedule()
  }, [loadSchedule])

  useEffect(() => {
    if (selectedEntry) setEntryForm(toForm(selectedEntry))
  }, [selectedEntry])

  const handleLogin = async (event) => {
    event.preventDefault()
    setAuthError('')
    setLoading(true)

    try {
      const tokens = await api.login(loginForm)
      tokenStore.set(tokens)
      await loadMe()
    } catch (error) {
      setAuthError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (event) => {
    event.preventDefault()
    setAuthError('')
    setLoading(true)

    try {
      await api.register(registerForm)
      setAuthMode('login')
      setLoginForm((current) => ({ ...current, username: registerForm.username }))
      setAuthError('Пользователь создан. Теперь войдите.')
    } catch (error) {
      setAuthError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    tokenStore.clear()
    setUser(null)
    setScreen('login')
  }

  const updateEntryForm = (field, value) => {
    setEntryForm((current) => ({ ...current, [field]: value }))
  }

  const startCreate = () => {
    setSelectedEntryId(null)
    setEntryForm({
      ...emptyEntry,
      academic_year: filters.academic_year,
      class_group: filters.class_group || classGroups[0]?.id || '',
      subject: filters.subject || subjects[0]?.id || '',
      teacher: filters.teacher || teachers[0]?.id || '',
      room: filters.room || rooms[0]?.id || '',
    })
  }

  const saveEntry = async (event) => {
    event.preventDefault()
    if (!isStaff) return

    setLoading(true)
    setMessage('')
    try {
      const payload = normalizeEntryPayload(entryForm)
      if (selectedEntryId) {
        await api.updateScheduleEntry(selectedEntryId, payload)
        setMessage('Урок обновлен.')
      } else {
        await api.createScheduleEntry(payload)
        setMessage('Урок добавлен в расписание.')
      }
      await loadSchedule()
    } catch (error) {
      setMessage(error.message)
    } finally {
      setLoading(false)
    }
  }

  const deleteEntry = async () => {
    if (!isStaff || !selectedEntryId) return

    setLoading(true)
    setMessage('')
    try {
      await api.deleteScheduleEntry(selectedEntryId)
      setSelectedEntryId(null)
      setMessage('Урок удален из расписания.')
      await loadSchedule()
    } catch (error) {
      setMessage(error.message)
    } finally {
      setLoading(false)
    }
  }

  const generateSchedule = async () => {
    const academicYearId = filters.academic_year || currentYear?.id || academicYears[0]?.id

    if (!academicYearId) {
      setMessage('Для генерации выберите учебный год.')
      return
    }

    setGenerating(true)
    setMessage('')
    try {
      if (!filters.academic_year) {
        setFilter('academic_year', academicYearId)
      }

      const result = await api.generateSchedule(academicYearId)
      setMessage(result?.detail || 'Запрос на генерацию отправлен.')
      await loadSchedule()
    } catch (error) {
      setMessage(error.message)
    } finally {
      setGenerating(false)
    }
  }

  const openShortcutSchedule = async (type, id) => {
    if (!id) return

    setLoading(true)
    setMessage('')
    try {
      const params = filters.academic_year ? { academic_year: filters.academic_year } : {}
      const data =
        type === 'class'
          ? await api.scheduleByClass(id, params)
          : type === 'teacher'
            ? await api.scheduleByTeacher(id, params)
            : await api.scheduleByRoom(id, params)
      setSchedule(normalizeScheduleResponse(data))
      setDetailMode('schedule')
      setMessage('Расписание загружено.')
    } catch (error) {
      setMessage(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleLessonClick = (id) => {
    setSelectedEntryId(id)
    const element = document.querySelector(`tr[data-id="${id}"]`)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' })
      element.classList.add('pulse-glow')
      setTimeout(() => element.classList.remove('pulse-glow'), 1000)
    }
  }

  if (!isAuthed) {
    return (
      <main className="auth-page">
        <AuthPanel
          authMode={authMode}
          loading={loading}
          loginForm={loginForm}
          registerForm={registerForm}
          authError={authError}
          setAuthMode={setAuthMode}
          setLoginForm={setLoginForm}
          setRegisterForm={setRegisterForm}
          onLogin={handleLogin}
          onRegister={handleRegister}
        />
      </main>
    )
  }

  return (
    <main className="app-shell">
      <aside className="sidebar" aria-label="Навигация">
        <button className="brand" type="button" onClick={() => setScreen('workspace')}>
          <span className="brand-mark">S</span>
          <span>
            <strong>School Raspis</strong>
            <small>школьное расписание</small>
          </span>
        </button>

        <nav className="nav-list">
          <button
            className={screen === 'workspace' ? 'nav-item active' : 'nav-item'}
            type="button"
            onClick={() => setScreen('workspace')}
          >
            <Icon name="grid" />
            Расписание
          </button>
          <button
            className={screen === 'directories' ? 'nav-item active' : 'nav-item'}
            type="button"
            onClick={() => setScreen('directories')}
          >
            <Icon name="book" />
            Справочники
          </button>
          {isStaff && (
            <button
              className={screen === 'admin' ? 'nav-item active' : 'nav-item'}
              type="button"
              onClick={() => setScreen('admin')}
            >
              <Icon name="edit" />
              Управление
            </button>
          )}
          {/* <button
            className={screen === 'access' ? 'nav-item active' : 'nav-item'}
            type="button"
            onClick={() => setScreen('access')}
          >
            <Icon name="user" />
            Доступ
          </button> */}
          <button className="nav-item" type="button" onClick={handleLogout}>
            <Icon name="shield" />
            Выйти
          </button>
        </nav>

        <div className="sidebar-card">
          <span className="eyebrow">Режим</span>
          <strong>{isStaff ? 'Редактирование' : 'Просмотр'}</strong>
          <small>данные расписания обновляются автоматически</small>
        </div>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div>
            <span className="eyebrow">Школьный планировщик</span>
            <h1 className="fade-in-up">{pageTitle}</h1>
          </div>
          <div className="user-chip hover-lift">
            <span className="avatar">{user.username?.slice(0, 2).toUpperCase()}</span>
            <span>
              <strong>{user.username}</strong>
              <small>{isStaff ? 'редактирование доступно' : 'просмотр расписания'}</small>
            </span>
          </div>
        </header>

        {message && (
          <div className="notice fade-in-up">
            <Icon name="alert" />
            <span>{message}</span>
          </div>
        )}

        {/* {loading && <LoadingWave />} */}

        {screen === 'access' ? (
          <AccessScreen user={user} isStaff={isStaff} />
        ) : screen === 'directories' ? (
          <DirectoriesScreen
            academicYears={academicYears}
            bellSchedules={bellSchedules}
            classGroups={classGroups}
            rooms={rooms}
            schools={schools}
            subjects={subjects}
            teachers={teachers}
            vacationPeriods={vacationPeriods}
            vacationTypes={vacationTypes}
            filters={filters}
            setFilter={setFilter}
            openShortcutSchedule={openShortcutSchedule}
            detailMode={detailMode}
            setDetailMode={setDetailMode}
          />
        ) : screen === 'admin' && isStaff ? (
          <AdminScheduleScreen
            academicYears={academicYears}
            bellSchedules={bellSchedules}
            classGroups={classGroups}
            currentSchool={currentSchool}
            currentYear={currentYear}
            entryForm={entryForm}
            filters={filters}
            isStaff={isStaff}
            loading={loading}
            generating={generating}
            rooms={rooms}
            schedule={schedule}
            selectedEntryId={selectedEntryId}
            setFilter={setFilter}
            setSelectedEntryId={setSelectedEntryId}
            schools={schools}
            subjects={subjects}
            subjectColorById={subjectColorById}
            teachers={teachers}
            updateEntryForm={updateEntryForm}
            startCreate={startCreate}
            saveEntry={saveEntry}
            deleteEntry={deleteEntry}
            generateSchedule={generateSchedule}
            reload={loadSchedule}
            calendarView={calendarView}
            setCalendarView={setCalendarView}
            onLessonClick={handleLessonClick}
          />
        ) : (
          <PublicScheduleScreen
            academicYears={academicYears}
            bellSchedules={bellSchedules}
            classGroups={classGroups}
            currentSchool={currentSchool}
            currentYear={currentYear}
            filters={filters}
            loading={loading}
            rooms={rooms}
            schedule={schedule}
            schools={schools}
            subjects={subjects}
            subjectColorById={subjectColorById}
            teachers={teachers}
            setFilter={setFilter}
            reload={loadSchedule}
            selectedEntryId={selectedEntryId}
            setSelectedEntryId={setSelectedEntryId}
            calendarView={calendarView}
            setCalendarView={setCalendarView}
            onLessonClick={handleLessonClick}
          />
        )}
      </section>
    </main>
  )
}

// ============================================
// ПУБЛИЧНАЯ СТРАНИЦА ПРОСМОТРА
// ============================================
function PublicScheduleScreen({
  academicYears,
  bellSchedules,
  classGroups,
  currentSchool,
  currentYear,
  filters,
  rooms,
  schedule,
  schools,
  subjects,
  subjectColorById,
  teachers,
  setFilter,
  reload,
  selectedEntryId,
  setSelectedEntryId,
  calendarView,
  setCalendarView,
  onLessonClick,
}) {
  const metrics = useMemo(() => {
    return {
      lessons: schedule.length,
      substitutions: schedule.filter((entry) => entry.is_substitution).length,
      rooms: new Set(schedule.map((entry) => entry.room?.id).filter(Boolean)).size,
      classes: new Set(schedule.map((entry) => entry.class_group?.id).filter(Boolean)).size,
    }
  }, [schedule])

  // if (loading) {
  //   return <LoadingWave />
  // }

  return (
    <div className="editor-layout">
      <section className="editor-main">
        {/* Виджеты */}
        <WidgetsGrid 
          bellSchedules={bellSchedules}
          schedule={schedule} 
          rooms={rooms} 
          weekDaysCount={currentSchool?.week_days_count || 5}
          onLessonClick={onLessonClick}
        />
        
        {/* Прогресс-бар учебного года */}
        {/* <YearProgress academicYear={currentYear} schedule={schedule} /> */}
        
        <div className="insight-band">
          <div>
            <span>Школа</span>
            <strong>{currentSchool?.name || 'Не выбрана'}</strong>
          </div>
          <div>
            <span>Учебный год</span>
            <strong>{currentYear ? `${currentYear.start_date} - ${currentYear.end_date}` : 'Не выбран'}</strong>
          </div>
          <div>
            <span>Уроков</span>
            <strong>{metrics.lessons}</strong>
          </div>
          <div className="load-wave" aria-hidden="true">
            <i style={{ height: '42%' }} />
            <i style={{ height: '68%' }} />
            <i style={{ height: '56%' }} />
            <i style={{ height: '86%' }} />
            <i style={{ height: '64%' }} />
            <i style={{ height: '48%' }} />
          </div>
        </div>

        <FilterPanel
          academicYears={academicYears}
          classGroups={classGroups}
          filters={filters}
          rooms={rooms}
          schools={schools}
          subjects={subjects}
          teachers={teachers}
          setFilter={setFilter}
        />

        <div className="editor-toolbar">
          <div className="search-field">
            <Icon name="search" />
            <input
              type="search"
              placeholder="Поиск по расписанию"
              value={filters.search}
              onChange={(event) => setFilter('search', event.target.value)}
            />
          </div>
          <select value={filters.ordering} onChange={(event) => setFilter('ordering', event.target.value)}>
            <option value="day_of_week,period_number">День и урок</option>
            <option value="class_group">Класс</option>
            <option value="teacher">Учитель</option>
            <option value="room">Кабинет</option>
          </select>
          <button className="ghost-button icon-only" type="button" onClick={reload} title="Обновить">
            <Icon name="refresh" />
          </button>
          <button 
            className={`ghost-button ${calendarView ? 'active' : ''}`} 
            type="button" 
            onClick={() => setCalendarView(!calendarView)}
            title="Переключить вид"
          >
            <Icon name="calendar" />
          </button>
        </div>

        <div className="metrics-row">
          <Metric label="Записей" value={metrics.lessons} />
          <Metric label="Классов" value={metrics.classes} />
          <Metric label="Кабинетов" value={metrics.rooms} />
          <Metric label="Замен" value={metrics.substitutions} />
        </div>

        {calendarView ? (
          <WeekCalendar schedule={schedule} onLessonClick={onLessonClick} />
        ) : (
          <ScheduleTable
            schedule={schedule}
            selectedEntryId={selectedEntryId}
            setSelectedEntryId={setSelectedEntryId}
            subjectColorById={subjectColorById}
          />
        )}
      </section>

      {/* <aside className="edit-panel view-panel">
        <div className="view-mode-card">
          <div className="lock-icon">
            <Icon name="shield" />
          </div>
          <h3>Режим просмотра</h3>
          <p>Вы просматриваете расписание. Для редактирования уроков необходимы права администратора.</p>
          <div className="info-message">
            <Icon name="alert" />
            <span>Изменение расписания доступно только сотрудникам с правами редактирования</span>
          </div>
        </div>
      </aside> */}
    </div>
  )
}

// ============================================
// АДМИНИСТРАТИВНАЯ СТРАНИЦА
// ============================================
function AdminScheduleScreen({
  academicYears,
  bellSchedules,
  classGroups,
  currentSchool,
  currentYear,
  entryForm,
  filters,
  isStaff,
  loading,
  generating,
  rooms,
  schedule,
  selectedEntryId,
  setFilter,
  setSelectedEntryId,
  schools,
  subjects,
  subjectColorById,
  teachers,
  updateEntryForm,
  startCreate,
  saveEntry,
  deleteEntry,
  generateSchedule,
  reload,
  calendarView,
  setCalendarView,
  onLessonClick,
}) {
  const metrics = useMemo(() => {
    return {
      lessons: schedule.length,
      substitutions: schedule.filter((entry) => entry.is_substitution).length,
      rooms: new Set(schedule.map((entry) => entry.room?.id).filter(Boolean)).size,
      classes: new Set(schedule.map((entry) => entry.class_group?.id).filter(Boolean)).size,
    }
  }, [schedule])

  // if (loading) {
  //   return <LoadingWave />
  // }

  return (
    <div className="editor-layout">
      <section className="editor-main">
        <WidgetsGrid 
          bellSchedules={bellSchedules}
          schedule={schedule} 
          rooms={rooms} 
          weekDaysCount={currentSchool?.week_days_count || 5}
          onLessonClick={onLessonClick}
        />
        
        {/* <YearProgress academicYear={currentYear} schedule={schedule} /> */}
        
        <div className="insight-band">
          <div>
            <span>Школа</span>
            <strong>{currentSchool?.name || 'Не выбрана'}</strong>
          </div>
          <div>
            <span>Учебный год</span>
            <strong>{currentYear ? `${currentYear.start_date} - ${currentYear.end_date}` : 'Не выбран'}</strong>
          </div>
          <div>
            <span>Уроков</span>
            <strong>{metrics.lessons}</strong>
          </div>
          <div className="load-wave" aria-hidden="true">
            <i style={{ height: '42%' }} />
            <i style={{ height: '68%' }} />
            <i style={{ height: '56%' }} />
            <i style={{ height: '86%' }} />
            <i style={{ height: '64%' }} />
            <i style={{ height: '48%' }} />
          </div>
        </div>

        <FilterPanel
          academicYears={academicYears}
          classGroups={classGroups}
          filters={filters}
          rooms={rooms}
          schools={schools}
          subjects={subjects}
          teachers={teachers}
          setFilter={setFilter}
        />

        <div className="editor-toolbar">
          <div className="search-field">
            <Icon name="search" />
            <input
              type="search"
              placeholder="Поиск по расписанию"
              value={filters.search}
              onChange={(event) => setFilter('search', event.target.value)}
            />
          </div>
          <select value={filters.ordering} onChange={(event) => setFilter('ordering', event.target.value)}>
            <option value="day_of_week,period_number">День и урок</option>
            <option value="class_group">Класс</option>
            <option value="teacher">Учитель</option>
            <option value="room">Кабинет</option>
          </select>
          <button className="ghost-button icon-only" type="button" onClick={reload} title="Обновить">
            <Icon name="refresh" />
          </button>
          <button className="ghost-button icon-only" type="button" onClick={startCreate} title="Добавить урок">
            <Icon name="plus" />
          </button>
          <button 
            className={`ghost-button ${calendarView ? 'active' : ''}`} 
            type="button" 
            onClick={() => setCalendarView(!calendarView)}
            title="Переключить вид"
          >
            <Icon name="calendar" />
          </button>
          <button className="primary-button generate-button" type="button" onClick={generateSchedule} disabled={loading || generating}>
            <Icon name="wand" />
            {generating ? 'Генерируем...' : 'Генерировать'}
          </button>
        </div>

        <div className="metrics-row">
          <Metric label="Записей" value={metrics.lessons} />
          <Metric label="Классов" value={metrics.classes} />
          <Metric label="Кабинетов" value={metrics.rooms} />
          <Metric label="Замен" value={metrics.substitutions} />
        </div>

        {calendarView ? (
          <WeekCalendar schedule={schedule} onLessonClick={onLessonClick} />
        ) : (
          <ScheduleTable
            schedule={schedule}
            selectedEntryId={selectedEntryId}
            setSelectedEntryId={setSelectedEntryId}
            subjectColorById={subjectColorById}
          />
        )}
      </section>

      <aside className="edit-panel">
        <EntryForm
          bellSchedules={bellSchedules}
          classGroups={classGroups}
          entryForm={entryForm}
          isStaff={isStaff}
          rooms={rooms}
          selectedEntryId={selectedEntryId}
          subjects={subjects}
          subjectColorById={subjectColorById}
          teachers={teachers}
          updateEntryForm={updateEntryForm}
          saveEntry={saveEntry}
          deleteEntry={deleteEntry}
        />
      </aside>
    </div>
  )
}

// ============================================
// КОМПОНЕНТ ДОСТУПА
// ============================================
function AccessScreen({ user, isStaff }) {
  return (
    <section className="access-page">
      <div className="access-card hover-lift">
        <div className={isStaff ? 'access-mark active' : 'access-mark'}>
          <Icon name={isStaff ? 'shield' : 'user'} />
        </div>
        <div>
          <span className="eyebrow">Профиль сотрудника</span>
          <h2>{isStaff ? 'Редактирование доступно' : 'Режим просмотра'}</h2>
          <p>
            {isStaff
              ? 'Вы можете создавать, изменять и удалять уроки в расписании.'
              : 'У вашей учетной записи нет прав на изменение расписания. Форма доступна только для просмотра.'}
          </p>
        </div>
      </div>

      <div className="access-details">
        <Metric label="Пользователь" value={user.username} />
        <Metric label="Email" value={user.email || 'Не указан'} />
        <Metric label="Права" value={isStaff ? 'Полный доступ' : 'Просмотр'} />
      </div>
    </section>
  )
}

// ============================================
// ПАНЕЛЬ АВТОРИЗАЦИИ
// ============================================
function AuthPanel({
  authMode,
  loading,
  loginForm,
  registerForm,
  authError,
  setAuthMode,
  setLoginForm,
  setRegisterForm,
  onLogin,
  onRegister,
}) {
  return (
    <section className="auth-shell">
      <div className="auth-visual fade-in-scale">
        <span className="eyebrow">Школьный планировщик</span>
        <h1>Создавайте расписание без накладок</h1>
        <p>
          Войдите в систему, выберите учебный год и управляйте уроками, кабинетами, учителями и
          заменами в одном рабочем пространстве.
        </p>
        <div className="feature-grid">
          <span>Авторизация сотрудников</span>
          <span>Расписание по классам</span>
          <span>Генерация учебной недели</span>
          <span>Кабинеты, звонки и каникулы</span>
        </div>
      </div>

      <form className="auth-card fade-in-up" onSubmit={authMode === 'login' ? onLogin : onRegister}>
        <div className="segmented">
          <button type="button" className={authMode === 'login' ? 'active' : ''} onClick={() => setAuthMode('login')}>
            Вход
          </button>
          <button type="button" className={authMode === 'register' ? 'active' : ''} onClick={() => setAuthMode('register')}>
            Регистрация
          </button>
        </div>

        {authMode === 'login' ? (
          <>
            <label className="field">
              <span>Username</span>
              <input
                value={loginForm.username}
                onChange={(event) => setLoginForm((current) => ({ ...current, username: event.target.value }))}
                autoComplete="username"
                required
              />
            </label>
            <label className="field">
              <span>Пароль</span>
              <input
                type="password"
                value={loginForm.password}
                onChange={(event) => setLoginForm((current) => ({ ...current, password: event.target.value }))}
                autoComplete="current-password"
                required
              />
            </label>
          </>
        ) : (
          <>
            <label className="field">
              <span>Username</span>
              <input
                value={registerForm.username}
                onChange={(event) => setRegisterForm((current) => ({ ...current, username: event.target.value }))}
                required
              />
            </label>
            <label className="field">
              <span>Email</span>
              <input
                type="email"
                value={registerForm.email}
                onChange={(event) => setRegisterForm((current) => ({ ...current, email: event.target.value }))}
              />
            </label>
            <label className="field">
              <span>Пароль</span>
              <input
                type="password"
                value={registerForm.password}
                onChange={(event) => setRegisterForm((current) => ({ ...current, password: event.target.value }))}
                minLength={8}
                required
              />
            </label>
            <label className="field">
              <span>Повтор пароля</span>
              <input
                type="password"
                value={registerForm.password2}
                onChange={(event) => setRegisterForm((current) => ({ ...current, password2: event.target.value }))}
                minLength={8}
                required
              />
            </label>
          </>
        )}

        {authError && <div className="form-alert">{authError}</div>}

        <button className="primary-button wide" type="submit" disabled={loading}>
          <Icon name="shield" />
          { (authMode === 'login' ? 'Войти' : 'Создать пользователя')}
        </button>
      </form>
    </section>
  )
}

// ============================================
// ПАНЕЛЬ ФИЛЬТРОВ
// ============================================
function FilterPanel({ academicYears, classGroups, filters, rooms, schools, subjects, teachers, setFilter }) {
  return (
    <div className="filter-grid fade-in-up">
      <label className="field">
        <span>Школа</span>
        <select value={filters.school} onChange={(event) => setFilter('school', event.target.value)}>
          <option value="">Все школы</option>
          {schools.map((school) => (
            <option key={school.id} value={school.id}>
              {school.name}
            </option>
          ))}
        </select>
      </label>
      <label className="field">
        <span>Учебный год</span>
        <select value={filters.academic_year} onChange={(event) => setFilter('academic_year', event.target.value)}>
          <option value="">Все годы</option>
          {academicYears.map((year) => (
            <option key={year.id} value={year.id}>
              {year.start_date} - {year.end_date}
            </option>
          ))}
        </select>
      </label>
      <label className="field">
        <span>Класс</span>
        <select value={filters.class_group} onChange={(event) => setFilter('class_group', event.target.value)}>
          <option value="">Все классы</option>
          {classGroups.map((classGroup) => (
            <option key={classGroup.id} value={classGroup.id}>
              {classGroup.name}
            </option>
          ))}
        </select>
      </label>
      <label className="field">
        <span>Учитель</span>
        <select value={filters.teacher} onChange={(event) => setFilter('teacher', event.target.value)}>
          <option value="">Все учителя</option>
          {teachers.map((teacher) => (
            <option key={teacher.id} value={teacher.id}>
              {teacher.full_name}
            </option>
          ))}
        </select>
      </label>
      <label className="field">
        <span>Предмет</span>
        <select value={filters.subject} onChange={(event) => setFilter('subject', event.target.value)}>
          <option value="">Все предметы</option>
          {subjects.map((subject) => (
            <option key={subject.id} value={subject.id}>
              {subject.name}
            </option>
          ))}
        </select>
      </label>
      <label className="field">
        <span>Кабинет</span>
        <select value={filters.room} onChange={(event) => setFilter('room', event.target.value)}>
          <option value="">Все кабинеты</option>
          {rooms.map((room) => (
            <option key={room.id} value={room.id}>
              {room.number}
            </option>
          ))}
        </select>
      </label>
      <label className="field">
        <span>День</span>
        <select value={filters.day_of_week} onChange={(event) => setFilter('day_of_week', event.target.value)}>
          <option value="">Все дни</option>
          {Object.entries(dayNames).map(([id, label]) => (
            <option key={id} value={id}>
              {label}
            </option>
          ))}
        </select>
      </label>
      <label className="field">
        <span>Неделя / замена</span>
        <select value={filters.week_parity} onChange={(event) => setFilter('week_parity', event.target.value)}>
          <option value="">Любая неделя</option>
          <option value="0">Обе</option>
          <option value="1">Нечетная</option>
          <option value="2">Четная</option>
        </select>
      </label>
    </div>
  )
}

// ============================================
// ТАБЛИЦА РАСПИСАНИЯ
// ============================================
function ScheduleTable({ schedule, selectedEntryId, setSelectedEntryId, subjectColorById }) {
  if (!schedule.length) {
    return (
      <div className="empty-state fade-in-scale">
        <Icon name="grid" />
        <strong>Расписание не найдено</strong>
        <span>Измените фильтры или запустите генерацию для выбранного учебного года.</span>
      </div>
    )
  }

  return (
    <div className="schedule-table-wrap">
      <table className="schedule-table">
        <thead>
          <tr>
            <th>День</th>
            <th>Урок</th>
            <th>Неделя</th>
            <th>Класс</th>
            <th>Подгруппа</th>
            <th>Предмет</th>
            <th>Учитель</th>
            <th>Каб.</th>
            <th>Замена</th>
          </tr>
        </thead>
        <tbody>
          {schedule.map((entry) => (
            <tr
              className={entry.id === selectedEntryId ? 'selected-row' : ''}
              key={entry.id}
              onClick={() => setSelectedEntryId(entry.id)}
              data-id={entry.id}
              style={{ '--subject-color': subjectColorById.get(entry.subject?.id) ?? '#2563eb' }}
            >
              <td>{entry.day_of_week_display || dayNames[entry.day_of_week]}</td>
              <td>{entry.period_number}</td>
              <td>{entry.week_parity_display || weekParityLabels[entry.week_parity]}</td>
              <td>
                <span className="group-badge">{entry.class_group?.name}</span>
              </td>
              <td>{entry.subgroup?.name || '-'}</td>
              <td>
                <span className="subject-chip">{entry.subject?.name}</span>
              </td>
              <td>{entry.teacher?.full_name}</td>
              <td>{entry.room?.number}</td>
              <td>
                <span className={entry.is_substitution ? 'load-chip danger' : 'load-chip'}>
                  {entry.is_substitution ? 'Да' : 'Нет'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ============================================
// ФОРМА РЕДАКТИРОВАНИЯ УРОКОВ
// ============================================
function EntryForm({
  bellSchedules,
  classGroups,
  entryForm,
  isStaff,
  rooms,
  selectedEntryId,
  subjects,
  subjectColorById,
  teachers,
  updateEntryForm,
  saveEntry,
  deleteEntry,
}) {
  const subjectColor = subjectColorById.get(Number(entryForm.subject)) ?? '#2563eb'

  if (!isStaff) {
    return null
  }

  return (
    <form onSubmit={saveEntry} className="fade-in-scale">
      <div className="panel-title">
        <span className="eyebrow">Управление расписанием</span>
        <h2>{selectedEntryId ? 'Редактирование урока' : 'Новый урок'}</h2>
      </div>

      <div className="subject-banner" style={{ '--subject-color': subjectColor }}>
        <Icon name="book" />
        <div>
          <span>{selectedEntryId ? `ID ${selectedEntryId}` : 'Создание'}</span>
          <strong>{subjects.find((subject) => Number(subject.id) === Number(entryForm.subject))?.name || 'Предмет'}</strong>
        </div>
      </div>

      <div className="form-grid">
        <label className="field">
          <span>День недели</span>
          <select value={entryForm.day_of_week} onChange={(event) => updateEntryForm('day_of_week', event.target.value)}>
            {Object.entries(dayNames).map(([id, label]) => (
              <option key={id} value={id}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Номер урока</span>
          <input
            type="number"
            min="1"
            value={entryForm.period_number}
            onChange={(event) => updateEntryForm('period_number', event.target.value)}
          />
        </label>
      </div>

      <label className="field">
        <span>Расписание звонков</span>
        <select
          value={entryForm.period_number}
          onChange={(event) => updateEntryForm('period_number', event.target.value)}
        >
          {bellSchedules.map((bell) => (
            <option key={bell.id} value={bell.period_number}>
              {bell.shift_number} смена, {bell.period_number} урок: {bell.start_time} - {bell.end_time}
            </option>
          ))}
        </select>
      </label>

      <div className="form-grid">
        <label className="field">
          <span>Класс</span>
          <select value={entryForm.class_group} onChange={(event) => updateEntryForm('class_group', event.target.value)}>
            <option value="">Выберите класс</option>
            {classGroups.map((classGroup) => (
              <option key={classGroup.id} value={classGroup.id}>
                {classGroup.name}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Подгруппа</span>
          <select value={entryForm.subgroup || ''} onChange={(event) => updateEntryForm('subgroup', event.target.value)}>
            <option value="">Без подгруппы</option>
            {classGroups
              .find((classGroup) => Number(classGroup.id) === Number(entryForm.class_group))
              ?.subgroups?.map((subgroup) => (
                <option key={subgroup.id} value={subgroup.id}>
                  {subgroup.name}
                </option>
              ))}
          </select>
        </label>
      </div>

      <label className="field">
        <span>Предмет</span>
        <select value={entryForm.subject} onChange={(event) => updateEntryForm('subject', event.target.value)}>
          <option value="">Выберите предмет</option>
          {subjects.map((subject) => (
            <option key={subject.id} value={subject.id}>
              {subject.name}
            </option>
          ))}
        </select>
      </label>

      <label className="field">
        <span>Учитель</span>
        <select value={entryForm.teacher} onChange={(event) => updateEntryForm('teacher', event.target.value)}>
          <option value="">Выберите учителя</option>
          {teachers.map((teacher) => (
            <option key={teacher.id} value={teacher.id}>
              {teacher.full_name}
            </option>
          ))}
        </select>
      </label>

      <label className="field">
        <span>Кабинет</span>
        <select value={entryForm.room} onChange={(event) => updateEntryForm('room', event.target.value)}>
          <option value="">Выберите кабинет</option>
          {rooms.map((room) => (
            <option key={room.id} value={room.id}>
              {room.number}{room.type ? `, ${room.type}` : ''}
            </option>
          ))}
        </select>
      </label>

      <div className="form-grid">
        <label className="field">
          <span>Четность недели</span>
          <select value={entryForm.week_parity} onChange={(event) => updateEntryForm('week_parity', event.target.value)}>
            <option value="0">Обе недели</option>
            <option value="1">Нечетная</option>
            <option value="2">Четная</option>
          </select>
        </label>
        <label className="field">
          <span>Действует по</span>
          <input
            type="date"
            value={entryForm.valid_to || ''}
            onChange={(event) => updateEntryForm('valid_to', event.target.value)}
          />
        </label>
      </div>

      <label className="check-row">
        <input
          type="checkbox"
          checked={Boolean(entryForm.is_substitution)}
          onChange={(event) => updateEntryForm('is_substitution', event.target.checked)}
        />
        Это замена
      </label>

      <div className="panel-actions">
        <button className="primary-button wide" type="submit">
          <Icon name="save" />
          {selectedEntryId ? 'Сохранить' : 'Создать'}
        </button>
        {selectedEntryId && (
          <button className="ghost-button wide danger-button" type="button" onClick={deleteEntry}>
            <Icon name="trash" />
            Удалить
          </button>
        )}
      </div>
    </form>
  )
}

// ============================================
// СТРАНИЦА СПРАВОЧНИКОВ
// ============================================
function DirectoriesScreen({
  academicYears,
  bellSchedules,
  classGroups,
  rooms,
  schools,
  subjects,
  teachers,
  vacationPeriods,
  vacationTypes,
  filters,
  setFilter,
  openShortcutSchedule,
  detailMode,
  setDetailMode,
}) {
  const tabs = [
    ['schools', 'Школы', schools],
    ['academicYears', 'Учебные годы', academicYears],
    ['classes', 'Классы', classGroups],
    ['teachers', 'Учителя', teachers],
    ['subjects', 'Предметы', subjects],
    ['rooms', 'Кабинеты', rooms],
    ['bells', 'Звонки', bellSchedules],
    ['vacations', 'Каникулы', vacationPeriods],
    ['vacationTypes', 'Типы каникул', vacationTypes],
  ]
  const active = tabs.find(([key]) => key === detailMode) ?? tabs[0]

  return (
    <section className="directories">
      <FilterPanel
        academicYears={academicYears}
        classGroups={classGroups}
        filters={filters}
        rooms={rooms}
        schools={schools}
        subjects={subjects}
        teachers={teachers}
        setFilter={setFilter}
      />

      <div className="directory-tabs">
        {tabs.map(([key, label, items]) => (
          <button 
            className={detailMode === key ? 'active' : ''} 
            key={key} 
            type="button" 
            onClick={() => setDetailMode(key)}
          >
            {label}
            <span>{items.length}</span>
          </button>
        ))}
      </div>

      <div className="directory-grid">
        {active[2].map((item, idx) => (
          <DirectoryCard
            key={`${active[0]}-${item.id}`}
            type={active[0]}
            item={item}
            openShortcutSchedule={openShortcutSchedule}
            delay={idx * 50}
          />
        ))}
      </div>
    </section>
  )
}

// ============================================
// КАРТОЧКА СПРАВОЧНИКА
// ============================================
function DirectoryCard({ type, item, openShortcutSchedule, delay = 0 }) {
  const title =
    item.name || item.full_name || item.number || item.title || `${item.start_date ?? ''} ${item.end_date ?? ''}`.trim()
  const rows = Object.entries(item).filter(([key, value]) => key !== 'id' && key !== 'subgroups' && value !== null && typeof value !== 'object')

  return (
    <article 
      className="directory-card hover-lift" 
      style={{ animationDelay: `${delay}ms` }}
    >
      <span className="status-pill">ID {item.id}</span>
      <h3>{title}</h3>
      <div className="directory-fields">
        {rows.slice(0, 5).map(([key, value]) => (
          <span key={key}>
            <strong>{key}</strong>
            {String(value)}
          </span>
        ))}
      </div>
      {type === 'classes' && (
        <button className="ghost-button wide" type="button" onClick={() => openShortcutSchedule('class', item.id)}>
          Расписание класса
        </button>
      )}
      {type === 'teachers' && (
        <button className="ghost-button wide" type="button" onClick={() => openShortcutSchedule('teacher', item.id)}>
          Расписание учителя
        </button>
      )}
      {type === 'rooms' && (
        <button className="ghost-button wide" type="button" onClick={() => openShortcutSchedule('room', item.id)}>
          Расписание кабинета
        </button>
      )}
    </article>
  )
}

// ============================================
// КОМПОНЕНТ МЕТРИКИ
// ============================================
function Metric({ label, value }) {
  const [displayValue, setDisplayValue] = useState(0)
  
  useEffect(() => {
    const duration = 500
    const steps = 20
    const increment = value / steps
    let current = 0
    let step = 0
    
    const timer = setInterval(() => {
      step++
      current = Math.min(current + increment, value)
      setDisplayValue(Math.floor(current))
      if (step >= steps) clearInterval(timer)
    }, duration / steps)
    
    return () => clearInterval(timer)
  }, [value])
  
  return (
    <div className="metric hover-lift">
      <span>{label}</span>
      <strong>{displayValue}</strong>
    </div>
  )
}

// ============================================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ============================================
function toForm(entry) {
  return {
    day_of_week: entry.day_of_week ?? 1,
    period_number: entry.period_number ?? 1,
    week_parity: entry.week_parity ?? 0,
    valid_to: entry.valid_to ?? '',
    is_substitution: Boolean(entry.is_substitution),
    class_group: entry.class_group?.id ?? entry.class_group ?? '',
    subgroup: entry.subgroup?.id ?? entry.subgroup ?? '',
    subject: entry.subject?.id ?? entry.subject ?? '',
    teacher: entry.teacher?.id ?? entry.teacher ?? '',
    room: entry.room?.id ?? entry.room ?? '',
    academic_year: entry.academic_year ?? '',
  }
}

function normalizeEntryPayload(form) {
  const payload = {
    day_of_week: Number(form.day_of_week),
    period_number: Number(form.period_number),
    week_parity: Number(form.week_parity),
    is_substitution: Boolean(form.is_substitution),
    class_group: Number(form.class_group),
    subject: Number(form.subject),
    teacher: Number(form.teacher),
    room: Number(form.room),
    academic_year: Number(form.academic_year),
  }

  if (form.subgroup) payload.subgroup = Number(form.subgroup)
  if (form.valid_to) payload.valid_to = form.valid_to

  return payload
}

function normalizeScheduleResponse(data) {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.results)) return data.results
  return data ? [data] : []
}

export default App