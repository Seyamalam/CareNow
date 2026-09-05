# Assets and sources

- `assets/carenow-mark.png`: original image generated for this project using OpenAI image generation. Direction: four soft petals, evergreen/ivory/mint, family care, no text. The app's SVG mark is a matching original vector composition in `components/brand.tsx`, animated with Reanimated.
- Lucide React Native icons: ISC license; https://lucide.dev/license. Icons are bundled locally. Panel UI supplies animated press states; the splash and screen entrances use Reanimated. No downloaded icon animation service is required at runtime.
- DM Sans and Manrope: Google Fonts, SIL Open Font License. Bundled through their Expo font packages.
- Fictional doctor names, ratings, qualifications, fees, records and family profiles are authored exhibition fixtures, not verified professionals or clinical recommendations.
- `fixtures/demo-report.pdf`: original fictional upload fixture generated for testing.
- Brief: private `Project DBA.docx`; all five pages and embedded handwriting visually reviewed. See `BRIEF-REVIEW.md`. The source document is excluded from the public repository.
- Exhibition context: https://innovationfairbd.org/; user confirmed Innovation Exhibitor.

External education links, verified during implementation on 2026-09-05:

- NHS pregnancy nutrition: https://www.nhs.uk/pregnancy/keeping-well/have-a-healthy-diet/
- NHS antenatal appointments: https://www.nhs.uk/pregnancy/your-pregnancy-care/your-antenatal-care-and-appointments/
- NHS postpartum recovery: https://www.nhs.uk/baby/support-and-services/your-post-pregnancy-body/

The app links to these English-language sources, rather than reproducing or adapting treatment advice. NHS service arrangements are UK-specific; users should plan local care with their own clinician.

## Transport maps (1.1)

Original fleet SVGs: `components/vehicle-art.tsx`. Native MapLibre and MapLibre GL JS are BSD licensed. Map attribution and OSRM/OSM road data provenance are documented in [TRANSPORT.md](TRANSPORT.md). No remote portrait or icon asset is required.
