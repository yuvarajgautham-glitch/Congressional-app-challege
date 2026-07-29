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
import { useState } from 'react'

// Styles shared by every screen (the frame, headings, the menu bar).
import './App.css'

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

  // Which days on the Routine calendar have been ticked off, as a list of day
  // numbers — [] means none yet, [1, 2, 5] means days 1, 2 and 5 are done.
  // Kept here for the same reason as the goal above: so it survives tab changes.
  const [completedDays, setCompletedDays] = useState([])

  // ---- ACTIONS -------------------------------------------------------------
  // Ticks a calendar day off, or un-ticks it if it was already done.
  function toggleDay(day) {
    // Passing a FUNCTION to setCompletedDays hands us the up-to-date list as
    // "days", which is the safe way to change a value based on what it was.
    setCompletedDays((days) =>
      days.includes(day)
        ? // Already done → build a new list with this day filtered out.
          days.filter((finishedDay) => finishedDay !== day)
        : // Not done yet → build a new list: everything in the old one, plus
          // this day. The ... spreads the old list's items into the new one.
          [...days, day],
    )
    // Note that both branches create a BRAND NEW list rather than editing the
    // old one. React only notices a change when it's given a new value, so
    // adding to the existing list directly would leave the screen unchanged.
  }

  // ---- WHICH SCREEN TO SHOW ------------------------------------------------
  // A small helper function that picks the right screen for the open tab.
  function renderScreen() {
    // "switch" compares activeTab against each "case" below, in order.
    switch (activeTab) {
      case 'home':
        return <HomeScreen />

      case 'goals':
        // goal={goal} and onSelectGoal={setGoal} are PROPS — values handed down
        // to a child component. So GoalsScreen can see which goal is chosen,
        // and can ask us to change it. Data flows down, changes flow back up.
        return <GoalsScreen goal={goal} onSelectGoal={setGoal} />

      case 'routine':
        return (
          <RoutineScreen
            completedDays={completedDays}
            onToggleDay={toggleDay}
          />
        )

      case 'settings':
        return <SettingsScreen />

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
      <TabBar activeTab={activeTab} onSelect={setActiveTab} />
    </div>
  )
}

// "export default" makes App available to other files — main.jsx imports it.
export default App
