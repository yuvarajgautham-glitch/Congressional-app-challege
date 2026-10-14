// ComingSoonScreen.jsx — a placeholder for tabs with no real screen yet.

// One PROP: title — the heading to show, e.g. "Routine".
function ComingSoonScreen({ title }) {
  return (
    <main className="screen">
      {/* { title } drops in the text passed from App.jsx. */}
      <h1 className="title">{title}</h1>
      <div className="title-rule" />
      <p className="quote">Coming soon</p>
    </main>
  )
}

export default ComingSoonScreen
