// DataScreen.jsx — the "Your data" tab.

import { useState, useEffect } from 'react'
import { todayKey, formatShortDate, formatLongDate } from '../dates'
import {
  loadMeasurements,
  addMeasurement,
  latestMeasurement,
  measurementFor,
} from '../measurementsStorage'
import { loadAccount, saveAccount } from '../accountStorage'
import './DataScreen.css'

// The two things that can be plotted.
const MEALS = [
  { id: 'breakfast', label: 'Breakfast' },
  { id: 'lunch', label: 'Lunch' },
  { id: 'dinner', label: 'Dinner' },
]

const SERIES = [
  { id: 'weight', label: 'Weight', unit: 'lb' },
  { id: 'bmi', label: 'BMI', unit: '' },
]

// The drawing area, in SVG units.
const W = 320
const H = 180
const PAD_LEFT = 34
const PAD_RIGHT = 12
const PAD_TOP = 14
const PAD_BOTTOM = 26

// BMI from one reading: 703 × pounds ÷ inches².
function bmiOf(entry) {
  const inches = entry.heightFeet * 12 + entry.heightInches
  if (!inches) return null
  return (703 * entry.weight) / (inches * inches)
}

// One meal from a reading, as text.
function mealAt(entry, which) {
  return (entry && entry.meals && entry.meals[which]) || ''
}

// Pulls the numbers to plot out of the saved readings.
function valuesFor(entries, seriesId) {
  return entries.map((entry) =>
    seriesId === 'bmi' ? bmiOf(entry) : entry.weight,
  )
}

// PROPS from App.jsx: goal → the chosen goal.
function DataScreen({ goal, openAdd, onAddOpened }) {
  const [entries, setEntries] = useState(() => loadMeasurements())
  const [seriesId, setSeriesId] = useState('weight')

  // Which point on the graph is selected.
  const [picked, setPicked] = useState(null)

  const [view, setView] = useState(openAdd ? 'add' : 'graph')

  // If a notification arrives while this tab is already open, the component isn't rebuilt.
  useEffect(() => {
    if (openAdd) {
      setView('add')
      onAddOpened()
    }
  }, [openAdd, onAddOpened])

  // ---- The weekly form ----
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

  // ---- Nothing recorded yet ----
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

  // ---- Working out the shape of the line ----
  const lowest = Math.min(...values)
  const highest = Math.max(...values)

  // A flat line would divide by zero below.
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
    // SVG counts y DOWNWARDS from the top, so the sum is flipped.
    return PAD_TOP + (1 - (value - low) / span) * plotH
  }

  // "x,y x,y x,y" — the format an SVG polyline wants.
  const linePoints = values
    .map((value, index) => `${xOf(index)},${yOf(value)}`)
    .join(' ')

  // ---- What it adds up to ----
  const first = values[0]
  const last = values[values.length - 1]
  const change = last - first

  // Which way the user WANTED it to go.
  const wanted = goal === 'lose' ? -1 : goal === 'gain' ? 1 : 0

  // A little movement either way is normal — water, food, time of day.
  const flat = Math.abs(change) < 0.5
  const onTrack = wanted === 0 ? flat : Math.sign(change) === wanted

  return (
    <main className="screen data-screen">
      <h1 className="title data-title">Your data</h1>
      <div className="title-rule" />

      {/* Which measure to plot Switching redraws the same shape with a different scale. */}
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

      {/* The graph. */}
      <div className="chart-card">
        <p className="chart-title">
          {/* One line, so no key is needed — the title says what it is. */}
          {series.unit ? `${series.label} (${series.unit})` : series.label}
        </p>

        <svg
          className="chart"
          viewBox={`0 0 ${W} ${H}`}
          // The picture is described in words underneath instead, for anyone using a screen reader.
          role="img"
          aria-label={`${series.label} over time, ${entries.length} readings from ${formatShortDate(entries[0].date)} to ${formatShortDate(entries[entries.length - 1].date)}`}
        >
          {/* Grid lines: three, at the bottom, middle and top of the range. */}
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
                  {/* Whole numbers for weight, one decimal for BMI, which moves in much smaller steps. */}
                  {seriesId === 'bmi' ? value.toFixed(1) : Math.round(value)}
                </text>
              </g>
            )
          })}

          {/* The line itself. vector-effect keeps it exactly 2px however far the picture is stretched. */}
          <polyline points={linePoints} className="chart-line" />

          {/* One dot per reading, each with a much bigger invisible circle behind it so it can. */}
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

          {/* The dates at either end. */}
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

        {/* What the tapped point says. */}
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

      {/* The summary. */}
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

        {/* Only said when there's a goal to judge it against. */}
        {goal && (
          <p className="data-verdict">
            {onTrack
              ? 'That is the direction you were going for.'
              : 'That is not the direction you were going for — worth a look at your routine.'}
          </p>
        )}
      </div>

      {/* The readings in words A graph is a picture. */}
      <details className="data-table">
        <summary className="data-table-summary">
          {`All ${entries.length} readings`}
        </summary>
        <ul className="data-list">
          {[...entries].reverse().map((entry) => (
            <li key={entry.date} className="data-row">
              <div className="data-row-top">
                <span className="data-row-date">
                  {formatShortDate(entry.date)}
                </span>
                <span className="data-row-value">
                  {`${entry.weight} lb · ${entry.heightFeet}' ${entry.heightInches}" · BMI ${bmiOf(entry).toFixed(1)}`}
                </span>
              </div>

              {/* The meals, only for days that have any. */}
              {MEALS.map((meal) =>
                mealAt(entry, meal.id) ? (
                  <p key={meal.id} className="data-row-meal">
                    <span className="data-row-meal-name">{meal.label}</span>
                    {mealAt(entry, meal.id)}
                  </p>
                ) : null,
              )}
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

// The measurement form.
function MeasurementForm({ onSave, onCancel }) {
  // The date being written to.
  const [dateKey, setDateKey] = useState(() => todayKey())

  // The reading already saved for that date, if there is one.
  const existing = measurementFor(dateKey)

  // What to fill the boxes with.
  const startingPoint = existing || latestMeasurement() || loadAccount()

  const [weight, setWeight] = useState(() =>
    startingPoint ? String(startingPoint.weight) : '',
  )
  const [heightFeet, setHeightFeet] = useState(() =>
    startingPoint ? String(startingPoint.heightFeet) : '',
  )
  const [heightInches, setHeightInches] = useState(() =>
    startingPoint ? String(startingPoint.heightInches) : '',
  )
  const [age, setAge] = useState(() =>
    startingPoint ? String(startingPoint.age) : '',
  )

  // What they ate.
  const [breakfast, setBreakfast] = useState(() => mealAt(existing, 'breakfast'))
  const [lunch, setLunch] = useState(() => mealAt(existing, 'lunch'))
  const [dinner, setDinner] = useState(() => mealAt(existing, 'dinner'))

  const [error, setError] = useState('')

  // Changing the date reloads every box from whatever that day holds.
  function handleDateChange(nextDate) {
    // A date box can be cleared, and can be typed into a character at a time.
    if (!/^\d{4}-\d{2}-\d{2}$/.test(nextDate)) return

    setDateKey(nextDate)
    setError('')

    const saved = measurementFor(nextDate)
    const source = saved || latestMeasurement() || loadAccount()

    if (source) {
      setWeight(String(source.weight))
      setHeightFeet(String(source.heightFeet))
      setHeightInches(String(source.heightInches))
      setAge(String(source.age))
    }

    // Meals come only from a reading actually saved on that date.
    setBreakfast(mealAt(saved, 'breakfast'))
    setLunch(mealAt(saved, 'lunch'))
    setDinner(mealAt(saved, 'dinner'))
  }

  function handleSubmit(event) {
    event.preventDefault()

    // Everything from a form arrives as text.
    const weightNumber = Number(weight)
    const feetNumber = Number(heightFeet)
    const inchesNumber = heightInches === '' ? 0 : Number(heightInches)
    const ageNumber = Number(age)

    // The same ranges the registration form uses.
    if (
      !Number.isFinite(weightNumber) ||
      weightNumber < 20 ||
      weightNumber > 1000
    ) {
      setError('Please enter a weight in pounds between 20 and 1000.')
      return
    }

    if (!Number.isFinite(feetNumber) || feetNumber < 1 || feetNumber > 8) {
      setError('Please enter a height in feet between 1 and 8.')
      return
    }

    if (
      !Number.isFinite(inchesNumber) ||
      inchesNumber < 0 ||
      inchesNumber > 11
    ) {
      setError('Inches must be between 0 and 11.')
      return
    }

    if (!Number.isFinite(ageNumber) || ageNumber < 5 || ageNumber > 120) {
      setError('Please enter an age between 5 and 120.')
      return
    }

    const entry = {
      date: dateKey,
      weight: weightNumber,
      heightFeet: feetNumber,
      heightInches: inchesNumber,
      age: ageNumber,
      // .trim() drops stray spaces, so a box holding nothing but a space counts as empty rather.
      meals: {
        breakfast: breakfast.trim(),
        lunch: lunch.trim(),
        dinner: dinner.trim(),
      },
    }

    // The account is updated to match.
    const account = loadAccount()
    if (account && dateKey === todayKey()) {
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
      <h1 className="title data-title">
        {existing ? 'Edit reading' : 'New reading'}
      </h1>
      <div className="title-rule" />

      {/* The day this reading will be filed under. */}
      <p className="data-date">{formatLongDate(dateKey)}</p>

      <p className="data-intro">
        Add a reading whenever you like — today, or any day you missed. Once a
        week is the easiest habit to keep, and enough to show a trend, since
        weight moves around from one day to the next anyway.
      </p>

      <form className="account-form" onSubmit={handleSubmit}>
        {/* The date First, because it decides what every box below is showing. */}
        <label className="field-label" htmlFor="measure-date">
          Date
        </label>
        <input
          id="measure-date"
          className="field-input"
          type="date"
          value={dateKey}
          // No future dates.
          max={todayKey()}
          onChange={(event) => handleDateChange(event.target.value)}
        />

        {/* Says plainly which of the two things this is about to do. */}
        <p className="data-edit-note">
          {existing
            ? 'Editing the reading already saved for this day.'
            : 'A new reading for this day.'}
        </p>

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

        {/* What you ate Optional on purpose. */}
        <h2 className="meals-heading">What you ate</h2>
        <p className="meals-note">
          Optional. Worth filling in for a week that went well — looking back at
          what was different is how you find out what works for you.
        </p>

        <label className="field-label" htmlFor="measure-breakfast">
          Breakfast
        </label>
        <textarea
          id="measure-breakfast"
          className="field-input meal-input"
          rows="2"
          value={breakfast}
          onChange={(event) => setBreakfast(event.target.value)}
        />

        <label className="field-label" htmlFor="measure-lunch">
          Lunch
        </label>
        <textarea
          id="measure-lunch"
          className="field-input meal-input"
          rows="2"
          value={lunch}
          onChange={(event) => setLunch(event.target.value)}
        />

        <label className="field-label" htmlFor="measure-dinner">
          Dinner
        </label>
        <textarea
          id="measure-dinner"
          className="field-input meal-input"
          rows="2"
          value={dinner}
          onChange={(event) => setDinner(event.target.value)}
        />

        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}

        <div className="form-buttons">
          <button type="submit" className="primary-button">
            {existing ? 'Save changes' : 'Save'}
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
