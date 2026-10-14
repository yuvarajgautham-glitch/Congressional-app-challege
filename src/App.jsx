// App.jsx — the SHELL of the app.

// useState is a React "hook" — it lets a component REMEMBER something. useEffect is the hook.
import { useState, useEffect } from 'react'

// Styles shared by every screen (the frame, headings, the menu bar).
import './App.css'

// Saving the routine between visits, and the reminder timer itself.
import {
  loadRoutineDays,
  saveRoutineDays,
  loadReminderTime,
  saveReminderTime,
  clearRoutine,
} from './routineStorage'
import { clearExercisePlans, todayKey } from './exerciseStorage'
import { clearStreak, isCheckedIn } from './streakStorage'
import { isMeasurementDue, clearMeasurements } from './measurementsStorage'
import {
  startDailyReminder,
  showNotification,
  addHours,
  listenForNotificationClicks,
} from './notifications'
import CheckInScreen from './pages/CheckInScreen'
import DataScreen from './pages/DataScreen'

// Our own building blocks.
import TabBar from './components/TabBar'
import { TABS } from './components/tabs'
import HomeScreen from './pages/HomeScreen'
import GoalsScreen from './pages/GoalsScreen'
import RoutineScreen from './pages/RoutineScreen'
import SettingsScreen from './pages/SettingsScreen'
import ComingSoonScreen from './pages/ComingSoonScreen'

// A COMPONENT is just a function that returns what should appear on screen.
function App() {
  // ---- STATE ----
  // useState('home') creates a piece of memory starting at the value 'home'.
  const [activeTab, setActiveTab] = useState('home')

  // Which goal the user picked ('lose', 'gain', or null for "none yet").
  const [goal, setGoal] = useState(null)

  // Which days on the Routine calendar the user plans to exercise, as a list of date keys.
  const [routineDays, setRoutineDays] = useState(() => loadRoutineDays())

  // The daily reminder time as text, e.g. "07:30". '' means no reminder.
  const [reminderTime, setReminderTime] = useState(() => loadReminderTime())

  // Whether the check-in is open.
  const [showCheckIn, setShowCheckIn] = useState(false)

  // Set when the weekly notification asks for measurements.
  const [askForMeasurements, setAskForMeasurements] = useState(false)

  // ---- ACTIONS ----
  // Picks a calendar date, or un-picks it if it was already chosen.
  function toggleDay(dateKey) {
    // Passing a FUNCTION to setRoutineDays hands us the up-to-date list as "days".
    setRoutineDays((days) =>
      days.includes(dateKey)
        ? // Already chosen → build a new list with this date filtered out.
          days.filter((chosenDay) => chosenDay !== dateKey)
        : // Not chosen yet → build a new list: everything in the old one, plus
          // this date.
          [...days, dateKey],
    )
    // Note that both branches create a BRAND NEW list rather than editing the old one.
  }

  // Swaps the whole list of chosen dates at once. "Repeat weekly" uses.
  function replaceDays(days) {
    setRoutineDays(days)
    saveRoutineDays(days)
  }

  // Changes the reminder time, and writes it to storage so it survives a reload.
  function changeReminderTime(time) {
    setReminderTime(time)
    saveReminderTime(time)
  }

  // Wipes everything the user has DONE in the app, and nothing they've been ASKED.
  function resetProgress() {
    setGoal(null)
    setRoutineDays([])
    setReminderTime('')

    clearRoutine()
    clearExercisePlans()
    clearStreak()
    clearMeasurements()

    // The check-in is closed too, in case it happens to be open.
    setShowCheckIn(false)

    // The reminder timer stops by itself.
  }

  // ---- WHERE A TAPPED NOTIFICATION SHOULD LAND ----
  // The notification carries a short name rather than a function.
  function openFromNotification(action) {
    if (action === 'measure') {
      setShowCheckIn(false)
      setAskForMeasurements(true)
      setActiveTab('data')
      return
    }

    // 'checkin', and anything unrecognised.
    setShowCheckIn(true)
  }

  // Taps arriving while the app is running.
  useEffect(() => {
    return listenForNotificationClicks(openFromNotification)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Taps that STARTED the app.
  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get('open')
    if (!requested) return

    openFromNotification(requested)

    // Take it back out of the address bar.
    window.history.replaceState({}, '', window.location.pathname)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ---- THE DAILY REMINDERS ----
  // useEffect runs code AFTER the screen has been drawn.
  useEffect(() => {
    // No reminder set.
    if (!reminderTime) return

    // Is today one of the days the user picked on the Routine calendar?
    function isWorkoutToday() {
      return loadRoutineDays().includes(todayKey())
    }

    // 1.
    const stopReminder = startDailyReminder(reminderTime, () => {
      if (!isWorkoutToday()) return
      // ONCE A WEEK this one asks for measurements instead of nudging about exercise.
      if (isMeasurementDue()) {
        showNotification(
          'Weekly check-in: your measurements',
          'Tap to update your weight, height and age. It stays on your phone.',
          'measure',
        )
        return
      }

      showNotification(
        'Time to work out',
        'Today is one of your routine days. Your exercises are ready.',
        // Tapping it opens the check-in.
        'checkin',
      )
    })

    // 2.
    const stopFollowUp = startDailyReminder(addHours(reminderTime, 1), () => {
      if (!isWorkoutToday()) return

      // Skipped if they've already confirmed today. "Did you do it?" an hour after they said yes.
      if (isCheckedIn(todayKey())) return

      showNotification(
        'Did you complete your workout?',
        'Tap to tick off what you did — that is what adds a day to your streak.',
        'checkin',
      )
    })

    // Each startDailyReminder hands back a function that stops its timer.
    return () => {
      stopReminder()
      stopFollowUp()
    }
  }, [reminderTime])

  // ---- WHICH SCREEN TO SHOW ----
  // A small helper function that picks the right screen for the open tab.
  function renderScreen() {
    // The check-in wins over every tab.
    if (showCheckIn) {
      return (
        <CheckInScreen
          goal={goal}
          // The calendar days, so the streak knows which day should have come before this.
          scheduledDays={routineDays}
          onClose={() => setShowCheckIn(false)}
        />
      )
    }

    // "switch" compares activeTab against each "case" below, in order.
    switch (activeTab) {
      case 'home':
        return <HomeScreen />

      case 'goals':
        // goal={goal} and onSelectGoal={setGoal} are PROPS — values handed down to a child component.
        return (
          <GoalsScreen
            goal={goal}
            onSelectGoal={setGoal}
            onOpenRoutine={() => setActiveTab('routine')}
          />
        )

      case 'routine':
        return (
          <RoutineScreen
            routineDays={routineDays}
            onToggleDay={toggleDay}
            onSaveDays={saveRoutineDays}
            onReplaceDays={replaceDays}
            reminderTime={reminderTime}
            onSetTime={changeReminderTime}
          />
        )

      case 'data':
        return (
          <DataScreen
            goal={goal}
            openAdd={askForMeasurements}
            onAddOpened={() => setAskForMeasurements(false)}
          />
        )

      case 'settings':
        return <SettingsScreen onResetProgress={resetProgress} />

      // "default" runs when none of the cases above matched.
      default: {
        // .find() looks through the TABS list and returns the first entry whose id matches the open.
        const tab = TABS.find((item) => item.id === activeTab)
        return <ComingSoonScreen title={tab.label} />
      }
    }
  }

  // ---- WHAT GETS DRAWN ----
  // This HTML-looking code is JSX.
  return (
    <div className="phone">
      {/* Curly braces { } drop a JavaScript value into the layout. */}
      {renderScreen()}

      {/* The menu bar. */}
      <TabBar
        activeTab={activeTab}
        // Tapping any tab also closes the check-in.
        onSelect={(tabId) => {
          setShowCheckIn(false)
          setActiveTab(tabId)
        }}
      />
    </div>
  )
}

// "export default" makes App available to other files — main.jsx imports it.
export default App
