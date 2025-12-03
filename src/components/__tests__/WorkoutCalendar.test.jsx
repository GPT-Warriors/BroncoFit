import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import WorkoutCalendar from '../WorkoutCalendar';

const MOCK_WORKOUTS = [
  {
    id: 1,
    title: 'Chest Day',
    date: '12/15/2025',
    duration: '60 min',
    exercises: 3,
    details: ['Bench Press', 'Flyes']
  },
  {
    id: 2,
    title: 'Leg Day',
    date: '12/15/2025',
    duration: '45 min',
    exercises: 2,
    details: ['Squats']
  }
];

describe('WorkoutCalendar', () => {
  // use fixed date to keep tests stable
  beforeEach(() => {
    vi.useFakeTimers();
    const date = new Date(2025, 11, 1);
    vi.setSystemTime(date);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders the current month and year', () => {
    render(<WorkoutCalendar workouts={[]} />);
    expect(screen.getByText(/December 2025/i)).toBeInTheDocument();
  });

  it('renders days of the week', () => {
    render(<WorkoutCalendar workouts={[]} />);
    ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].forEach(day => {
      expect(screen.getByText(day)).toBeInTheDocument();
    });
  });

  it('goes to next month', () => {
    render(<WorkoutCalendar workouts={[]} />);
    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[1]);
    expect(screen.getByText(/January 2026/i)).toBeInTheDocument();
  });

  it('goes to previous month', () => {
    render(<WorkoutCalendar workouts={[]} />);
    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[0]);
    expect(screen.getByText(/November 2025/i)).toBeInTheDocument();
  });

  it('marks days with workouts', () => {
    render(<WorkoutCalendar workouts={MOCK_WORKOUTS} />);
    const day15 = screen.getByText('15').closest('.calendar-day');
    expect(day15).toHaveClass('has-workout');
  });

  it('shows workout details when a day is clicked', () => {
    render(<WorkoutCalendar workouts={MOCK_WORKOUTS} />);
    const day15 = screen.getByText('15');
    fireEvent.click(day15);
    expect(screen.getByText(/Workouts for 12\/15\/2025/i)).toBeInTheDocument();
    expect(screen.getByText('Chest Day')).toBeInTheDocument();
    expect(screen.getByText('Leg Day')).toBeInTheDocument();
    expect(screen.getByText('Bench Press')).toBeInTheDocument();
  });

  it('shows message when day has no workouts', () => {
    render(<WorkoutCalendar workouts={MOCK_WORKOUTS} />);
    const day10 = screen.getByText('10');
    fireEvent.click(day10);
    expect(screen.getByText(/No workouts logged for this day/i)).toBeInTheDocument();
  });
});
