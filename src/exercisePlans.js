// ============================================================================
// exercisePlans.js — the exercise recommendations, one list per goal.
//
// This is DATA, not visuals, so it lives on its own rather than inside a
// screen. Two screens need it: the plan you set under Goals, and the check-in
// that the reminder notification opens. Neither owns it.
//
// ---------------------------------------------------------------------------
// WHERE THESE COME FROM
//
// Every item below is drawn from the fitness, weight-loss and diet research
// gathered for this project. The shape of each list follows the research's main
// point — that lasting results come from a few repeatable habits covering
// movement, food and recovery together, rather than from exercise alone:
//
//   lose     → a moderate calorie deficit, cardio AND strength (strength is
//              what protects muscle while fat is lost), fibre and protein for
//              fullness, and the sleep/hydration that keep hunger in check.
//   maintain → variety and consistency: cardio, strength, flexibility, and
//              balanced everyday eating.
//   gain     → progressive overload on compound lifts, a slight calorie
//              surplus with enough protein, and real recovery — muscle is
//              built during rest, not during the lift.
//
// Note that no list tells anyone a calorie number. The research is clear that
// extreme restriction backfires, and this app knows nothing about the person
// beyond their height and weight, so the items describe habits instead.
//
// Any weight written in these lists is in POUNDS, because that's what the
// account form asks for and what Account info and Your BMI both show. The
// research quotes both units; the app sticks to one so nobody has to convert.
// ---------------------------------------------------------------------------
//
// PLANS[goal] gives the right list with no "if" anywhere — which is why adding
// a goal takes one entry here and one line in GoalsScreen.
//
// Each entry has:
//   id    → the short name saved to storage. Never change one of these once
//           it's in use, or previously saved ticks stop matching. Ids only
//           have to be unique WITHIN a goal, since plans are saved per goal.
//   text  → the recommendation itself
//   note  → the practical detail, and where it's useful, the reason
export const PLANS = {
  lose: {
    title: 'Lose weight',
    intro:
      'Aim for 1 to 2 pounds a week — steady habits you can keep beat any quick fix. Tick off what you manage today.',
    items: [
      {
        id: 'cardio',
        text: 'Do 30 minutes of cardio',
        note: 'Brisk walking, jogging, cycling, swimming or dancing. Enough that talking takes effort.',
      },
      {
        id: 'strength',
        text: 'Do a strength session',
        note: 'Aim for two a week. Strength work protects the muscle you have while you lose fat, and muscle burns more calories at rest than fat does.',
      },
      {
        id: 'steps',
        text: 'Reach 8,000 steps',
        note: 'The walking you do anyway counts. Stairs and a longer route to school add up fast.',
      },
      {
        id: 'protein',
        text: 'Eat protein with every meal',
        note: 'Chicken, fish, eggs, Greek yoghurt, beans or tofu. Protein keeps you full and stops the weight you lose coming out of your muscle.',
      },
      {
        id: 'veg-half',
        text: 'Fill half your plate with vegetables',
        note: 'High-fibre food fills you up on fewer calories, so hunger is easier to manage.',
      },
      {
        id: 'swap',
        text: 'Make one healthier swap',
        note: 'Water instead of a sugary drink, baked instead of fried, a smaller portion. Small swaps last where cutting out whole food groups does not.',
      },
      {
        id: 'water',
        text: 'Drink water through the day',
        note: 'Thirst is easy to mistake for hunger, and being short on water makes exercise feel harder.',
      },
      {
        id: 'sleep',
        text: 'Get 7 to 9 hours of sleep',
        note: 'Short sleep upsets the hormones that control hunger and fullness, which makes every other habit here harder.',
      },
    ],
  },

  maintain: {
    title: 'Maintain weight',
    intro:
      'Staying where you are is about variety and consistency, not effort. Tick off what you manage today.',
    items: [
      {
        id: 'move-30',
        text: 'Move for 30 minutes today',
        note: 'Walking, cycling, swimming, a sport — anything that has you breathing harder counts.',
      },
      {
        id: 'strength-twice',
        text: 'Strength train two or three times a week',
        note: 'Free weights, machines or your own bodyweight. It keeps muscle, bone and posture, all of which are easy to lose without noticing.',
      },
      {
        id: 'flexibility',
        text: 'Stretch or do some yoga',
        note: 'Ten minutes is plenty. Flexibility work keeps your range of movement and lowers the risk of injury.',
      },
      {
        id: 'enjoy',
        text: 'Do something active you actually enjoy',
        note: 'A game, a hike, a bike ride with someone. Enjoying it is what keeps a routine going for years.',
      },
      {
        id: 'sitting',
        text: 'Break up long stretches of sitting',
        note: 'Stand and move for a minute or two every hour. It adds up more than it sounds like it should.',
      },
      {
        id: 'colours',
        text: 'Eat fruit and vegetables of different colours',
        note: 'The range of colours across a day is roughly the range of vitamins and minerals you get.',
      },
      {
        id: 'balanced',
        text: 'Eat regular, balanced meals',
        note: 'Protein, a complex carbohydrate, plenty of vegetables and a little healthy fat. Steady eating is what keeps weight steady.',
      },
      {
        id: 'check-in',
        text: 'Check your weight once a week',
        note: 'Same day, same time. Small drifts are easy to correct early and much harder to later.',
      },
    ],
  },

  gain: {
    title: 'Gain weight',
    intro:
      'Gaining well means building muscle, not just eating more — train hard, eat a little extra, and recover properly. Tick off what you manage today.',
    items: [
      {
        id: 'compound',
        text: 'Train with heavy compound lifts',
        note: 'Squats, deadlifts, bench press, overhead press and pull-ups. They work several muscle groups at once, which is why they build the most.',
      },
      {
        id: 'progressive',
        text: 'Add weight, reps or sets since last time',
        note: 'This is progressive overload, and it is the actual reason muscle grows. Write down what you lift so you know what to beat.',
      },
      {
        id: 'protein',
        text: 'Eat protein at every meal',
        note: 'Chicken, fish, eggs, dairy, beans, lentils or tofu. Muscle cannot be built out of nothing.',
      },
      {
        id: 'calories',
        text: 'Eat a little more than you burn',
        note: 'A slight surplus — an extra meal or snack, not a feast. Gaining slowly is what puts on muscle rather than fat.',
      },
      {
        id: 'carbs',
        text: 'Eat enough complex carbohydrates',
        note: 'Oats, whole grains, rice, potatoes and fruit. They are what fuels a hard session and what you refill afterwards.',
      },
      {
        id: 'rest',
        text: 'Rest the muscles you trained yesterday',
        note: 'Muscle is built while you recover, not while you lift. Train a different area today, or take the day off.',
      },
      {
        id: 'sleep',
        text: 'Get 7 to 9 hours of sleep',
        note: 'Short sleep works directly against building muscle, however well you train.',
      },
      {
        id: 'light',
        text: 'Take a light walk or stretch on a rest day',
        note: 'Gentle movement improves circulation and eases soreness, so a rest day recovers you faster than sitting still does.',
      },
    ],
  },
}
