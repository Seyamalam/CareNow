# One app, every role — 1.2

Open the account chip on Home, Transport, Profile, a tracking screen or a professional workspace. Choose Customer, Care professional, Driver, Doctor or Service provider. All five personas operate on the same isolated exhibition session; switching preserves bookings and each professional's availability.

## Demonstrate both sides

1. Customer books a ride. For trucks choose 1 or 2 tons and cargo; for minibuses choose up to 24 passengers. Truck and bus departures can be scheduled up to 30 days ahead in Bangladesh time.
2. Switch to Driver, accept the request, then Start pickup. Open its map to see the moving vehicle, road heading and ETA. Follow driver keeps the camera nearby; tap again to frame the route.
3. Switch to Customer to see the same booking. Driver records arrival, starts the trip and completes it. History and demo earnings update.
4. For care, a provider assigns the requested visit to Nusrat. Switch to Care professional to accept, travel, arrive and complete. Customer sees the care worker's location and status.
5. Doctor accepts an appointment and opens its consultation. Completing it creates the consultation record. The Doctor persona represents the fictional clinical team, not a verified individual clinician.

Professional actions are validated by the Hono API. A customer cannot advance a driver job; a professional must accept it, and terminal jobs cannot restart. The account picker intentionally grants exhibition personas. It is not production authentication or staff identity verification.

## Presenter rehearsal

Open account switcher → Presenter controls. Enable exhibition controls, then load Ambulance pickup, Caregiver arrival or Group transport. Confirming a scenario replaces the current demo bookings in that session. Replay restores the selected scenario. Pause/resume and 1×, 3×, 8× adjust the simulated movement clock; status changes remain deliberate button presses.

Turn exhibition controls off to demonstrate normal professional acceptance and handoffs. The role switcher remains available.

Enter offline rehearsal before presenting without internet. It uses a separate local dataset and bundled road geometry. Account changes, bookings, completion, scenarios and playback work locally and survive an app restart. The offline map is a labelled route diagram; it does not download street tiles. Return to cloud session restores the original D1 data and never uploads rehearsal changes. Uploads and external links require connectivity. For the browser, load the app while online first; an uncached browser cold start still needs internet. The installed APK bundles its code, fonts and animations.

## Motion and loading

Original bundled Lottie illustrations cover logo reveal, success and empty states. Native gestures and route markers use Reanimated; web maps update their markers directly without rendering the whole React tree each frame. The initial fixed delay is removed, data loading uses skeletons, refresh preserves visible content, and loading buttons are scoped to the component performing the action. Reduced motion disables decorative playback and moving routes; background/inactive tracking pauses rendering.

See [performance evidence](PERFORMANCE.md) and [native screenshots](../README.md#screen-gallery). Positions, ETA, fares, earnings and dispatch remain fictional exhibition simulations.
