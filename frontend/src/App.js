import React, { useState } from 'react';
import CalendarView from './components/CalendarView';
import DayView from './components/DayView';
import './App.css';

/**
 * The root component of the Clockwork application.
 * It renders a header and the main calendar view. More sections can be added
 * later (e.g. navigation, settings, etc.).
 */
function App() {
  // State to hold the currently selected date for day view (null means no day view)
  const [selectedDate, setSelectedDate] = useState(null);

  // Callback passed to CalendarView to open the day view
  const handleDateSelect = (date) => {
    setSelectedDate(date);
  };

  // Close the day view
  const closeDayView = () => {
    setSelectedDate(null);
  };

  return (
    <div className="App">
      <header className="app-header">
        <h1>Clockwork Calendar</h1>
      </header>
      <main className="app-main">
        {/* Render the month calendar and pass date select handler */}
        <CalendarView onDateSelect={handleDateSelect} />
        {/* Conditionally render the day view overlay when a date is selected */}
        {selectedDate && (
          <DayView date={selectedDate} onClose={closeDayView} />
        )}
      </main>
    </div>
  );
}

export default App;