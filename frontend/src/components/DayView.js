import React, { useState, useEffect, useRef } from 'react';
import CustomButton from './CustomButton';
import './DayView.css';
import './LunarData.css';
import moonData from './moon_data.json';

/**
 * Finds the lunar data for a specific date and hour.
 * @param {Date} date - The date to find lunar data for.
 * @param {number} hour - The hour to find lunar data for.
 * @returns {object|null} The lunar data object or null if not found.
 */
const findLunarData = (date, hour) => {
  const isoString = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    hour
  )
    .toISOString()
    .slice(0, 13);
  return moonData.find((entry) => entry.datetime.startsWith(isoString));
};

/**
 * DayView displays 24 hour blocks for a given date. Each block allows the user
 * to enter a mood (1–10) and notes. Changes are auto-saved to the backend
 * after a brief pause in typing. An indicator shows the save state for each
 * hour: green (saved), yellow (saving), red (dirty/error).
 *
 * Props:
 * - date: a Date object for the day to display
 * - onClose: function called when the user clicks the back button
 */
const DayView = ({ date, onClose }) => {
  // State holds an array of hour entries (0–23) with mood, notes and status
  const [hours, setHours] = useState([]);
  // Ref to keep track of pending save timeouts per hour
  const saveTimeouts = useRef({});

  // Fetch day data when component mounts or date changes
  useEffect(() => {
    const isoDate = date.toISOString().split('T')[0];
    async function fetchDayData() {
      try {
        const res = await fetch(`/api/day?date=${isoDate}`);
        if (!res.ok) {
          throw new Error('Request failed');
        }
        const data = await res.json();
        // Extend with status field for UI feedback
        const extended = data.map((entry) => ({
          ...entry,
          status: 'saved',
          lunarData: findLunarData(date, entry.hour),
        }));
        setHours(extended);
      } catch (err) {
        console.error('Failed to load day data', err);
        // Fallback: create 24 empty hours
        const fallbackHours = Array.from({ length: 24 }, (_, i) => ({
          hour: i,
          mood: null,
          notes: '',
          status: 'new',
          lunarData: findLunarData(date, i),
        }));
        setHours(fallbackHours);
      }
    }
    fetchDayData();
  }, [date]);

  // Debounced save function
  const scheduleSave = (hour) => {
    // Clear any existing timeout for this hour
    if (saveTimeouts.current[hour]) {
      clearTimeout(saveTimeouts.current[hour]);
    }

    // Set a new timeout
    saveTimeouts.current[hour] = setTimeout(() => {
      const entry = hours.find((h) => h.hour === hour);
      if (entry) {
        // Optimistically set status to 'saving'
        setHours((prev) =>
          prev.map((h) => (h.hour === hour ? { ...h, status: 'saving' } : h))
        );
        const isoDate = date.toISOString().split('T')[0];
        fetch('/api/day', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            date: isoDate,
            hour: entry.hour,
            mood: entry.mood,
            notes: entry.notes,
          }),
        })
          .then((res) => {
            if (!res.ok) throw new Error('Save failed');
            setHours((prev) =>
              prev.map((h) =>
                h.hour === hour ? { ...h, status: 'saved' } : h
              )
            );
          })
          .catch(() => {
            setHours((prev) =>
              prev.map((h) =>
                h.hour === hour ? { ...h, status: 'error' } : h
              )
            );
          });
      }
    }, 1500); // 1.5 second delay
  };

  // Update state on input change and schedule a save
  const handleChange = (hour, field, value) => {
    setHours((prev) =>
      prev.map((h) =>
        h.hour === hour ? { ...h, [field]: value, status: 'dirty' } : h
      )
    );
    scheduleSave(hour);
  };

  // Render the overlay with a list of hour rows
  return (
    <div className="day-view-overlay">
      <div className="day-view">
        <div className="day-view-header">
          <CustomButton onClick={onClose} style={{ marginBottom: '1rem' }}>
            Back
          </CustomButton>
          <h2>{date.toDateString()}</h2>
        </div>
        <div className="hour-list">
          {hours.map((h) => (
            <div key={h.hour} className="hour-row">
              <span className="hour-label">
                {String(h.hour).padStart(2, '0')}:00
              </span>
              <div className="mood-and-lunar-container">
                <input
                  type="number"
                  min="1"
                  max="10"
                  placeholder="Mood"
                  value={h.mood ?? ''}
                  onChange={(e) =>
                    handleChange(
                      h.hour,
                      'mood',
                      e.target.value ? parseInt(e.target.value) : ''
                    )
                  }
                  className="mood-input"
                />
                {h.lunarData && (
                  <div className="lunar-data">
                    <p>Illumination: {Math.trunc(h.lunarData.illumination)}%</p>
                    <p>Phase: {h.lunarData.waxing_waning}</p>
                    <p>Distance: {`${Math.trunc(h.lunarData.distance_km).toLocaleString()} km`}</p>
                    <p>Approaching: {h.lunarData.approaching}</p>
                  </div>
                )}
              </div>
              <textarea
                placeholder="Notes..."
                value={h.notes ?? ''}
                onChange={(e) => handleChange(h.hour, 'notes', e.target.value)}
                className="notes-input"
              />
              <span className={`status-dot ${h.status}`} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DayView;
