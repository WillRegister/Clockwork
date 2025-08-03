import json
from datetime import datetime
from difflib import get_close_matches

with open('moon_data.json', 'r') as f:
    moon_data = json.load(f)

moon_dict = {entry["datetime"]: entry for entry in moon_data}

def lookup_moon_data():
    user_input = input("Enter a datetime (e.g., 2025-08-03 or 2025-08-03T14): ")

    # Determine format based on input length
    if len(user_input) == 10:  # YYYY-MM-DD
        padded_input = user_input + "T12:00:00+00:00"
        print("🕛 No hour provided — defaulting to noon (12:00 UTC).")
    elif len(user_input) == 13:  # YYYY-MM-DDTHH
        padded_input = user_input + ":00:00+00:00"
        print(f"🔍 Interpreting datetime as: {padded_input}")
    else:
        print("⚠️ Invalid format. Use YYYY-MM-DD or YYYY-MM-DDTHH")
        return

    # Validate padded input
    try:
        datetime.strptime(padded_input, "%Y-%m-%dT%H:%M:%S%z")
    except ValueError:
        print("🚫 Date format is wrong. Try again.")
        return

    # Lookup data
    if padded_input in moon_dict:
        result = moon_dict[padded_input]
        print(f"\n🌕 Moon data for {padded_input}:")
        for key, value in result.items():
            print(f"   {key}: {value}")
    else:
        print("⛔ No data found for that time.")

if __name__ == "__main__":
    while True:
        lookup_moon_data()
        again = input("\n🔁 Look up another? (y/n): ")
        if again.lower() != 'y':
            break