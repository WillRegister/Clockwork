import React from 'react';
import CalendarView from './components/CalendarView';
import './App.css';

/**
 * The root component of the Clockwork application.
 * It renders a header and the main calendar view. More sections can be added
 * later (e.g. navigation, settings, etc.).
 */
function App() {
  return (
    <div className="App">
      <header className="app-header">
        <h1>Clockwork Calendar</h1>
      </header>
      <main className="app-main">
        <CalendarView />
      </main>
    </div>
  );
}

export default App;