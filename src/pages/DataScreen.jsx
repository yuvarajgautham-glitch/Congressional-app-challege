// ============================================================================
// DataScreen.jsx — the "Your data" tab.
//
// Two views in one screen:
//
//   graph → a line of every reading you've saved, plus what it adds up to
//   add   → the weekly form asking weight, height and age
//
// The first reminder of each week opens this straight into the "add" view; the
// rest of the week the tab opens on the graph.
//
// Everything here stays on the phone. The graph is drawn by hand in SVG rather
// than with a charting library — partly because a library would be far larger
// than this whole app, and partly because it would be the one piece of code in
// the project nobody could read.
// ============================================================================

import { useState, useEffect } from 'react'
import { todayKey, formatShortDate } from '../dates'
import {
  loadMeasurements,
  addMeasurement,
  latestMeasurement,
} from '../measurementsStorage'
import { loadAccount, saveAccount } from '../accountStorage'
import './DataScreen.css'

// The two things that can be plotted. Only ONE is ever drawn at a time — a
// chart with two different scales up the side is genuinely misleading, because
// the crossing point of the two lines means nothing at all.
const SERIES = [
  { id: 'weight', label: 'Weight', unit: 'lb' },
  { id: 'bmi', label: 'BMI', unit: '' },
]

// The drawing area, in SVG units. The picture scales to whatever width the
// phone has; these numbers only set the SHAPE.
const W = 320
const H = 180
const PAD_LEFT = 34
const PAD_RIGHT = 12
const PAD_TOP = 14
const PAD_BOTTOM = 26

// BMI from one reading: 703 × pounds ÷ inches². Same formula as Your BMI —
// see BmiScreen.jsx for where the 703 comes from.
function bmiOf(entry) {
  const inches = entry.heightFeet * 12 + entry.heightInches
  if (!inches) return null
  return (703 * entry.weight) / (inches * inches)
}

// Pulls the numbers to plot out of the saved readings.
function valuesFor(entries, seriesId) {
  return entries.map((entry) =>
    seriesId === 'bmi' ? bmiOf(entry) : entry.weight,
  )
}

// PROPS from App.jsx:
//   goal        → the chosen goal, so the summary can say whether the change
//                 is the direction the user actually wanted
//   openAdd     → true when a notification asked for this week's measurements
//   onAddOpened → clears that request once it's been acted on
function DataScreen({ goal, openAdd, onAddOpened }) {
  const [entries, setEntries] = useState(() => loadMeasurements())
  const [seriesId, setSeriesId] = useState('weight')

  // Which point on the graph is selected. A phone has no hover, so tapping a
  // reading is how you find out what it says — null means none picked.
  const [picked, setPicked] = useState(null)

  const [view, setView] = useState(openAdd ? 'add' : 'graph')

  // If a notification arrives while this tab is already open, the component
  // isn't rebuilt, so the starting value above never runs again. This catches
  // that case.
  useEffect(() => {
    if (openAdd) {
      setView('add')
      onAddOpened()
    }
  }, [openAdd, onAddOpened])

  // ---- The weekly form -----------------------------------------------------
  if (view === 'add') {
    return (
      <MeasurementForm
        onSave={(entry) => {
          setEntries(addMeasurement(entry))
          setPicked(null)
          setView('graph')
        }}
        onCancel={() => setView('graph')}
      />
    )
  }

  // ---- Nothing recorded yet ------------------------------------------------
  if (entries.length === 0) {
    return (
      <main className="screen data-screen">
        <h1 className="title data-title">Your data</h1>
        <div className="title-rule" />

        <p className="quote">
          Save your first measurement and your progress will appear here.
        </p>

        <button
          type="button"
          className="primary-button data-add"
          onClick={() => setView('add')}
        >
          Add a measurement
        </button>
      </main>
    )
  }

  const series = SERIES.find((item) => item.id === seriesId)
  const values = valuesFor(entries, seriesId)

  // ---- Working out the shape of the line -----------------------------------
  const lowest = Math.min(...values)
  const highest = Math.max(...values)

  // A flat line would divide by zero below, so a single value gets a small
  // range invented around it. That draws it across the middle of the box,
  // which is the honest picture of "this hasn't changed".
  const span = highest - lowest || 2
  const low = highest === lowest ? lowest - 1 : lowest
  const plotW = W - PAD_LEFT - PAD_RIGHT
  const plotH = H - PAD_TOP - PAD_BOTTOM

  // Where one reading sits in the box.
  function xOf(index) {
    // One reading alone goes in the middle rather than hard against the left.
    if (entries.length === 1) return PAD_LEFT + plotW / 2
    return PAD_LEFT + (index / (entries.length - 1)) * plotW
  }

  function yOf(value) {
    // SVG counts y DOWNWARDS from the top, so the sum is flipped: the biggest
    // value has to come out with the smallest y to appear at the top.
    return PAD_TOP + (1 - (value - low) / span) * plotH
  }

  // "x,y x,y x,y" — the format an SVG polyline wants.
  const linePoints = values
    .map((value, index) => `${xOf(index)},${yOf(value)}`)
    .join(' ')

  // ---- What it adds up to --------------------------------------------------
  const first = values[0]
  const last = values[values.length - 1]
  const change = last - first

  // Which way the user WANTED it to go, so "down 4 lb" can be reported as
  // progress or as drift rather than left for them to work out.
  const wanted = goal === 'lose' ? -1 : goal === 'gain' ? 1 : 0

  // A little movement either way is normal — water, food, time of day — so
  // nothing under half a unit is called a change at all.
  const flat = Math.abs(change) < 0.5
  const onTrack = wanted === 0 ? flat : Math.sign(change) === wanted

  return (
    <main className="screen data-screen">
      <h1 className="title data-title">Your data</h1>
      <div className="title-rule" />

      {/* ---- Which measure to plot ----
          Switching redraws the same shape with a different scale. The two are
          never drawn together: see the note on SERIES above. */}
      <div className="series-switch" role="group" aria-label="What to show">
        {SERIES.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`series-button${
              item.id === seriesId ? ' is-chosen' : ''
            }`}
            aria-pressed={item.id === seriesId}
            onClick={() => {
              setSeriesId(item.id)
              setPicked(null)
            }}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* ---- The graph ---- */}
      <div className="chart-card">
        <p className="chart-title">
          {/* One line, so no key is needed — the title says what it is. */}
          {series.unit ? `${series.label} (${series.unit})` : series.label}
        </p>

        <svg
          className="chart"
          viewBox={`0 0 ${W} ${H}`}
          // The picture is described in words underneath instead, for anyone
          // using a screen reader. The table below carries the actual numbers.
          role="img"
          aria-label={`${series.label} over time, ${entries.length} readings from ${formatShortDate(entries[0].date)} to ${formatShortDate(entries[entries.length - 1].date)}`}
        >
          {/* Grid lines: three, at the bottom, middle and top of the range.
              Deliberately faint — they are there to be measured against, not
              looked at. */}
          {[0, 0.5, 1].map((fraction) => {
            const value = low + span * fraction
            const y = yOf(value)

            return (
              <g key={fraction}>
                <line
                  x1={PAD_LEFT}
                  y1={y}
                  x2={W - PAD_RIGHT}
                  y2={y}
                  className="chart-grid"
                />
                <text x={PAD_LEFT - 6} y={y + 3} className="chart-axis-label">
                  {/* Whole numbers for weight, one decimal for BMI, which
                      moves in much smaller steps. */}
                  {seriesId === 'bmi' ? value.toFixed(1) : Math.round(value)}
                </text>
              </g>
            )
          })}

          {/* The line itself. vector-effect keeps it exactly 2px however far
              the picture is stretched — without it, the stroke would scale with
              the box and come out fat on a big screen. */}
          <polyline points={linePoints} className="chart-line" />

          {/* One dot per reading, each with a much bigger invisible circle
              behind it so it can actually be hit with a thumb. */}
          {values.map((value, index) => (
            <g key={entries[index].date}>
              <circle
                cx={xOf(index)}
                cy={yOf(value)}
                r={picked === index ? 6 : 4}
                className="chart-dot"
              />
              <circle
                cx={xOf(index)}
                cy={yOf(value)}
                r={16}
                className="chart-hit"
                onClick={() => setPicked(picked === index ? null : index)}
              />
            </g>
          ))}

          {/* The dates at either end. Every date would collide once there are
              more than a handful of readings. */}
          <text x={PAD_LEFT} y={H - 8} className="chart-axis-label chart-start">
            {formatShortDate(entries[0].date)}
          </text>
          <text
            x={W - PAD_RIGHT}
            y={H - 8}
            className="chart-axis-label chart-end"
          >
            {formatShortDate(entries[entries.length - 1].date)}
          </text>
        </svg>

        {/* What the tapped point says. It sits in a fixed slot so the card
            doesn't jump taller as you tap around it. */}
        <p className="chart-readout">
          {picked === null
            ? 'Tap a point to see its reading.'
            : `${formatShortDate(entries[picked].date)} — ${
                seriesId === 'bmi'
                  ? values[picked].toFixed(1)
                  : `${values[picked]} lb`
              }`}
        </p>
      </div>

      {/* ---- The summary ---- */}
      <div className="data-summary">
        <p className="data-change">
          {flat
            ? `Holding steady at ${seriesId === 'bmi' ? last.toFixed(1) : `${last} lb`}`
            : `${change > 0 ? 'Up' : 'Down'} ${
                seriesId === 'bmi'
                  ? Math.abs(change).toFixed(1)
                  : `${Math.abs(change).toFixed(1)} lb`
              } since ${formatShortDate(entries[0].date)}`}
        </p>

        {/* Only said when there's a goal to judge it against. Without one there
            is no such thing as the right direction. */}
        {goal && (
          <p className="data-verdict">
            {onTrack
              ? 'That is the direction you were going for.'
              : 'That is not the direction you were going for — worth a look at your routine.'}
          </p>
        )}
      </div>

      {/* ---- The readings in words ----
          A graph is a picture, and a picture is no use to someone using a
          screen reader, or to anyone who wants the actual number. */}
      <details className="data-table">
        <summary className="data-table-summary">
          {`All ${entries.length} readings`}
        </summary>
        <ul className="data-list">
          {[...entries].reverse().map((entry) => (
            <li key={entry.date} className="data-row">
              <span className="data-row-date">
                {formatShortDate(entry.date)}
              </span>
              <span className="data-row-value">
                {`${entry.weight} lb · ${entry.heightFeet}' ${entry.heightInches}" · BMI ${bmiOf(entry).toFixed(1)}`}
              </span>
            </li>
          ))}
        </ul>
      </details>

      <button
        type="button"
        className="primary-button data-add"
        onClick={() => setView('add')}
      >
        Add a measurement
      </button>
    </main>
  )
}

// ============================================================================
// The weekly form. Kept in this file because it is only ever used here, and
// splitting it out would mean jumping between two files to follow one screen.
// ============================================================================
function MeasurementForm({ onSave, onCancel }) {
  // Starts from the last reading, or from the account if this is the first
  // time. Most weeks nothing but the weight has changed, so pre-filling turns
  // this into one number to check rather than four to re-enter.
  const previous = latestMeasurement() || loadAccount()

  const [weight, setWeight] = useState(() =>
    previous ? String(previous.weight) : '',
  )
  const [heightFeet, setHeightFeet] = useState(() =>
    previous ? String(previous.heightFeet) : '',
  )
  const [heightInches, setHeightInches] = useState(() =>
    previous ? String(previous.heightInches) : '',
  )
  const [age, setAge] = useState(() => (previous ? String(previous.age) : ''))

  const [error, setError] = useState('')

  function handleSubmit(event) {
    event.preventDefault()

    // Everything from a form arrives as text, so it has to be converted before
    // it can be compared or plotted.
    const weightNumber = Number(weight)
    const feetNumber = Number(heightFeet)
    const inchesNumber = heightInches === '' ? 0 : Number(heightInches)
    const ageNumber = Number(age)

    // The same ranges the registration form uses. Checking again here matters:
    // a typo of 1600 lb would not just be wrong, it would flatten the whole
    // graph into a line along the bottom.
    if (!Number.isFinite(weightNumber) || weightNumber < 20 || weightNumber > 1000) {
      setError('Please enter a weight in pounds between 20 and 1000.')
      return
    }

    if (!Number.isFinite(feetNumber) || feetNumber < 1 || feetNumber > 8) {
      setError('Please enter a height in feet between 1 and 8.')
      return
    }

    if (!Number.isFinite(inchesNumber) || inchesNumber < 0 || inchesNumber > 11) {
      setError('Inches must be between 0 and 11.')
      return
    }

    if (!Number.isFinite(ageNumber) || ageNumber < 5 || ageNumber > 120) {
      setError('Please enter an age between 5 and 120.')
      return
    }

    const entry = {
      date: todayKey(),
      weight: weightNumber,
      heightFeet: feetNumber,
      heightInches: inchesNumber,
      age: ageNumber,
    }

    // The account is updated to match, so Account info and Your BMI show these
    // figures too rather than whatever was typed at sign-up months ago.
    const account = loadAccount()
    if (account) {
      saveAccount({
        ...account,
        weight: weightNumber,
        heightFeet: feetNumber,
        heightInches: inchesNumber,
        age: ageNumber,
      })
    }

    onSave(entry)
  }

  return (
    <main className="screen data-screen">
      <h1 className="title data-title">This week</h1>
      <div className="title-rule" />

      <p className="data-intro">
        Four numbers, once a week. They stay on your phone and are never sent
        anywhere.
      </p>

      <form className="account-form" onSubmit={handleSubmit}>
        <label className="field-label" htmlFor="measure-weight">
          Weight
        </label>
        <div className="field-part">
          <input
            id="measure-weight"
            className="field-input"
            type="number"
            min="20"
            max="1000"
            value={weight}
            onChange={(event) => setWeight(event.target.value)}
          />
          <span className="field-unit">pounds</span>
        </div>

        <label className="field-label" htmlFor="measure-height-feet">
          Height
        </label>
        <div className="field-row">
          <div className="field-part">
            <input
              id="measure-height-feet"
              className="field-input"
              type="number"
              min="1"
              max="8"
              value={heightFeet}
              onChange={(event) => setHeightFeet(event.target.value)}
            />
            <span className="field-unit">feet</span>
          </div>

          <div className="field-part">
            <input
              id="measure-height-inches"
              className="field-input"
              type="number"
              min="0"
              max="11"
              value={heightInches}
              onChange={(event) => setHeightInches(event.target.value)}
              aria-label="Height in inches"
            />
            <span className="field-unit">inches</span>
          </div>
        </div>

        <label className="field-label" htmlFor="measure-age">
          Age
        </label>
        <input
          id="measure-age"
          className="field-input"
          type="number"
          min="5"
          max="120"
          value={age}
          onChange={(event) => setAge(event.target.value)}
        />

        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}

        <div className="form-buttons">
          <button type="submit" className="primary-button">
            Save
          </button>
          <button type="button" className="ghost-button" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </form>
    </main>
  )
}

export default DataScreen
