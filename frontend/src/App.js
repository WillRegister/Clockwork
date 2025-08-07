import React, { useState } from 'react';
import CalendarView from './components/CalendarView';
import DayView from './components/DayView';
import FoodSearch from './components/FoodSearch';
import Home from './components/Home'; // Import the new Home component
import './App.css';

/**
 * The root component of the Clockwork application.
 * It now uses the immersive Home component as the entry point and
 * handles navigation to other views.
 */
function App() {
  const [selectedDate, setSelectedDate] = useState(null);
  const [currentView, setCurrentView] = useState('home'); // 'home', 'calendar', or 'food'

  const handleDateSelect = (date) => {
    setSelectedDate(date);
  };

  const closeDayView = () => {
    setSelectedDate(null);
  };

  const renderView = () => {
    switch (currentView) {
      case 'calendar':
        return <CalendarView onDateSelect={handleDateSelect} />;
      case 'food':
        return <FoodSearch />;
      case 'home':
      default:
        // The Home component takes a function to handle navigation
        return <Home onNavigate={setCurrentView} />;
    }
  };

  return (
    <div className="App">
      {/* Conditionally render the header so it doesn't show on the home screen */}
      {currentView !== 'home' && (
        <header className="app-header">
          <h1 onClick={() => setCurrentView('home')} style={{cursor: 'pointer'}}>CLOCKWORK</h1>
          <nav>
            <button className="nav-link" onClick={() => setCurrentView('calendar')}>Calendar</button>
            <button className="nav-link" onClick={() => setCurrentView('food')}>Recipe Builder</button>
          </nav>
        </header>
      )}
      <main className="app-main">
        {renderView()}
        {/* The DayView overlay is only relevant for the calendar view */}
        {selectedDate && currentView === 'calendar' && (
          <DayView date={selectedDate} onClose={closeDayView} />
        )}
      </main>
    </div>
  );
}

export default App;
