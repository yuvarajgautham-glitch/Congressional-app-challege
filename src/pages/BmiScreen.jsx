// BmiScreen.jsx — Settings › Your BMI.

import { loadAccount } from '../accountStorage'
import './BmiScreen.css'

// The four standard adult BMI bands, in order.
const BANDS = [
  { id: 'under', label: 'Underweight', max: 18.5 },
  { id: 'healthy', label: 'Healthy weight', max: 25 },
  { id: 'over', label: 'Overweight', max: 30 },
  { id: 'obese', label: 'Obesity', max: Infinity },
]

// Where the drawn bar starts and stops.
const SCALE_MIN = 15
const SCALE_MAX = 40

// A sentence for each band.
const ADVICE = {
  under: 'This is below the usual healthy range. Eating a little more, and building strength, is usually the goal here.',
  healthy: 'This is inside the usual healthy range. Keeping your routine going is what keeps it there.',
  over: 'This is a little above the usual healthy range. Regular movement and steady habits are what shift it.',
  obese: 'This is above the usual healthy range. Small, repeatable changes work far better than sudden ones.',
}

// ---- The maths ----
// Pulled out of the component on purpose: it's a plain calculation with no screen involved.

// The imperial BMI formula: 703 × pounds ÷ (inches × inches).
function calculateBmi(account) {
  const totalInches = account.heightFeet * 12 + account.heightInches

  // Guard against dividing by zero.
  if (!totalInches) return null

  return (703 * account.weight) / (totalInches * totalInches)
}

// Finds which band a BMI falls into. .find() returns the FIRST match.
function findBand(bmi) {
  return BANDS.find((band) => bmi < band.max)
}

// PROPS: onBack → returns to the Settings list (SettingsScreen passes this in).
function BmiScreen({ onBack }) {
  // Read straight from storage rather than keeping this in state.
  const account = loadAccount()

  const bmi = account ? calculateBmi(account) : null

  // ---- Nothing to calculate from ----
  // Handled first and returned early, so everything below can assume the numbers exist.
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
  const clamped = Math.min(Math.max(bmi, SCALE_MIN), SCALE_MAX)
  const markerPercent =
    ((clamped - SCALE_MIN) / (SCALE_MAX - SCALE_MIN)) * 100

  // .toFixed(1) rounds to one decimal place and gives back TEXT — "23.4".
  const bmiText = bmi.toFixed(1)

  return (
    <main className="screen bmi-screen">
      <h1 className="title bmi-title">Your BMI</h1>
      <div className="title-rule" />

      {/* The number itself. */}
      <div className="bmi-result">
        <p className="bmi-number">{bmiText}</p>
        <p className="bmi-band">{band.label}</p>
      </div>

      {/* The scale A bar split into the four bands, with a marker showing where this BMI lands. */}
      <div className="bmi-scale" aria-hidden="true">
        <div className="bmi-bar">
          {BANDS.map((bandItem, index) => {
            // Each segment's share of the bar is its own width divided by the width of the whole scale.
            const start = index === 0 ? SCALE_MIN : BANDS[index - 1].max
            const end = Math.min(bandItem.max, SCALE_MAX)
            const width = ((end - start) / (SCALE_MAX - SCALE_MIN)) * 100

            return (
              <div
                key={bandItem.id}
                // Two class names: one shared by every segment.
                className={`bmi-segment bmi-segment-${bandItem.id}`}
                // A style set from a calculation has to be written inline like.
                style={{ width: `${width}%` }}
              />
            )
          })}

          {/* The pointer. left: positions it along the bar. */}
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

      {/* What it was worked out from Showing the inputs matters: if the number looks wrong. */}
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

      {/* Two honest caveats. */}
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
