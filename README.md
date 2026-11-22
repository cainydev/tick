# tick

a clock in a url.

```
tick.cainy.dev/<moment>/<loop>#<name>
```

before the moment it counts down, after it counts up.

## moment

| url                 | means                     |
| ------------------- | ------------------------- |
| `/`                 | now (a stopwatch)         |
| `/20m`              | in 20 minutes             |
| `/1h30m`            | in 90 minutes             |
| `/at1830`           | next 18:30                |
| `/at20261224`       | 24 dec 2026, 00:00        |
| `/at202612242000`   | 24 dec 2026, 20:00        |
| `/at202612242000+1` | 24 dec 2026, 20:00 utc+1  |
| `/tzk3a0`           | unix seconds, base36      |

`at` is your local time unless it ends in an offset like `+1`, `-5` or `+0330`.

## loop

| url                  | means                     |
| -------------------- | ------------------------- |
| `/25m5m`             | 25m, then 5m              |
| `/6x30s2m`           | 30s six times, then 2m    |
| `/8x(work20s10s)`    | 20s and 10s, eight times  |
| `/work25mbreak5m`    | labeled phases            |
| `/at1830/4x50m10m`   | starts at 18:30           |

loops repeat forever. a new phase starts at every label, count or bracket, or wherever units stop decreasing: `1h30m` is one phase, `25m5m` is two.

## name

`/at2000#launch_party` shows `until launch party`, then `since launch party`.
with a loop, it shows before the start. labels and names use `_` for spaces.

## links

every url is rewritten to `/<base36>` or `/<base36>/<loop>` on load, so reloading never loses progress and everyone with the link sees the same clock.

## sharing

the address bar is a live link: anyone who opens it joins your clock, synced to the second.
to share just the loop, drop the first part: `/towtlv/8x(work20s10s)` → `/8x(work20s10s)`.
to start together later, put a time in front: `/at1800/8x(work20s10s)`.

## dev

```
bun install
bun dev
```
