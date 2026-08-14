// ============================================================================
// App.jsx — the SHELL of the app.
//
// Think of the app as a picture frame:
//   - the top part swaps between screens (Home, Goals, ...)
//   - the bottom menu bar never changes
//
// This file's whole job is to remember which tab is open and show the matching
// screen above the menu. The screens themselves live in the pages/ folder.
// ============================================================================

// useState is a React "hook" — it lets a component REMEMBER something.
// useEffect is the hook for the other kind of job: reaching OUTSIDE React, to
// things like timers. The daily reminder below is exactly that.
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
import {
  startDailyReminder,
  showNotification,
  addHours,
} from './notifications'
import CheckInScreen from './pages/CheckInScreen'

// Our own building blocks. Each is a component that draws part of the app.
import TabBar from './components/TabBar'
import { TABS } from './components/tabs'
import HomeScreen from './pages/HomeScreen'
import GoalsScreen from './pages/GoalsScreen'
import RoutineScreen from './pages/RoutineScreen'
import SettingsScreen from './pages/SettingsScreen'
import ComingSoonScreen from './pages/ComingSoonScreen'

// A COMPONENT is just a function that returns what should appear on screen.
// Component names always start with a Capital letter — that's how React tells
// them apart from ordinary HTML tags like <div>.
function App() {
  // ---- STATE ---------------------------------------------------------------
  // useState('home') creates a piece of memory starting at the value 'home'.
  // It hands back two things:
  //   activeTab    → the value right now ('home', 'goals', ...)
  //   setActiveTab → the function you call to CHANGE that value
  //
  // The important part: whenever you call setActiveTab, React automatically
  // re-runs this component and redraws the screen. That is how clicking a menu
  // button changes the page — you never touch the HTML yourself.
  const [activeTab, setActiveTab] = useState('home')

  // Which goal the user picked ('lose', 'gain', or null for "none yet").
  // This lives HERE rather than inside GoalsScreen on purpose: GoalsScreen is
  // thrown away when you switch to another tab, and anything remembered inside
  // it would be lost. App stays alive the whole time, so the choice survives.
  const [goal, setGoal] = useState(null)

  // Which days on the Routine calendar the user plans to exercise, as a list of
  // date keys — [] means none yet, ["2026-08-13"] means that one date.
  //
  // Kept here for the same reason as the goal above, and it starts from storage
  // so a saved routine is still there after closing the app. The arrow means
  // "work this out once, on the first render" — without it, loadRoutineDays()
  // would run on every single redraw.
  const [routineDays, setRoutineDays] = useState(() => loadRoutineDays())

  // The daily reminder time as text, e.g. "07:30". '' means no reminder.
  // This lives here rather than on the reminder screen because the timer below
  // has to keep running whichever tab is open.
  const [reminderTime, setReminderTime] = useState(() => loadReminderTime())

  // Whether the check-in is open. It's opened by tapping a reminder
  // notification, and it covers whichever tab is showing — a notification
  // shouldn't quietly change which tab the user was on.
  const [showCheckIn, setShowCheckIn] = useState(false)

  // ---- ACTIONS -------------------------------------------------------------
  // Picks a calendar date, or un-picks it if it was already chosen. The date
  // arrives as a key like "2026-08-13".
  function toggleDay(dateKey) {
    // Passing a FUNCTION to setRoutineDays hands us the up-to-date list as
    // "days", which is the safe way to change a value based on what it was.
    setRoutineDays((days) =>
      days.includes(dateKey)
        ? // Already chosen → build a new list with this date filtered out.
          days.filter((chosenDay) => chosenDay !== dateKey)
        : // Not chosen yet → build a new list: everything in the old one, plus
          // this date. The ... spreads the old list's items into the new one.
          [...days, dateKey],
    )
    // Note that both branches create a BRAND NEW list rather than editing the
    // old one. React only notices a change when it's given a new value, so
    // adding to the existing list directly would leave the screen unchanged.
  }

  // Swaps the whole list of chosen dates at once. "Repeat weekly" uses this,
  // and so does undoing it — both replace the list wholesale rather than
  // toggling dates one at a time.
  //
  // It saves as well as setting, because these changes come from a screen with
  // no Save button of its own: what the user sees on the calendar afterwards
  // has to be what's actually stored.
  function replaceDays(days) {
    setRoutineDays(days)
    saveRoutineDays(days)
  }

  // Changes the reminder time, and writes it to storage so it survives a
  // reload. Two jobs on every change, as with the account in AccountInfoScreen:
  // state is the app's memory for this visit, storage its memory between them.
  function changeReminderTime(time) {
    setReminderTime(time)
    saveReminderTime(time)
  }

  // Wipes everything the user has DONE in the app, and nothing they've been
  // ASKED. So the goal, the calendar, the reminder and every ticked exercise
  // go; the account details filled in under Account info stay exactly as they
  // are, and so does being signed in.
  //
  // It has to happen in two places, as ever: the state, so the screens redraw
  // empty straight away, and storage, so it's still empty next time the app
  // opens. Doing only the first would look like it worked until a reload.
  function resetProgress() {
    setGoal(null)
    setRoutineDays([])
    setReminderTime('')

    clearRoutine()
    clearExercisePlans()
    clearStreak()

    // The check-in is closed too, in case it happens to be open — it would
    // otherwise sit there showing a streak that no longer exists.
    setShowCheckIn(false)

    // The reminder timer stops by itself: setReminderTime('') changes the value
    // the effect below watches, so React runs its clean-up. That's the payoff
    // for returning a stop function from the effect rather than leaving the
    // timer running loose.
  }

  // ---- THE DAILY REMINDERS -------------------------------------------------
  // useEffect runs code AFTER the screen has been drawn, and is the right place
  // for anything outside React's own world — here, two timers.
  //
  // The [reminderTime] at the end is the dependency list: "re-run this whenever
  // reminderTime changes, and not otherwise". Without it this would set up
  // fresh timers on every single redraw.
  useEffect(() => {
    // No reminder set. Returning early leaves no timers running.
    if (!reminderTime) return

    // 1. The reminder itself, at the time the user chose.
    const stopReminder = startDailyReminder(reminderTime, () =>
      showNotification(
        'Time to get moving',
        'Your exercise routine is waiting in Active Living.',
        // Tapping it opens the check-in. Someone who exercises first and taps
        // afterwards lands exactly where they need to be.
        () => setShowCheckIn(true),
      ),
    )

    // 2. The follow-up, an hour later, asking whether they actually did it.
    const stopFollowUp = startDailyReminder(addHours(reminderTime, 1), () => {
      // Skipped if they've already confirmed today. "Did you do it?" an hour
      // after they said yes reads like the app wasn't listening.
      if (isCheckedIn(todayKey())) return

      showNotification(
        'Did you get your exercise in?',
        'Tap to tick off what you did and keep your streak going.',
        () => setShowCheckIn(true),
      )
    })

    // Each startDailyReminder hands back a function that stops its timer.
    // RETURNING a clean-up from useEffect is what tells React to run it before
    // re-running, and when the app closes. Skip this and every change of time
    // would leave the old timers running alongside the new ones.
    return () => {
      stopReminder()
      stopFollowUp()
    }
  }, [reminderTime])

  // ---- WHICH SCREEN TO SHOW ------------------------------------------------
  // A small helper function that picks the right screen for the open tab.
  function renderScreen() {
    // The check-in wins over every tab, because it's what the user just tapped
    // a notification to reach. Closing it puts the tab underneath back.
    if (showCheckIn) {
      return (
        <CheckInScreen goal={goal} onClose={() => setShowCheckIn(false)} />
      )
    }

    // "switch" compares activeTab against each "case" below, in order.
    switch (activeTab) {
      case 'home':
        return <HomeScreen />

      case 'goals':
        // goal={goal} and onSelectGoal={setGoal} are PROPS — values handed down
        // to a child component. So GoalsScreen can see which goal is chosen,
        // and can ask us to change it. Data flows down, changes flow back up.
        //
        // onOpenRoutine is the same idea applied to the tabs. Saving an
        // exercise plan should take the user straight to Routine, but only this
        // file knows which tab is open — so instead of Goals reaching in and
        // changing that itself, we hand it a function that does the one thing
        // it's allowed to ask for. A child asking a parent to act, rather than
        // acting on the parent, is what keeps the tab in one place.
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

      case 'settings':
        return <SettingsScreen onResetProgress={resetProgress} />

      // "default" runs when none of the cases above matched. All four tabs now
      // have real screens, so this is only a safety net: if you add a fifth tab
      // to tabs.js and forget to add a "case" for it here, you get a tidy
      // placeholder instead of a blank screen.
      default: {
        // .find() looks through the TABS list and returns the first entry whose
        // id matches the open tab, so we can show its name as the heading.
        const tab = TABS.find((item) => item.id === activeTab)
        return <ComingSoonScreen title={tab.label} />
      }
    }
  }

  // ---- WHAT GETS DRAWN -----------------------------------------------------
  // This HTML-looking code is JSX. It is not really HTML — it's JavaScript that
  // React turns into real page elements. Note "className" instead of "class".
  return (
    <div className="phone">
      {/* Curly braces { } drop a JavaScript value into the layout. Here we call
          the helper above, and whatever screen it returns gets shown. */}
      {renderScreen()}

      {/* The menu bar. We tell it which tab is active so it can highlight that
          button, and we hand it setActiveTab so a tap can switch screens. */}
      <TabBar
        activeTab={activeTab}
        // Tapping any tab also closes the check-in. Without this, the menu
        // would look like it had stopped working while the check-in was open.
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
