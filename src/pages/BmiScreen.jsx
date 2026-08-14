// ============================================================================
// BmiScreen.jsx — Settings › Your BMI.
//
// Nothing is typed in here. The screen reads the account that was filled in
// under Settings › Account info, works out the BMI from the height and weight
// already given, and shows where that number sits on the standard scale.
//
// If there's no account yet there's nothing to calculate, so the screen says so
// rather than showing a made-up number.
// ============================================================================

import { loadAccount } from '../accountStorage'
import './BmiScreen.css'

// The four standard adult BMI bands, in order.
//
// "max" is where each band ENDS. The last one has no end, so it's Infinity — a
// real number in JavaScript that nothing is ever bigger than. That saves the
// code below from a special case for the top band.
//
// The bar at the bottom of the screen is drawn from this same list, so adding
// or renaming a band changes both the wording and the picture at once.
const BANDS = [
  { id: 'under', label: 'Underweight', max: 18.5 },
  { id: 'healthy', label: 'Healthy weight', max: 25 },
  { id: 'over', label: 'Overweight', max: 30 },
  { id: 'obese', label: 'Obesity', max: Infinity },
]

// Where the drawn bar starts and stops. BMI has no real upper limit, but a bar
// running to infinity can't be drawn, so we show the part people actually land
// in and pin anything beyond it to the ends.
const SCALE_MIN = 15
const SCALE_MAX = 40

// A sentence for each band. Kept apart from BANDS because this is wording, not
// arithmetic — easier to reword without touching the numbers.
const ADVICE = {
  under: 'This is below the usual healthy range. Eating a little more, and building strength, is usually the goal here.',
  healthy: 'This is inside the usual healthy range. Keeping your routine going is what keeps it there.',
  over: 'This is a little above the usual healthy range. Regular movement and steady habits are what shift it.',
  obese: 'This is above the usual healthy range. Small, repeatable changes work far better than sudden ones.',
}

// ---- The maths -------------------------------------------------------------
// Pulled out of the component on purpose: it's a plain calculation with no
// screen involved, so it's easier to read — and to check by hand — on its own.

// The imperial BMI formula: 703 × pounds ÷ (inches × inches).
// The 703 is just the number that converts pounds-and-inches into the metric
// kg/m² the scale is actually defined in.
function calculateBmi(account) {
  const totalInches = account.heightFeet * 12 + account.heightInches

  // Guard against dividing by zero. It can't normally happen — the registration
  // form insists on at least 1 foot — but a divide by zero gives Infinity
  // rather than an error, and a silently wrong number is the worst kind.
  if (!totalInches) return null

  return (703 * account.weight) / (totalInches * totalInches)
}

// Finds which band a BMI falls into. .find() returns the FIRST match, and the
// bands are in ascending order, so "the first band this number is below" is
// exactly the band it belongs to.
function findBand(bmi) {
  return BANDS.find((band) => bmi < band.max)
}

// PROPS:
//   onBack → returns to the Settings list (SettingsScreen passes this in)
function BmiScreen({ onBack }) {
  // Read straight from storage rather than keeping this in state. There's
  // nothing on this screen that changes it, so state would only add a copy that
  // could fall out of date.
  const account = loadAccount()

  const bmi = account ? calculateBmi(account) : null

  // ---- Nothing to calculate from -------------------------------------------
  // Handled first and returned early, so everything below can assume the
  // numbers exist. Checking for the awkward case up front keeps the main path
  // clear of "if it exists" clutter.
  if (!bmi) {
    return (
      <main className="screen bmi-screen">
        <h1 className="title bmi-title">Your BMI</h1>
        <div className="title-rule" />

        <p className="quote">
          Fill in your details under Account info and your BMI will appear here.
        </p>

        <button type="button" className="back-button" onClick={onBack}>
          <span className="back-arrow" aria-hidden="true">
            &#8249;
          </span>
          Back
        </button>
      </main>
    )
  }

  const band = findBand(bmi)

  // How far along the bar the marker sits, as a percentage.
  //
  // Math.min and Math.max together are the usual way to "clamp" a number: pin
  // anything under 15 to the left end and anything over 40 to the right end, so
  // an off-the-scale BMI still shows a marker instead of floating off-screen.
  const clamped = Math.min(Math.max(bmi, SCALE_MIN), SCALE_MAX)
  const markerPercent =
    ((clamped - SCALE_MIN) / (SCALE_MAX - SCALE_MIN)) * 100

  // .toFixed(1) rounds to one decimal place and gives back TEXT — "23.4". One
  // decimal is the convention for BMI; more would imply a precision that a
  // self-reported height and weight simply don't have.
  const bmiText = bmi.toFixed(1)

  return (
    <main className="screen bmi-screen">
      <h1 className="title bmi-title">Your BMI</h1>
      <div className="title-rule" />

      {/* ---- The number itself ---- */}
      <div className="bmi-result">
        <p className="bmi-number">{bmiText}</p>
        <p className="bmi-band">{band.label}</p>
      </div>

      {/* ---- The scale ----
          A bar split into the four bands, with a marker showing where this BMI
          lands. The whole thing is hidden from screen readers, because the two
          lines above already say the number and the band in words — a screen
          reader has no use for the picture. */}
      <div className="bmi-scale" aria-hidden="true">
        <div className="bmi-bar">
          {BANDS.map((bandItem, index) => {
            // Each segment's share of the bar is its own width divided by the
            // width of the whole scale. The first band starts at SCALE_MIN, and
            // the last one stops at SCALE_MAX rather than running to Infinity.
            const start = index === 0 ? SCALE_MIN : BANDS[index - 1].max
            const end = Math.min(bandItem.max, SCALE_MAX)
            const width = ((end - start) / (SCALE_MAX - SCALE_MIN)) * 100

            return (
              <div
                key={bandItem.id}
                // Two class names: one shared by every segment, one naming this
                // particular band so the CSS can shade them differently.
                className={`bmi-segment bmi-segment-${bandItem.id}`}
                // A style set from a calculation has to be written inline like
                // this — a CSS file can't know the numbers. In React, style
                // takes an OBJECT, which is why there are two sets of braces.
                style={{ width: `${width}%` }}
              />
            )
          })}

          {/* The pointer. left: positions it along the bar, and the CSS shifts
              it half its own width back so it's centred on the spot. */}
          <div className="bmi-marker" style={{ left: `${markerPercent}%` }} />
        </div>

        {/* The numbers under the bar, at the points where the bands change. */}
        <div className="bmi-ticks">
          <span>{SCALE_MIN}</span>
          <span>18.5</span>
          <span>25</span>
          <span>30</span>
          <span>{SCALE_MAX}+</span>
        </div>
      </div>

      {/* ---- What it was worked out from ----
          Showing the inputs matters: if the number looks wrong, the user can
          see straight away that it's their height or weight that needs fixing,
          not the app. */}
      <dl className="detail-list bmi-inputs">
        <dt className="detail-term">Height</dt>
        <dd className="detail-value">
          {`${account.heightFeet}' ${account.heightInches}"`}
        </dd>

        <dt className="detail-term">Weight</dt>
        <dd className="detail-value">{`${account.weight} lb`}</dd>

        <dt className="detail-term">Age</dt>
        <dd className="detail-value">{account.age}</dd>
      </dl>

      <p className="bmi-advice">{ADVICE[band.id]}</p>

      {/* Two honest caveats. BMI is a rough screening number, not a diagnosis,
          and under 20 it isn't read on this scale at all — young people are
          compared against others their own age instead, which needs a chart
          this app doesn't have. Saying so is better than quietly showing a
          number that doesn't mean what it appears to. */}
      <p className="form-note">
        {account.age < 20
          ? 'Under 20, BMI is read against others the same age and sex, so this adult scale is only a rough guide. BMI also says nothing about muscle — talk to a doctor about what your number means for you.'
          : 'BMI is a rough screening number. It says nothing about muscle, build or general health, so talk to a doctor about what your number means for you.'}
      </p>

      <button type="button" className="back-button" onClick={onBack}>
        <span className="back-arrow" aria-hidden="true">
          &#8249;
        </span>
        Back
      </button>
    </main>
  )
}

export default BmiScreen
