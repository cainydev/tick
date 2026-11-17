import './style.css'

// URL formats:
//   /<unix seconds in base36>   absolute time, e.g. /tzk3a0
//   /<duration>                 relative to page load, e.g. /20m, /1h30m, /90s, /2d (bare number = minutes)
//   /at<H[MM]>                  next occurrence of that local time of day, e.g. /at18, /at1830, /at930
// Durations are checked first; as base36 they would decode to 1970, so real codes never collide.
const UNITS: Record<string, number> = { d: 86400, h: 3600, m: 60, s: 1 }
const parseDuration = (code: string): number | null => {
  if (/^\d+$/.test(code)) return +code * 60
  if (!/^(\d+[dhms])+$/i.test(code)) return null
  let seconds = 0
  for (const [, n, unit] of code.toLowerCase().matchAll(/(\d+)([dhms])/g)) seconds += +n * UNITS[unit]
  return seconds
}

// /at1830 → next occurrence of that local time of day (today, or tomorrow if already past)
const parseTimeOfDay = (code: string): Date | null => {
  const match = code.match(/^at(\d{1,2})(\d{2})?$/i)
  if (!match) return null
  const [h, m] = [+match[1], +(match[2] ?? 0)]
  if (h > 23 || m > 59) return null
  const date = new Date()
  date.setHours(h, m, 0, 0)
  if (date.getTime() <= Date.now()) date.setDate(date.getDate() + 1)
  return date
}

const encode = (date: Date) => Math.floor(date.getTime() / 1000).toString(36)
const decode = (code: string): Date | null => {
  const timeOfDay = parseTimeOfDay(code)
  if (timeOfDay) return timeOfDay
  const duration = parseDuration(code)
  if (duration !== null) return new Date(Date.now() + duration * 1000)
  if (!/^[0-9a-z]+$/i.test(code)) return null
  const date = new Date(parseInt(code, 36) * 1000)
  return isNaN(date.getTime()) ? null : date
}

const app = document.querySelector<HTMLDivElement>('#app')!
const code = location.pathname.slice(1).split('/')[0]

if (!code) renderForm()
else {
  const target = decode(code)
  target ? renderCountdown(target) : renderError()
}

function renderForm() {
  // default: one hour from now, formatted for datetime-local in local time
  const d = new Date(Date.now() + 3600_000)
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
  const value = d.toISOString().slice(0, 16)

  app.innerHTML = `
    <h1 class="absolute top-6 left-1/2 -translate-x-1/2 text-sm font-mono text-neutral-500">tick</h1>
    <form class="flex items-center gap-3">
      <input type="datetime-local" name="when" required value="${value}"
        class="bg-transparent border-b border-neutral-700 focus:border-white py-2 text-xl font-mono outline-none transition-colors [color-scheme:dark]" />
      <button class="rounded-md bg-white text-black text-sm font-medium px-3 py-1.5 hover:bg-neutral-300 transition-colors">Start</button>
    </form>`

  app.querySelector('form')!.addEventListener('submit', (e) => {
    e.preventDefault()
    const when = new FormData(e.target as HTMLFormElement).get('when') as string
    location.href = '/' + encode(new Date(when))
  })
}

function renderCountdown(target: Date) {
  app.innerHTML = `
    <div class="text-center">
      <div id="clock" dir="ltr" class="font-mono font-bold tabular-nums text-6xl sm:text-8xl select-none"></div>
      <p class="mt-6 text-neutral-400"><span id="relation">until</span> ${target.toLocaleString()}</p>
      <a href="/" class="mt-10 inline-block text-sm text-neutral-500 hover:text-white">new timer</a>
    </div>`

  const clock = app.querySelector<HTMLDivElement>('#clock')!
  const pad = (n: number) => String(n).padStart(2, '0')

  // secret: click the clock to toggle Persian digits
  let persian = false
  const toPersian = (s: string) => s.replace(/\d/g, (c) => '۰۱۲۳۴۵۶۷۸۹'[+c])
  clock.addEventListener('click', () => {
    persian = !persian
    clock.classList.toggle('font-mono', !persian)
    clock.classList.toggle('font-persian', persian)
    tick()
  })

  const relation = app.querySelector<HTMLSpanElement>('#relation')!

  // counts down to the target, then keeps counting up from it ("+00:04:12")
  const tick = () => {
    const diff = target.getTime() - Date.now()
    const past = diff <= 0
    const secs = past ? Math.floor(-diff / 1000) : Math.ceil(diff / 1000)
    const d = Math.floor(secs / 86400)
    const h = Math.floor((secs % 86400) / 3600)
    const m = Math.floor((secs % 3600) / 60)
    const s = secs % 60
    const days = d ? d + (persian ? ' روز ' : 'd ') : ''
    const raw = `${past ? '+' : ''}${days}${pad(h)}:${pad(m)}:${pad(s)}`
    const text = persian ? toPersian(raw) : raw
    clock.textContent = text
    clock.classList.toggle('text-neutral-500', past)
    relation.textContent = past ? 'since' : 'until'
    document.title = text
  }
  setInterval(tick, 250)
  tick()
}

function renderError() {
  app.innerHTML = `
    <div class="text-center">
      <p class="text-2xl">That's not a valid timer.</p>
      <a href="/" class="mt-6 inline-block text-neutral-400 hover:text-white">make one</a>
    </div>`
}
