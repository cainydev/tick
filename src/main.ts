import './style.css'

// URL format: /<unix seconds in base36>  e.g. /tzk3a0
const encode = (date: Date) => Math.floor(date.getTime() / 1000).toString(36)
const decode = (code: string): Date | null => {
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
      <div id="clock" class="font-mono font-bold tabular-nums text-6xl sm:text-8xl"></div>
      <p class="mt-6 text-neutral-400">until ${target.toLocaleString()}</p>
      <a href="/" class="mt-10 inline-block text-sm text-neutral-500 hover:text-white">new timer</a>
    </div>`

  const clock = app.querySelector<HTMLDivElement>('#clock')!
  const pad = (n: number) => String(n).padStart(2, '0')

  const tick = () => {
    const left = Math.max(0, Math.ceil((target.getTime() - Date.now()) / 1000))
    const d = Math.floor(left / 86400)
    const h = Math.floor((left % 86400) / 3600)
    const m = Math.floor((left % 3600) / 60)
    const s = left % 60
    const text = left === 0 ? "Time's up!" : `${d ? d + 'd ' : ''}${pad(h)}:${pad(m)}:${pad(s)}`
    clock.textContent = text
    document.title = `${text} · Tick`
    if (left === 0) clearInterval(timer)
  }
  const timer = setInterval(tick, 250)
  tick()
}

function renderError() {
  app.innerHTML = `
    <div class="text-center">
      <p class="text-2xl">That's not a valid timer.</p>
      <a href="/" class="mt-6 inline-block text-neutral-400 hover:text-white">make one</a>
    </div>`
}
