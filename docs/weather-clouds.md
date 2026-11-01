# Cloud rendering references

The automatic mode selects a visual approximation from forecast cloud layers and precipitation codes. It does not identify an observed cloud genus. Surface temperature, humidity and a WMO weather code alone do not establish vertical stability or cloud shape.

| Visual profile | Reference appearance | Selection |
| --- | --- | --- |
| Cumulus | Fair-weather humilis: broad, shallow bodies, roughly horizontal bases, irregular small tops, restrained internal shading | Broken lower cloud cover without shower/storm codes |
| Stratus | A relatively shallow, continuous deck with subtle relief, resembling nebulosus | Overcast, fog, drizzle, steady rain/snow |
| Stratus fractus / undulatus / translucidus | Ragged fragments / undulating sheet / translucent sheet | Manual visual variants |
| Stratocumulus | A separate genus: low, rounded elements in a layer, sometimes with gaps or waves | Dense lower cloud in non-convective partly-cloudy conditions; or manual |
| Cirrus | Thin, translucent fibres, without dense dark bases | High cloud cover with negligible measured low/mid cover |
| Mixed | Lower cloud bodies with a separate upper veil | Both lower and high layers are present |

Showers and thunderstorms permit deeper convective clouds. Ordinary cumulus defaults to a much shallower profile. Debug controls can override the profile, cover and weather independently.

WMO classifies nebulosus and fractus as Stratus species; translucidus, opacus, and undulatus are varieties describing transparency or arrangement. Translucidus can cover the whole sky while still letting the sun show through; opacus obscures it. Stratocumulus is a different genus, not a Stratus species. These names describe visual references, not a diagnosis from forecast data. See the [WMO International Cloud Atlas, volume I](https://cloudatlas.wmo.int/docs/wmo_407_en-v1.pdf).

Coverage changes which clusters are present, their spacing, and their merging at high cover. It does not merely resize a fixed set of clouds. The debug panel provides reference values 0%, 5%, 20%, 40%, 70%, and 100%, using the [NASA/GLOBE photographic coverage categories](https://mynasadata.larc.nasa.gov/interactive-models/modeling-cloud-cover): no clouds, few, isolated, scattered, broken, and overcast. These educational bands differ from aviation METAR labels.

Open-Meteo reports low cover up to 3 km, middle cover from 3–8 km, and high cover above 8 km. These layers can overlap; total cover need not equal their sum. Missing layers fall back to total cover rather than being treated as observed clear sky.

References used for shape and lighting:

- [WMO: Cumulus humilis](https://cloudatlas.wmo.int/en/cumulus-humilis.html)
- [WMO photograph: Cumulus humilis and fractus](https://cloudatlas.wmo.int/images/compressed/5941_main_cumulis-humilis-and-fractus_clouds.JPG)
- [WMO photograph: Cumulus mediocris](https://cloudatlas.wmo.int/images/compressed/4993_main_cumulus-mediocris_clouds.JPG)
- [Met Office: low clouds and cumulus species](https://weather.metoffice.gov.uk/learn-about/weather/types-of-weather/clouds/low-level-clouds)
- [NOAA: ten basic cloud types](https://www.noaa.gov/jetstream/clouds/ten-basic-clouds)
- [Open-Meteo: forecast variables](https://open-meteo.com/en/docs)

The low layer uses a bounded volume with density integration and shadow samples towards the sun. Cirrus uses a separate thin layer above it. The renderer is procedural and deliberately simpler than a meteorological or full radiative-transfer simulation.
