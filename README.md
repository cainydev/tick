# tick

a clock in a url.

```
tick.cainy.dev/<moment>/<loop>
```

before the moment it counts down, after it counts up.

## moment

| url       | means                |
| --------- | -------------------- |
| `/`       | now (a stopwatch)    |
| `/20m`    | in 20 minutes        |
| `/1h30m`  | in 90 minutes        |
| `/at1830` | next 18:30           |
| `/tzk3a0` | unix seconds, base36 |

## loop

| url                | means                   |
| ------------------ | ----------------------- |
| `/25m5m`           | 25m, then 5m            |
| `/6x30s2m`         | 30s six times, then 2m  |
| `/work25mbreak5m`  | labeled phases          |
| `/at1830/4x50m10m` | starts at 18:30         |

loops repeat forever. a new phase starts at every label or count, or wherever units stop decreasing: `1h30m` is one phase, `25m5m` is two.

## links

every url is rewritten to `/<base36>` or `/<base36>/<loop>` on load, so reloading never loses progress and everyone with the link sees the same clock.

## dev

```
bun install
bun dev
```
