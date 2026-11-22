import './style.css'

type p = { p: number[]; n: string[] }
type l = p & { r: number }
type t = { m: number; l?: l }
type f = { s: number; u: boolean; i?: number }

const u = { s: 1e3, m: 6e4, h: 36e5, d: 864e5 }

const d = (s: string) => /^(\d+|(\d+[smhd])+)$/.test(s)

const k = (s: string) =>
  [...s.matchAll(/([a-z]*)(\d+)([smhd])/g)].map(([, n, v, x]) => ({ n, v: +v * u[x as keyof typeof u], r: 'smhd'.indexOf(x) }))

const p = (s: string): p | null => {
  if (/^\d+$/.test(s)) return +s ? { p: [+s * u.m], n: [''] } : null
  if (!/^([a-z]*\d+[smhd])+$/.test(s)) return null
  const a = k(s).reduce<p>(
    (a, t, i, b) =>
      i && !t.n && t.r < b[i - 1].r
        ? { p: [...a.p.slice(0, -1), a.p.at(-1)! + t.v], n: a.n }
        : { p: [...a.p, t.v], n: [...a.n, t.n] },
    { p: [], n: [] },
  )
  return a.p.every((x) => x > 0) ? a : null
}

const l = (s: string): l | null => {
  const [, b, n] = s.match(/^(.+?)(?:x([1-9]\d*))?$/) ?? []
  const a = b ? p(b) : null
  return a && { ...a, r: n ? +n : 1 / 0 }
}

const o = (x: l | null) => (x && (x.p.length > 1 || x.r < 1 / 0 || x.n.join('')) ? x : null)

const a = (s: string, n: number): number | null => {
  const [, h, m = '0'] = s.match(/^at(\d{1,2})(\d{2})?$/) ?? []
  if (!h || +h > 23 || +m > 59) return null
  const x = new Date(n)
  x.setHours(+h, +m, 0, 0)
  return x.getTime() > n ? x.getTime() : x.setDate(x.getDate() + 1)
}

const m = (s: string, n: number): number | null => {
  if (!s) return n
  if (d(s)) return p(s)?.p.length === 1 ? n + p(s)!.p[0] : null
  return a(s, n) ?? (/^[0-9a-z]+$/.test(s) ? parseInt(s, 36) * 1e3 : null)
}

const r = (s: string, n: number): t | null => {
  const [a, b = '', ...c] = s.toLowerCase().slice(1).split('/')
  if (c.length) return null
  const x = b ? null : o(l(a))
  if (x) return { m: n, l: x }
  const y = m(a, n)
  const z = b ? l(b) : undefined
  return y === null || z === null ? null : { m: y, ...(z && { l: z }) }
}

const w = ({ p, n, r }: l) => {
  const k = (['d', 'h', 'm', 's'] as const).find((k) => p.every((x) => x % u[k] === 0))!
  return p.map((x, i) => n[i] + x / u[k] + k).join('') + (r < 1 / 0 ? `x${r}` : '')
}

const h = (x: t) => `/${Math.floor(x.m / 1e3).toString(36)}` + (x.l ? `/${w(x.l)}` : '')

const j = (p: number[], t: number, i = 0): f => (t < p[i] ? { s: p[i] - t, u: false, i } : j(p, t - p[i], i + 1))

const f = ({ m, l }: t, n: number): f => {
  const x = n - m
  if (x < 0) return { s: -x, u: false }
  if (!l) return { s: x, u: true }
  const c = l.p.reduce((a, b) => a + b)
  const e = c * l.r
  return x >= e ? { s: x - e, u: true } : j(l.p, x % c)
}

const q = (n: number) => `${Math.floor(n)}`.padStart(2, '0')

const c = ({ s, u }: f) => {
  const x = u ? Math.floor(s / 1e3) : Math.ceil(s / 1e3)
  const d = Math.floor(x / 86400)
  return (u ? '+' : '') + (d ? `${d}d ` : '') + [(x % 86400) / 3600, (x % 3600) / 60, x % 60].map(q).join(':')
}

const e = (s: string) => s.replace('d ', ' روز ').replace(/\d/g, (x) => '۰۱۲۳۴۵۶۷۸۹'[+x])

const g = document.querySelector('#app')!

const v = (x: t) => {
  const s = (x.l?.p ?? []).map(() => '<span class="size-1.5 rounded-full"></span>').join('')
  g.innerHTML = `
    <div class="text-center">
      <div dir="ltr" class="font-mono font-bold tabular-nums text-7xl sm:text-9xl select-none transition-colors"></div>
      <p class="mt-4 h-6 text-neutral-400"></p>
      <div class="mt-4 flex justify-center gap-2">${s}</div>
    </div>`

  const [z, y, w] = [...g.firstElementChild!.children]
  const q = [...w.children]
  let i = false

  const k = () => {
    const a = f(x, Date.now())
    const n = !x.l ? '' : a.i !== undefined ? x.l.n[a.i] : a.u ? '' : 'until loop'
    const o = i ? e(c(a)) : c(a)
    z.textContent = o
    y.textContent = n
    document.title = n ? `${n} ${o}` : o
    z.classList.toggle('text-neutral-500', (a.i ?? 0) % 2 === 1)
    q.forEach((n, j) => {
      n.classList.toggle('bg-white', j === a.i)
      n.classList.toggle('bg-neutral-700', j !== a.i)
    })
  }

  z.addEventListener('click', () => {
    i = !i
    z.classList.toggle('font-mono', !i)
    z.classList.toggle('font-persian', i)
    k()
  })
  z.setAttribute('title', new Date(x.m).toLocaleString())
  setInterval(k, 250)
  k()
}

const b = () => {
  const x = r(location.pathname, Math.floor(Date.now() / 1e3) * 1e3)
  if (!x) return void (g.innerHTML = '<p class="text-2xl">not a timer</p>')
  history.replaceState(null, '', h(x))
  v(x)
}

b()
