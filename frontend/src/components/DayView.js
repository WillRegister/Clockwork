import React, { useState, useEffect, useRef } from 'react';
import CustomButton from './CustomButton';
import './DayView.css';

/**
 * DayView displays 24 hour blocks for a given date. Each block allows the user
 * to enter a mood (1–10) and notes. Changes are auto-saved to the backend
 * after a brief pause in typing. An indicator shows the save state for each
 * hour: green (saved), yellow (saving), red (dirty/error).
 *
 * Props:
 *  - date: a Date object for the day to display
 *  - onClose: function called when the user clicks the back button
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
        const extended = data.map((entry) => ({ ...entry, status: 'saved' }));
        setHours(extended);
      } catch (err) {
        console.error('Failed to load day data', err);
        // Fallback: create 24 empty hour entries so the UI still renders
        const fallback = Array.from({ length: 24 }, (_, hour) => ({
          hour,
          mood: null,
          notes: '',
          status: 'saved',
        }));
        setHours(fallback);
      }
    }
    fetchDayData();
    // Cleanup any pending timeouts when unmounting or switching days
    return () => {
      Object.values(saveTimeouts.current).forEach((timeoutId) => clearTimeout(timeoutId));
      saveTimeouts.current = {};
    };
  }, [date]);

  /**
   * Schedule a save operation for the given hour. This debounces rapid edits
   * so that a save is only triggered after the user stops typing for
   * approximately 800ms.
   */
  const scheduleSave = (hour) => {
    // Clear any existing timeout for this hour
    if (saveTimeouts.current[hour]) {
      clearTimeout(saveTimeouts.current[hour]);
    }
    // Set a new timeout
    saveTimeouts.current[hour] = setTimeout(() => {
      saveHour(hour);
    }, 800);
  };

  /**
   * Persist a single hour entry to the backend. Updates the status indicator
   * accordingly.
   */
  const saveHour = async (hour) => {
    const isoDate = date.toISOString().split('T')[0];
    const hourEntry = hours.find((h) => h.hour === hour);
    // Update status to saving
    setHours((prev) =>
      prev.map((h) => (h.hour === hour ? { ...h, status: 'saving' } : h))
    );
    try {
      const res = await fetch('/api/day', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: isoDate,
          hour: hour,
          mood: hourEntry.mood || null,
          notes: hourEntry.notes || null,
        }),
      });
      if (res.ok) {
        setHours((prev) =>
          prev.map((h) => (h.hour === hour ? { ...h, status: 'saved' } : h))
        );
      } else {
        setHours((prev) =>
          prev.map((h) => (h.hour === hour ? { ...h, status: 'error' } : h))
        );
      }
    } catch (err) {
      console.error('Save failed', err);
      setHours((prev) =>
        prev.map((h) => (h.hour === hour ? { ...h, status: 'error' } : h))
      );
    }
  };

  /**
   * Handle changes to mood or notes. Updates local state and schedules a save.
   */
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