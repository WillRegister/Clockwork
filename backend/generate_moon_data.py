from skyfield.api import load, utc
from math import cos, pi
from datetime import datetime, timedelta
import json

# Load ephemeris
eph = load('de421.bsp')  # Make sure it's in the same directory
earth = eph['earth']
moon = eph['moon']
sun = eph['sun']
ts = load.timescale()

# Define the range of times
start = datetime(2025, 1, 1, tzinfo=utc)
end = datetime(2026, 1, 1, tzinfo=utc)  # Full year
step = timedelta(hours=1)



# Generate moon data
moon_data = []
current = start
while current < end:
    t = ts.from_datetime(current)

    moon_astrometric = earth.at(t).observe(moon).apparent()
    sun_astrometric = earth.at(t).observe(sun).apparent()

    phase_angle = moon_astrometric.phase_angle(sun)
    illumination = (1 + cos(phase_angle.radians)) / 2 * 100

    ra, _, _ = moon_astrometric.radec()
    distance = moon_astrometric.distance()

    # Check if waxing or waning
    previous_entry = moon_data[-1] if moon_data else None
    if previous_entry:
        waxing = illumination > previous_entry['illumination']
        waxing_waning = "waxing" if waxing else "waning"

        approaching_apogee = distance.km > previous_entry['distance_km']
        approaching = "apogee" if approaching_apogee else "perigee"
    else:
        waxing_waning = "unknown"
        approaching = "unknown"

    # Append the full data
    moon_data.append({
        "datetime": current.isoformat(),
        "illumination": round(illumination, 2),
        "waxing_waning": waxing_waning,
        "ra_hours": round(ra.hours, 2),
        "distance_km": round(distance.km, 2),
        "approaching": approaching
    })

    current += step

# Save to file
with open("moon_data.json", "w") as f:
    json.dump(moon_data, f, indent=2)

print("Done! Data saved to moon_data.json")
