# Release performance evidence — 5 September 2026

CareNow 1.2 targets smooth 60 Hz interaction. This delivery does **not** establish a sustained 60 fps guarantee on physical phones.

## Measurements

Release ARM64 APKs, Android 15 Pixel 7 profile, 1080×2400, dedicated emulator-5580. Android `dumpsys gfxinfo com.carenow.demo framestats` was reset before each sample. No debugger or Metro development build was used.

| Workload | Frames | Android deadline jank | p50 / p95 frame duration |
|---|---:|---:|---:|
| 1.1 pickup sheet, six open/close cycles | 231 | 13.42% | 23 / 65 ms |
| 1.2 continuous native route movement, about 25.3 seconds | 1,497 | 0.80% | 24 / 28 ms |
| 1.2 pickup sheet, six open/close cycles, host under load | 178 | 35.39% | 36 / 150 ms |

The moving-route sample rendered roughly 59 frames per second over its observation window. That is an observed cadence for this sample, not a whole-app benchmark. Android's legacy jank metric was 97.80% for that sample, and the duration percentiles exceed 16.67 ms. Overlapping render stages, emulator scheduling and MapLibre's separate rendering surface mean these measurements cannot certify the complete display pipeline.

The later sheet comparison was worse than the earlier baseline. A separate GPU-heavy application was actively consuming substantial host resources during the later run. We left the user's other applications and emulator untouched. The changed host conditions prevent attributing that difference solely to the app, but the poor result is retained rather than excluded. A controlled rerun and a midrange physical Android device are still needed for sheet and gesture performance acceptance.

Raw results: [1.1 sheet baseline](performance/1.1-picker-baseline.txt), [1.2 route](performance/1.2-motion-corrected.txt), [1.2 sheet under host load](performance/1.2-picker-host-load.txt). `scripts/profile-picker.py` reproduces the six-cycle sequence on the inspected AVD; recheck coordinates before using another screen size.

## Changes that reduce work

- Native route interpolation, position and heading run on the Reanimated UI runtime. Cumulative route distances are built once and sampled by binary search.
- Web marker positions update imperatively; React does not rerender the trip screen every animation frame. Hidden, paused and completed motion stops the requestAnimationFrame loop.
- ETA text updates in its own small component. Map follow-camera updates are throttled to 1.5 seconds.
- Data, commands and notices use separate contexts; transient notices do not invalidate the whole data tree. Button loading is scoped to the calling component.
- Refresh retains data. The arbitrary 1.5-second initial delay is removed; skeletons fill actual loading time.
- Bundled Lottie illustrations play once, pause in the background and respect reduced motion. Screen entry animation duration is shorter; the booking-panel gesture stays on the UI runtime.

## Visual checks

The vehicle's coordinate and heading visibly changed between README captures 46 and 47, eight seconds apart. A native worklet dependency issue found during profiling was corrected by reading shared values directly in each mapper. Paused offline-map captures six seconds apart were byte-identical; resuming at 3× visibly advanced the vehicle and ETA. Dragging the booking panel changed its accessible state from Expand to Collapse.
