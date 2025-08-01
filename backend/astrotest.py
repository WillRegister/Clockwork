from skyfield.api import load

# 1. Load Ephemeris
planets = load('de421.bsp')  # DE440s is also available if you want longer range
earth = planets['earth']

# 2. Define planets
planet_names = ['mercury', 'venus', 'mars', 'jupiter barycenter', 'saturn barycenter']
tracked_planets = {name: planets[name] for name in planet_names}
moon = planets['moon']
sun = planets['sun']

# 3. Get current time
ts = load.timescale()
now = ts.now()

# 4. Get positions relative to Earth
for name, planet in tracked_planets.items():
    astrometric = earth.at(now).observe(planet)
    ra, dec, distance = astrometric.radec()
    print(f"{name.capitalize():<12}: RA={ra.hours:.2f}h  Dec={dec.degrees:.2f}°  Dist={distance.au:.6f} AU")

# Moon and Sun too:
for body, label in [(moon, 'Moon'), (sun, 'Sun')]:
    astrometric = earth.at(now).observe(body)
    ra, dec, distance = astrometric.radec()
    print(f"{label:<12}: RA={ra.hours:.2f}h  Dec={dec.degrees:.2f}°  Dist={distance.au:.6f} AU")