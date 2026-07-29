// ============================================================================
// HomeScreen.jsx — the first screen you see: the welcome page.
//
// Built to match public/"Home page with buttons.jpg". Note that the bottom menu
// is NOT here — App.jsx adds that underneath every screen, so it only has to be
// written once.
// ============================================================================

// Styling used only by this screen. Styles shared with other screens (the
// heading, the black divider) live in App.css instead.
import './HomeScreen.css'

// This component takes no props — it always shows exactly the same thing.
function HomeScreen() {
  return (
    // <main> is the HTML tag for the main content of a page.
    // Two class names: "screen" is the shared layout every page uses,
    // "home-screen" is for anything specific to this page.
    <main className="screen home-screen">
      <h1 className="title">
        Welcome to
        {/* <br /> forces a line break so the title sits on two lines.
            Tags that hold no text close themselves with a slash, like this. */}
        <br />
        Active Living
      </h1>

      {/* An empty div used purely as a shape — the thick black lens-shaped
          line under the heading. It's drawn entirely in App.css. */}
      <div className="title-rule" />

      {/* The runner. There is no runner image file: HomeScreen.css crops the
          runner out of the big mock-up JPEG. Because it's a picture and not
          text, role="img" + aria-label describe it for screen readers. */}
      <div className="runner" role="img" aria-label="Silhouette of a runner" />

      {/* <blockquote> is the proper tag for a quotation.
          &quot; is the code for a " character. Typing a bare " here would
          confuse JSX, which uses quotes for its own attributes. */}
      <blockquote className="quote">
        &quot;Motivation is what gets you started.
        <br />
        Habit is what keeps you going.&quot; Jim Rohn
      </blockquote>
    </main>
  )
}

export default HomeScreen
