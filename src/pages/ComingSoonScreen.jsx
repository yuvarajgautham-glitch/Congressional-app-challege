// ============================================================================
// ComingSoonScreen.jsx — a placeholder for tabs with no real screen yet.
//
// All four menu tabs now have proper screens, so nothing reaches this at the
// moment. It stays as a safety net: it's what the "default" branch in App.jsx
// falls back to, so adding a fifth tab to tabs.js and forgetting to give it a
// screen shows this tidy placeholder rather than a blank page.
//
// TO USE IT FOR A NEW TAB: build a real page (copy GoalsScreen.jsx as a
// starting point), then add a "case" for that tab in the switch in App.jsx.
// ============================================================================

// One PROP: title — the heading to show, e.g. "Routine". App.jsx passes in the
// name of whichever tab was tapped, so this one file covers both empty tabs.
function ComingSoonScreen({ title }) {
  return (
    <main className="screen">
      {/* { title } drops in the text passed from App.jsx. Swapping the value in
          the props changes the heading without touching this file. */}
      <h1 className="title">{title}</h1>
      <div className="title-rule" />
      <p className="quote">Coming soon</p>
    </main>
  )
}

export default ComingSoonScreen
