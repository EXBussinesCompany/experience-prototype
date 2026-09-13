# Experience prototype

One interactive app, published from this repository to
[GitHub Pages](https://exbussinescompany.github.io/experience-prototype/).
The mobile Kotlin project lives separately in `astro-mobile`.

## Try both meeting modes

- Start on Today and choose **I want to meet people** / **Chcę się spotkać**.
- Choose dinner, coffee or a walk, tomorrow and/or the following day, city,
  language, time and budget. Submit to start matching, not to promise a booking.
- Use the outlined controls under **Simulation · prototype only** to try people
  found, insufficient people, expired invitation, venue confirmation or failure.
- Open Circle, Plan or Profile at any time. Plan contains both the one-off request
  and the regular circle; changing one does not reset the other.
- Simulate completion and the next day to try private contact preferences. The
  completed one-off appears in Profile history, including after a new search.

PL/EN is one shared switch. One-off demo state survives reload in the same tab.
The root opens the complete app. Older `/one-off/` links redirect into its one-off
screen; they no longer open a separate prototype.

## Limits

All people, venues, confirmations and dates are fictional. The one-off scenario
uses 13 September 2026 as its demo clock. It sends no requests, notifications,
payments or bookings. Simulation controls are not production UI. This integration
does not revise the existing regular-circle demo's matching/voting policies.

## Browser checks

With Node, Playwright and Google Chrome available:

```sh
node living-constellation-v1/screens/unified.browser.test.cjs
```

Set `NODE_PATH` if Playwright is provided by an external runtime. The test starts
an ephemeral loopback server with the GitHub Pages subpath, checks both languages
at 320, 390 and 430 pixels, exercises success/failure/expiry/cancellation/history,
then runs the existing Living Constellation browser regression suite.
