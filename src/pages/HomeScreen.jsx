// HomeScreen.jsx — the first screen you see: the welcome page.

// Styling used only by this screen.
import './HomeScreen.css'

// This component takes no props — it always shows exactly the same thing.
function HomeScreen() {
  return (
    // <main> is the HTML tag for the main content of a page.
    <main className="screen home-screen">
      <h1 className="title">
        Welcome to
        {/* <br /> forces a line break so the title sits on two lines. */}
        <br />
        Active Living
      </h1>

      {/* An empty div used purely as a shape — the thick black lens-shaped line under the heading. */}
      <div className="title-rule" />

      {/* The runner. */}
      <div className="runner" role="img" aria-label="Silhouette of a runner" />

      {/* <blockquote> is the proper tag for a quotation. &quot. */}
      <blockquote className="quote">
        &quot;Motivation is what gets you started.
        <br />
        Habit is what keeps you going.&quot; Jim Rohn
      </blockquote>
    </main>
  )
}

export default HomeScreen
