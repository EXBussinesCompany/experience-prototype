# Experience — Living Constellation prototype

## Question

Can the selected Living Constellation visual direction carry the complete weekly journey while keeping the confirmed plan, venue, budget, safety, and private continuation clear?

## Built

- A clickable mobile-first journey covering first launch, profile setup, membership, circle formation, Today, Circle, Confirmed Plan, Live Meeting, and Private Continuation.
- An optional in-app conversation prompt that does not require a human host or keep the group on their phones.
- A confirmed-plan screen inside the same calm dark system as the rest of the product.
- Private friendship and romantic continuation controls with mutual-only disclosure.

## Settled

- The user selected visual direction 02, Living Constellation, over Cosmic Editorial and Urban Cosmic Pass.
- The social circle is the primary cosmic object; astrology remains explanatory and non-deterministic.
- Mandatory identity checks were rejected for the pilot. Phone, selfie, and document checks are optional; 18+ remains a self-declaration.
- Faces are not reliable enough to carry the interface because participants may skip photos or upload misleading ones. People use abstract identity tokens, with names shown only after they accept the invitation.
- Exact participant ages are private. The maximum eight-year age spread remains an internal matching constraint and is not exposed in the interface.
- The first screen contains no invented participants. The circle appears progressively while real invitations are accepted.
- The light confirmed-plan screen was rejected as visually disconnected. Plan details now stay inside the same dark visual system.
- Bright lime and acid green were rejected as irritating. The current direction uses blue graphite, soft sky blue, muted coral, and restrained status colors.
- Social intent and emotional appetite are temporary, not profile traits. Onboarding asks only for practical availability; before each weekly circle, people choose one or two concrete evening scenarios and may choose differently next week.
- The subscription is always active and does not guarantee that a circle will form. Experience promises a new matching round and transparent status; a plan becomes confirmed only after at least four people accept the same slot.
- A synchronous four-step meeting guide with timers and group voting was rejected as intrusive and unclear. During the meeting the app only handles arrival, practical help, and an optional conversation prompt; next-week preferences are private and collected later.
- Post-meeting ratings, contact choices, and future preferences are never requested while the group is still together. The app waits until the next day and collects them privately to avoid politeness bias and social pressure.
- Profile is a persistent destination in the main navigation. It contains matching settings, subscription status, mutual contacts, privacy controls, and a restrained history of completed meetings; history is not a browsable catalogue of participants.
- The Today screen includes a lunar-calendar card. Astronomical phase and timing are presented as facts, while daily meaning is explicitly labelled interpretation; lunar guidance always suggests an available action and never blocks meetings or asks people to wait.
- Typography prioritizes phone readability over fitting entire screens above the fold: system UI fonts replace decorative faces for body and display text, core body copy is 13–15 px, actions are 14 px, and only secondary metadata may be 10–12 px. Vertical scrolling is acceptable.
- Bottom navigation uses distinct outline icons plus persistent 12 px semibold labels; dot-only navigation was rejected as ambiguous and hard to read.
- Circle formation progresses only from real invitation responses. The clickable prototype retains a manually advancing simulation control, visually separated and explicitly labelled for removal; production users only enable a readiness notification, change this week's preferences, and leave the app.
- Enlarged typography must not cause flex containers to shrink fixed visualizations: the forming orbit keeps a fixed 300 px block and the screen scrolls vertically, preventing absolute-positioned nodes from overlapping the status card.
- Full mobile layout QA covers 360×800 and 390×844 viewports, with at least 12 px separation between the forming visualization and status, 44 px utility-button targets, no horizontal overflow, and scroll-safe bottom navigation.
- Private post-meeting choice grids use zero-minimum fractional columns, wrapped labels, and 44 px targets so Polish copy cannot force horizontal overflow on narrow phones.
- The Today screen uses explicit vertical spacing between its heading, lunar card, circle visualization, and plan card; negative orbit margins were removed because they visually pulled participant labels into adjacent cards.
- The main app shell is available immediately after onboarding and subscription. Circle formation is a live state inside the Circle tab, not a blocking step; Today keeps its daily lunar value, while Plan shows an honest pending state until four people confirm.

- Premium guarantees controlled service value rather than a meeting: weekly matching rounds, priority matching, transparent status, the full daily navigator, and faster ordinary support. Urgent safety reports keep equal priority for everyone.
- The pilot checkpoint is five held meetings or eight weeks, whichever comes first. This is an analysis checkpoint, not a promise that five meetings will happen.
- A circle is adaptive and may persist. The next day, members privately vote to continue or rematch; if more than half of voters choose rematch, everyone enters a new matching round. Individual votes stay hidden and vacancies may be refilled.
- After private voting closes, a collective rematch screen announces only the majority decision, preserves the completed meeting in history, and starts a new weekly matching round with the existing practical settings. It never reveals individual votes.
- The primary pilot metric is the share of circles whose voting majority chose continuation and that actually held another meeting within 14 days.
- Mutual choices open an in-app chat. Phone numbers and social accounts remain private until people decide to share them themselves. Blocking closes the chat and prevents future matching.
- Safety is a real flow available before, during, and after a meeting: leave, report a person, block, report a venue problem, and access 112. Reporting and blocking are independent actions.
- The prototype has an explicit removable DEMO controller for new-user, confirmed-circle, and returning-user journeys, plus payment, circle-formation, attendance, and post-meeting result states. Choosing a formation stage opens the Circle tab where that state belongs.
- First-time history is empty. Returning-user history and participant records are visibly demo data rather than invented first-time content.
- Before the first meeting, a plan confirms at four people and may still fill to six before the deadline. After a held meeting, a successful circle is not automatically topped up to six. A majority may preserve the circle, but anyone may leave: if three of four continue, those three remain a stable core while Experience finds one replacement. The next meeting confirms only after the circle returns to at least four; missing that deadline skips the week without dissolving the core. Votes and reasons stay private, while the vacancy itself may be visible.

- The interface can be switched globally between Polish and English. This UI-language choice is preserved independently from the meeting-language preference used for matching.
- Today, Circle, and Plan have non-overlapping jobs. Today contains the daily lunar guidance plus one compact next action; Circle owns matching progress, accepted people, and weekly preferences; Plan contains only confirmed meeting logistics or an honest empty state with the next update. Participant counts and matching progress never appear in Plan.

## Still open

- Whether even the optional conversation prompt is useful enough to keep in the MVP.
- Whether post-meeting friendship and romantic choices are understandable without making the product feel like dating.
- How venue reservations will work in the pilot: AI booking agent, manual agreements with a small venue set, or a hybrid.
- How non-voters affect the private majority decision and whether the vote needs a quorum.
- What happens when only one or two members want to continue after a meeting.

## Prototype

- Entry point: `screens/index.html`
