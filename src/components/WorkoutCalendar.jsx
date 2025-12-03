import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import './WorkoutCalendar.css';


const WorkoutCalendar = ({ workouts = [] }) => {
  // state
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);

  // turn MM/DD/YYYY into a Date
  const parseDate = (dateStr) => {
    if (!dateStr) return new Date();
    const [month, day, year] = dateStr.split('/').map(Number);
    return new Date(year, month - 1, day);
  };

  // get workouts for a specific calendar day
  const getWorkoutsForDay = (year, month, day) =>
    workouts.filter((w) => {
      if (!w.date) return false;
      const d = parseDate(w.date);
      return (
        d.getFullYear() === year &&
        d.getMonth() === month &&
        d.getDate() === day
      );
    });

  // month values
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 is Sunday

  // change month
  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  // build day cells
  const renderCalendarDays = () => {
    const days = [];

    // leading empty cells
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }

    // actual days
    for (let d = 1; d <= daysInMonth; d++) {
      const dayWorkouts = getWorkoutsForDay(year, month, d);
      const isSelected = selectedDay === d;
      const hasWorkout = dayWorkouts.length > 0;

      days.push(
        <div
          key={d}
          className={`calendar-day ${isSelected ? 'selected' : ''} ${hasWorkout ? 'has-workout' : ''}`}
          onClick={() => setSelectedDay(d)}
        >
          <span className="day-number">{d}</span>
        </div>
      );
    }
    return days;
  };

  // workouts for the chosen day
  const selectedWorkouts = selectedDay ? getWorkoutsForDay(year, month, selectedDay) : [];

  return (
    <div className="calendar-container">
      {/* header */}
      <div className="calendar-header">
        <div className="month-display">
          <CalendarIcon className="icon-green" size={24} />
          <h2>{currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h2>
        </div>
        <div className="nav-buttons">
          <button onClick={prevMonth} className="nav-btn"><ChevronLeft size={20} /></button>
          <button onClick={nextMonth} className="nav-btn"><ChevronRight size={20} /></button>
        </div>
      </div>

      {/* weekday labels */}
      <div className="calendar-grid-header">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
          <div key={d} className="day-name">{d}</div>
        ))}
      </div>

      {/* day grid */}
      <div className="calendar-grid">{renderCalendarDays()}</div>

      {/* details panel */}
      <div className="selected-details">
        {selectedDay ? (
          <>
            <h3 className="details-header">
              Workouts for {month + 1}/{selectedDay}/{year}
            </h3>
            {selectedWorkouts.length > 0 ? (
              <div className="workout-list">
                {selectedWorkouts.map((w, index) => (
                  <div key={w.id || index} className="workout-card">
                    <div className="workout-card-header">
                      <h4>{w.title || 'Untitled Workout'} <span className="arrow">▶</span></h4>
                      <span className="workout-date">{w.date}</span>
                    </div>
                    <p className="workout-meta">
                      {w.exercises ? `${w.exercises} exercises` : 'Exercises'} • {w.duration || '0 min'}
                    </p>
                    {w.details && (
                      <div className="tags">
                        {w.details.slice(0, 3).map((tag, i) => (
                          <span key={i} className="pill">{tag}</span>
                        ))}
                        {w.details.length > 3 && <span className="pill italic">more...</span>}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-data">No workouts logged for this day.</p>
            )}
          </>
        ) : (
          <p className="instruction">Select a date to view workout history</p>
        )}
      </div>
    </div>
  );
};

export default WorkoutCalendar;
