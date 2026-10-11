# Active Living

A fitness app that runs on your phone, keeps everything private, and asks you
one small question a day instead of a hundred.

---

## What it does, and why

Most fitness apps fail people in the same two ways. They ask for too much —
logging every meal and every rep until it becomes a chore nobody keeps up. And
they quietly send your weight, your age and your habits off to a company's
servers.

Active Living is built against both of those.

**It asks for very little.** A goal, a few days on a calendar, and a tap to say
you did it. One weight reading a week. That's the whole commitment.

**Your information never leaves your phone.** There is no server, no account on
the internet, no analytics and no tracking. Everything you type is stored on
your own device and nowhere else — so there is nothing to leak, sell or lose.
Your password is scrambled by the phone itself so that even someone holding your
unlocked phone cannot read it.

**It's built on real guidance.** The exercise recommendations come from
established advice on weight loss, muscle gain and maintenance — and
deliberately cover movement, food and rest together, because that is what the
research says actually works. No list tells you a calorie number, because
extreme restriction backfires and the app doesn't know enough about you to be
giving that kind of instruction.

### What makes it different

| | |
|---|---|
| **Private by design** | Nothing is uploaded, because there is nowhere to upload it to |
| **Works with no signal** | Opens on a plane, on the underground, anywhere |
| **Installs like a real app** | Add it to your home screen and it opens full-screen with its own icon |
| **Nothing to download** | It's a web link. A judge can open and use it in ten seconds |
| **Honest about its limits** | Every claim it makes is one the code actually keeps |

---

## How to use it

The app has five buttons along the bottom.

### 1. Settings — start here

Open **Account info** and create an account: your name, age, sex, height,
weight and email. The app needs your height and weight to work out your BMI and
to draw your progress later.

While you're here, **Your BMI** shows where you stand on the standard scale,
with a marker on a chart and a plain-English explanation.

### 2. Goals — pick what you're working towards

Choose **Lose weight**, **Maintain weight** or **Gain weight**. Each opens a
list of eight recommendations suited to that goal.

Tick the ones you intend to do. Anything you tick jumps to the top of the list
so your choices stay together, and a notes box opens underneath it — that's
where "do 30 minutes of cardio" becomes "3 miles around the park before school."

Tap **Save and go to Routine** when you're done.

### 3. Routine — choose your days

A real calendar showing today's date and time. Tap the days you plan to
exercise. You can look months ahead using the dropdown.

Tap **Save days and set reminder**, then pick a time. If you want the same days
every week, answer **Yes** to the repeat question and the app fills in the rest
of the year for you.

### 4. The reminders

On each day you picked, two notifications arrive:

- **At your chosen time** — "Time to work out"
- **An hour later** — "Did you complete your workout?"

Tapping either opens the app on the right page. Confirming on the second one
with the big check mark is what **adds a day to your streak**. Miss a scheduled
day and the streak goes back to zero — rest days don't count against you.

### 5. Your data — watch it work

Once a week the first reminder asks for your weight, height and age instead.
You can also add a reading any time, for today or any day you missed, and edit
one you've already saved.

There's space to write down what you ate for breakfast, lunch and dinner. It's
optional, and it's the most useful part of the page: when a week goes well, you
can look back and see what was different.

The graph shows your **weight** or your **BMI** over time. Tap any point to read
it. Underneath, the app tells you how much has changed and — if you've set a
goal — whether that's the direction you wanted.

### Starting over

**Settings → Reset goals** clears your goal, calendar, reminder, streak,
exercises and measurements. Your account details stay. It asks first, and tells
you exactly what will go.

---

## How the program is laid out

Think of the app as a building.

**The frame** holds everything up. It remembers which page you're on, which goal
you picked and when your reminders are due — and it keeps running while you move
between pages.

**The rooms** are the pages you see: Home, Goals, Routine, Your data, Settings,
and the smaller pages inside them. Each room knows how to draw itself and
nothing else. When you tap something, the room tells the frame; the frame
decides what happens.

**The workshop** is a set of files with no appearance at all. One knows about
dates and calendars. One scrambles passwords. One decides when reminders should
fire. One holds the exercise advice. Five more are the filing cabinets that read
and write your saved information. Keeping these separate from the rooms means
each can be checked on its own — the streak rules and the calendar maths were
both tested that way before anyone saw them.

**The night porter** is a small program that keeps working after you close the
app. It's what lets the app open with no internet, and what delivers a
notification to your phone and opens the right page when you tap it.

### The ingredients

The app is written in **JavaScript**, the language web browsers understand, with
**React** — a tool for keeping the screen in step with the information behind it.
**Vite** assembles the 45 source files into the finished app; it runs on the
developer's computer and never ships to your phone.

There are only **two** outside pieces of code in the whole project. Everything
else — the graph, the calendar, the password scrambling, the offline support —
is written from scratch. That is unusual, and it is the reason the finished app
is about **74 kilobytes**: smaller than a single photograph, and small enough to
open instantly on a slow connection.

---

## The honest part

Two things the app cannot do, which it says plainly on its own screens:

**Reminders need the app to have been open recently.** A web page can only run
while it is running. Notifications appear properly on your phone and survive you
closing the page, but the clock that decides *when* to send one needs the app
alive. Closing it for a whole day means no reminder that day. Fixing that would
require a server, which would also mean giving up the "nothing leaves your
phone" promise.

**Your data lives on one device.** That's the direct cost of keeping it private.
It doesn't follow you to a new phone, and clearing your browser's site data
erases it.

Both are deliberate trades, not oversights.
