import './style.css'
import y from '../README.md?raw'

type p = { p: number[]; n: string[] }
type l = p & { s: string }
type t = { m: number; l?: l }
type f = { s: number; u: boolean; i?: number }
type i = { n: string; v: number }
type w = { c: number; p: i[]; r: number }

const u = { s: 1e3, m: 6e4, h: 36e5, d: 864e5 }

const d = (s: string) => /^(\d+|(\d+[smhd])+)$/.test(s)

const k = (s: string) => [...s.matchAll(/([1-9]\d{0,2})x|([()])|([a-z_]*)(\d+)([smhd])/g)]

const n = (t: RegExpMatchArray[], i: number, a: w[] = []): [w[], number] | null => {
  if (i >= t.length || t[i][2] === ')') return [a, i]
  const c = +(t[i][1] ?? 0)
  const j = c ? i + 1 : i
  const [, , o, e, v, x] = t[j] ?? []
  if (o === '(') {
    const b = n(t, j + 1)
    const s = b && t[b[1]]?.[2] === ')' ? z(b[0]) : null
    return s && n(t, b![1] + 1, [...a, { c: c || 1, p: s, r: -1 }])
  }
  if (!x) return null
  const r = 'smhd'.indexOf(x)
  const q = +v * u[x as keyof typeof u]
  const l = a.at(-1)
  return n(
    t,
    j + 1,
    !c && !e && l && r < l.r
      ? [...a.slice(0, -1), { ...l, p: [{ ...l.p[0], v: l.p[0].v + q }], r }]
      : [...a, { c: c || 1, p: [{ n: e.replace(/_/g, ' '), v: q }], r }],
  )
}

const z = (a: w[]): i[] | null =>
  a.reduce((s, x) => s + x.c * x.p.length, 0) > 999 ? null : a.flatMap((x) => Array.from({ length: x.c }, () => x.p).flat())

const p = (s: string): p | null => {
  if (/^\d+$/.test(s)) return +s ? { p: [+s * u.m], n: [''] } : null
  const t = k(s)
  const a = t.map((x) => x[0]).join('') === s ? n(t, 0) : null
  const b = a && a[1] === t.length ? z(a[0]) : null
  return b?.length && b.every((x) => x.v > 0) ? { p: b.map((x) => x.v), n: b.map((x) => x.n) } : null
}

const l = (s: string): l | null => {
  const a = p(s)
  return a && { ...a, s }
}

const o = (x: l | null) => (x && (x.p.length > 1 || x.n.join('')) ? x : null)

const t = (s: string) => (s.length > 2 ? [+s.slice(0, -2), +s.slice(-2)] : [+s, 0])

const x = (y: number, o: number, d: number, h: number, m: number, z?: number) =>
  z === undefined ? new Date(y, o, d, h, m).getTime() : Date.UTC(y, o, d, h, m) - z * 6e4

const a = (s: string, n: number): number | null => {
  const [, e, g, i] = s.match(/^at(\d{1,4}|\d{8}|\d{12})(?:([+-])(\d{1,4}))?$/) ?? []
  if (!e) return null
  const [k, l] = i ? t(i) : [0, 0]
  if (k > 14 || l > 59) return null
  const z = g ? (g === '-' ? -1 : 1) * (k * 60 + l) : undefined
  if (e.length < 5) {
    const [h, m] = t(e)
    if (h > 23 || m > 59) return null
    const c = new Date(n + (z ?? 0) * 6e4)
    const [y, o, d] = z === undefined ? [c.getFullYear(), c.getMonth(), c.getDate()] : [c.getUTCFullYear(), c.getUTCMonth(), c.getUTCDate()]
    const v = x(y, o, d, h, m, z)
    return v > n ? v : x(y, o, d + 1, h, m, z)
  }
  const [y, o, d, h, m] = [e.slice(0, 4), e.slice(4, 6), e.slice(6, 8), e.slice(8, 10), e.slice(10)].map((w) => +w)
  const c = new Date(Date.UTC(y, o - 1, d))
  return c.getUTCMonth() === o - 1 && c.getUTCDate() === d && h < 24 && m < 60 ? x(y, o - 1, d, h, m, z) : null
}

const m = (s: string, n: number): number | null => {
  if (!s) return n
  if (d(s)) return p(s)?.p.length === 1 ? n + p(s)!.p[0] : null
  if (s.startsWith('at')) return a(s, n)
  return /^[0-9a-z]{1,8}$/.test(s) ? parseInt(s, 36) * 1e3 : null
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

const h = (x: t) => `/${Math.floor(x.m / 1e3).toString(36)}` + (x.l ? `/${x.l.s}` : '')

const j = (p: number[], t: number, i = 0): f => (t < p[i] ? { s: p[i] - t, u: false, i } : j(p, t - p[i], i + 1))

const f = ({ m, l }: t, n: number): f => {
  const x = n - m
  if (x < 0) return { s: -x, u: false }
  if (!l) return { s: x, u: true }
  return j(l.p, x % l.p.reduce((a, b) => a + b))
}

const q = (n: number) => `${Math.floor(n)}`.padStart(2, '0')

const c = ({ s, u }: f) => {
  const x = u ? Math.floor(s / 1e3) : Math.ceil(s / 1e3)
  const d = Math.floor(x / 86400)
  return (u ? '+' : '') + (d ? `${d}d ` : '') + [(x % 86400) / 3600, (x % 3600) / 60, x % 60].map(q).join(':')
}

const e = (s: string) => s.replace('d ', ' روز ').replace(/\d/g, (x) => '۰۱۲۳۴۵۶۷۸۹'[+x])

const g = document.querySelector('#app')!

const v = (x: t, j: string) => {
  const s = (x.l?.p ?? []).map(() => '<span class="size-1.5 rounded-full"></span>').join('')
  g.innerHTML = `
    <div class="text-center">
      <div dir="ltr" class="font-mono font-bold tabular-nums text-7xl sm:text-9xl select-none transition-colors"></div>
      <p class="mt-4 h-7 text-xl text-neutral-400"></p>
      <div class="mt-4 flex flex-wrap justify-center gap-2">${s}</div>
    </div>`

  const [z, y, w] = [...g.firstElementChild!.children]
  const q = [...w.children]
  let i = false
  let h = ''

  const k = () => {
    const a = f(x, Date.now())
    const n = a.i !== undefined ? x.l!.n[a.i] : j ? `${a.u ? 'since' : 'until'} ${j}` : x.l && !a.u ? 'until loop' : ''
    const o = i ? e(c(a)) : c(a)
    const m = n ? `${n} ${o}` : o
    if (m === h) return
    h = m
    z.textContent = o
    y.textContent = n
    document.title = m
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
  const t = () => (k(), setTimeout(t, 1e3 - (Date.now() % 1e3)))
  const p = () => (k(), requestAnimationFrame(p))
  t()
  p()
}

const w = () => {
  g.innerHTML = '<pre class="max-w-2xl text-sm text-neutral-300 whitespace-pre-wrap"></pre>'
  g.firstElementChild!.textContent = y.split('## dev')[0].trim()
}

const s = (x: string) => {
  try {
    return decodeURIComponent(x)
  } catch {
    return x
  }
}

const b = () => {
  if (/^\/(help|howto)\/?$/i.test(location.pathname)) return w()
  const x = r(location.pathname, Math.floor(Date.now() / 1e3) * 1e3)
  if (!x) return void (g.innerHTML = '<p class="text-2xl">not a timer</p>')
  history.replaceState(null, '', h(x) + location.hash)
  v(x, s(location.hash.slice(1)).replace(/_/g, ' '))
}

b()
