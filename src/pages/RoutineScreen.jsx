// ============================================================================
// RoutineScreen.jsx — the screen shown when you tap "Routine" in the menu.
//
// It draws a 30-day calendar: one numbered square per day. Tapping a day marks
// it as done; tapping it again clears it. That gives the user a simple way to
// see how many days in a row they've kept their routine going.
// ============================================================================

import './RoutineScreen.css'

// How many days the calendar covers. Change this one number to make it a
// 60- or 90-day calendar — the grid below adjusts itself automatically.
const TOTAL_DAYS = 30

// Build the list [1, 2, 3, ... 30] rather than typing out thirty numbers.
//   Array.from({ length: 30 }, ...) makes a 30-item list
//   the second part decides what each item is: its position (0-29) plus 1,
//   because we want the days to start at 1, not 0.
const DAYS = Array.from({ length: TOTAL_DAYS }, (_, index) => index + 1)

// PROPS from App.jsx:
//   completedDays → a list of the day numbers already ticked off, e.g. [1, 2, 5]
//   onToggleDay   → the function to call when a day square is tapped
function RoutineScreen({ completedDays, onToggleDay }) {
  return (
    <main className="screen routine-screen">
      <h1 className="title">Routine</h1>
      <div className="title-rule" />

      {/* aria-label describes the grid as a whole for screen readers. */}
      <div className="calendar" aria-label={`${TOTAL_DAYS} day calendar`}>
        {/* One square per day. .map() turns each number in the DAYS list into
            a button, the same way TabBar builds the four menu buttons. */}
        {DAYS.map((day) => {
          // .includes() asks "is this day number in the completed list?" and
          // answers true or false. Worked out once here to keep the JSX below
          // readable, since the answer is needed in three places.
          const isDone = completedDays.includes(day)

          return (
            <button
              key={day}
              type="button"
              className={`day${isDone ? ' is-done' : ''}`}
              // Tells a screen reader whether this day is switched on.
              aria-pressed={isDone}
              // A screen reader would otherwise announce only "5". This spells
              // out what the number means. It is not shown on screen.
              aria-label={`Day ${day}${isDone ? ', done' : ''}`}
              onClick={() => onToggleDay(day)}
            >
              {day}
            </button>
          )
        })}
      </div>
    </main>
  )
}

export default RoutineScreen
