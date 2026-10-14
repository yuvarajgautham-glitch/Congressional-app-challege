// exercisePlans.js — the exercise recommendations, one list per goal.
// WHERE THESE COME.
// PLANS[goal] gives the right list with no "if" anywhere.
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
        id: 'colors',
        text: 'Eat fruit and vegetables of different colors',
        note: 'The range of colors across a day is roughly the range of vitamins and minerals you get.',
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
