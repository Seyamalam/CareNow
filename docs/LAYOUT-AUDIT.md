# Layout correction plan

The report and presentation are paused until the screens are corrected and re-captured.

## Reproduced on Android

360 × 640 logical pixels, system text 120%, version 1.2.0:

- Home header extends past the right edge; fixed-height tiles squeeze wrapped labels.
- Transport header pushes Trips outside the viewport.
- The map booking footer overlaps the destination and ride selection because its actual height exceeds the reserved 118 dp.
- Account sheet reaches under the status bar; long sheet content cannot scroll.
- Transport navigation label truncates.

## Milestones

- [x] Capture baseline screens and identify shared causes.
- [x] Replace fixed geometry with flexible content and bounded scrolling.
- [x] Inspect corrected screens on small and regular Android sizes, including enlarged text and keyboard-open forms.
- [x] Inspect web layouts at phone and desktop widths.
- [x] Build and publish the corrected APK and web app.
- [x] Add corrected screenshots to the README gallery.
- [ ] Produce the detailed report and presentation using corrected product images.

Private baseline captures are in artifacts/layout-audit. Public screenshots will be added only after visual review.
