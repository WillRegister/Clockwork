import React, { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './CalendarView.css';
import CustomButton from './CustomButton';

/**
 * CalendarView is responsible for rendering a month-view calendar and displaying
 * the currently selected date. It uses react-calendar for the calendar UI and
 * applies custom styling and a simple fade-in animation.
 */
const CalendarView = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());

  return (
    <div className="calendar-container">
      <Calendar
        onChange={setSelectedDate}
        value={selectedDate}
        view="month"
        className="calendar"
      />
      <p className="selected-date">
        Selected: {selectedDate.toDateString()}
      </p>

      {/* Demonstration button. Replace with actual actions later. */}
      <CustomButton
        variant="primary"
        onClick={() => alert('Future feature coming soon!')}
        style={{ marginTop: '1rem' }}
      >
        Add Event
      </CustomButton>
    </div>
  );
};

export default CalendarView;