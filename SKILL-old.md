---
name: sunscreen-report-deck
description: Use when creating, revising, or extending the 27SS sunscreen apparel report in this project. This skill is for turning social listening, Tmall industry data, competitor data, design insights, and color trends into restrained consulting-style report pages with one clear takeaway headline, bullet-point insights, and evidence-led charts instead of dashboard-like layouts.
---

# Sunscreen Report Deck

Use this skill whenever you are editing or expanding the report in this project, especially:

- `27SS防晒衣开发报告.html`

Primary visual and structural benchmark:

- `Outer JP Labeling report 0325_final.html`

This skill is not for the database/dashboard surface. It is specifically for the report/deck surface.

The database answers:

- What is in the data?
- How can I explore it?

The report answers:

- What is the conclusion?
- What does the evidence mean?
- What should the brand do next?

If the page feels like an admin panel, dashboard, landing page, or data warehouse, it is off track.

## What the user wants

The desired feel is:

- consulting-deck logic
- restrained white-background presentation
- evidence-first but conclusion-led
- clean and narrow content frame
- very little visual noise
- no card soup
- no over-explaining

The user does **not** want:

- a “nice webpage”
- a big interactive dashboard
- a visually flashy landing page
- lots of decorative UI
- heavy KPI modules
- scattered analysis blocks

The correct mental model is:

`one page = one message`

Not:

`one page = many modules`

## Core page grammar

Every report page should default to this grammar unless the page has a strong reason to differ:

1. Small chapter label
2. One strong takeaway headline
3. Two to three bullet-point insights directly under the headline
4. One or two evidence charts
5. Minimal footer if needed

The top half of the page should allow the user to understand the conclusion before reading the chart in detail.

The chart then proves the conclusion.

## Non-negotiables

Never do these by default:

- do not create dashboard-style KPI tiles
- do not place summary boxes between the title and chart unless explicitly needed
- do not create a separate “insight module” if the insights can live under the title
- do not repeat the same message in headline, subtitle, chart note, and footer
- do not place metadata like `Source / Window / Category` under the page title unless explicitly requested
- do not make the content area too wide
- do not over-round every box
- do not add gradients, glows, decorative shadows, or visual effects that feel promotional
- do not explain obvious chart readings in long text blocks
- do not build pages from generic stacked cards
- do not accept blurry or low-legibility chart text as “good enough”

When in doubt, remove rather than add.

## Chart text clarity is non-negotiable

Chart text must read crisply in the actual report page, not only in code or at zoomed-in inspection.

This is a hard rule across the whole deck.

When a chart contains meaningful axis labels, tick labels, point labels, or internal annotations:

- prefer clarity over compactness
- do not keep axis or label text at tiny sizes such as `9px` if it reads soft or blurry on the page
- increase chart typography before adding more explanatory copy
- if an ECharts chart is text-heavy and the canvas rendering feels soft, prefer `renderer: "svg"` unless there is a strong performance reason not to
- keep chart text sizing more generous than default ECharts habits
- reduce unnecessary text borders or heavy label effects that make small type look muddy
- do not let chart text become less legible than nearby HTML text just because it lives inside the chart

Preferred defaults:

- axis title and tick text should usually land around `10px` to `11px` when the page scale allows it
- direct chart labels should usually be at least `10px`
- text outlines should be as light as possible and only used when contrast truly requires them

Diagnosis order for fuzzy chart text:

1. Check whether the chart uses canvas rendering
2. Check whether page zoom or viewport scaling is making the chart look soft
3. Check whether axis or label text is too small
4. Check whether text borders, shadows, or other effects are making the letters muddy
5. Then decide whether to switch that chart to `svg` rendering

Do not treat this as optional polish.
If chart text feels blurry, it is a readability issue and should be fixed before considering the page finished.

## Report philosophy

The report should behave like a strategy deck:

- the page title is already a conclusion
- the bullet points are the reasoning bridge
- the charts are the proof
- the rest of the page should stay quiet

This means:

- the strongest text on the page is the takeaway
- the user should not need to “interpret what the page is trying to say”
- the page should feel edited, not accumulated

## Difference between report and dashboard

Use this table mentally:

- Dashboard:
  - many filters
  - many widgets
  - many dimensions
  - browse-first
  - user decides what matters

- Report:
  - one storyline per page
  - one takeaway per page
  - selected evidence only
  - conclusion-first
  - page already tells the user what matters

If the page is asking the viewer to do too much interpretation, it is acting like a dashboard and should be simplified.

## Page anatomy in detail

### 1. Chapter label

Use a small, compact line above the main title.

Purpose:

- orient the reader
- show section order
- keep the page within the full-report structure

Format guidance:

- small number badge or chapter marker
- short section label like `Part 1 / Social Listening`
- low visual priority

The chapter label is not the main message. It is navigation only.

### 2. Takeaway headline

This is the single most important line on the page.

Rules:

- it must contain the actual conclusion
- it must be horizontally readable
- it should not feel like a poster headline broken into too many lines
- it should not just name the topic
- it should be readable in one scan

Good examples:

- `25SS 防晒衣 shows a buzz resilience but a softer search trend after May`
- `High search interest does not translate into stronger late-season demand`
- `Premium UV narratives remain visible, but functional sameness limits conversion`

Bad examples:

- `Social Listening`
- `25SS 防晒衣 Social Data`
- `Category Analysis`
- `Buzz & Search Overview`

The title should answer:

- what changed?
- what matters?

### 3. Bullet-point insights

These sit immediately under the headline.

This area replaces:

- subtitle paragraphs
- metadata rows
- summary cards
- duplicated chart annotations

Rules:

- use 2-3 bullets
- each bullet should be short and direct
- each bullet should express a fact, implication, or action
- do not write vague “consulting-sounding” filler
- do not turn bullets into mini paragraphs

Preferred bullet structure:

- bullet 1: what happened
- bullet 2: what it means
- bullet 3: what to do or what to verify next

Examples:

- `25SS buzz stayed positive at +1% YoY, showing that category heat remains in market.`
- `Douyin search weakened after May and closed at -6% YoY, suggesting softer active demand.`
- `27SS should launch earlier and build clearer reasons-to-search instead of relying on late-season exposure.`

Do not use this space for:

- source statements
- category labels
- raw dimensions
- decorative copy

### 4. Evidence chart block

This is the proof section.

The chart block should feel neat, stable, and quiet.

Rules:

- usually 1-2 charts per page
- if there are 2 charts, they should feel like paired evidence
- titles must be tight and useful
- chart descriptions should be at most one short line
- charts should not be wrapped in thick UI
- borders should be light and consistent

What the chart title should do:

- identify the evidence
- not repeat the page headline word for word

Good chart titles:

- `25SS 防晒衣 buzz`
- `25SS 抖音 search YoY`
- `Premium price-band growth by month`
- `Color share shift in top-selling items`

Bad chart titles:

- `Category analysis chart`
- `Search chart for reference`
- `Trend of various related things`

### 5. Footer

Footers are optional and should stay quiet.

Good footer content:

- page number
- data source if the page needs it
- project identity

Bad footer content:

- repeated conclusions
- long notes
- extra explanation that should have been in bullets or chart labels

## How to translate data into a page

Follow this order every time:

1. Read the data
2. Decide the single most important page takeaway
3. Write the takeaway as a headline
4. Write 2-3 bullets under it
5. Choose only the charts that prove that takeaway
6. Remove any extra modules that do not directly support the story

Never start by asking:

- what modules should I add?

Always start by asking:

- what is the page trying to prove?

## Content compression rules

The report should compress data into judgment.

This means:

- do not carry every number into the page
- do not visualize everything available
- do not show fields only because they exist

Instead:

- choose only the evidence that changes a decision
- omit low-signal analysis
- merge similar points
- cut text aggressively

The page should feel “edited by a strategy team,” not “extracted from a database.”

## Width and composition rules

The user explicitly prefers controlled page width.

That means:

- keep the main content frame narrower than the full browser width
- let the page breathe
- avoid giant sprawling layouts
- avoid making the title and charts stretch edge-to-edge unless a very strong reason exists

Visual density should be moderate, not sparse and not crowded.

The page should feel balanced:

- generous white space
- compact headline area
- deliberate chart placement

## Visual direction

Default visual language:

- white or near-white page
- deep navy or charcoal headline color
- muted gray support text
- minimal accent usage
- restrained borders
- very light shadows only if necessary
- crisp typography hierarchy

Typography behavior:

- headline is bold and decisive
- chapter label is small and quiet
- bullets are clear and readable
- chart labels are compact and businesslike

Avoid:

- colorful dashboards
- glossy glassmorphism
- oversized pills
- floating panels
- strong gradient backgrounds
- playful microinteractions

## Border, radius, and shadow rules

These details matter because they often make the page feel too “webby.”

Default:

- light border
- modest radius
- almost invisible shadow or no shadow

Avoid:

- thick border treatments
- large soft glowing shadows
- giant pill chips
- nested rounded cards

If a box exists, it should feel like a report container, not a product UI component.

## What to remove on sight

If you see these in a report page, they are usually wrong:

- summary cards under the title
- 3-up KPI chips unless specifically needed
- separate “Insight” module at the bottom when bullets already exist at top
- long subtitle paragraphs
- metadata strips under the title
- decorative badges everywhere
- chart footnotes explaining obvious trends
- multiple boxes saying the same thing

## Writing style

Writing should be:

- analytical
- concise
- decision-oriented
- specific

Not:

- promotional
- poetic
- vague
- repetitive

Good report language:

- `Search softened after May despite stable social heat.`
- `The gap suggests awareness remained, but active demand weakened.`
- `The implication for 27SS is an earlier launch and more explicit product differentiation.`

Weak report language:

- `This shows many interesting things worth paying attention to.`
- `There is a trend that we can continue to observe.`
- `This category still has some popularity in the market.`

## English and Chinese usage

For this project, mixed-language output is acceptable and often preferable.

Default pattern:

- English for strategic takeaway headlines
- English for concise bullet insights when it improves deck feel
- Chinese for category names, platform labels, business context, and brand-facing interpretation

Do not mix languages randomly inside one line unless it is natural and already part of the deck pattern.

## Chapter-specific guidance

Use the following default logic for each report section.

### Social Listening

Goal:

- explain whether category attention is growing, flattening, or weakening
- compare heat versus active demand
- identify timing implications

Typical chart types:

- monthly buzz trend
- search YoY trend
- platform split if available
- keyword cluster trend if available

Typical page takeaways:

- `Buzz remains resilient while active search weakens after May`
- `Search growth shifts earlier, implying an earlier seeding window`
- `Conversation remains broad, but demand clusters around fewer functional triggers`

### Tmall Industry Data

Goal:

- show category size, structure, price-band change, and growth quality

Typical chart types:

- category sales trend
- price band share
- monthly sales and YoY
- brand share or segment growth

Typical page takeaways:

- `Growth concentrates in mid-premium price bands`
- `Late-season demand softens despite stable category penetration`
- `Share gains come from clearer functional propositions, not lower price alone`

### Competitor Insight

Goal:

- explain how leading brands are winning
- show product architecture, pricing logic, hero functions, and bestseller concentration

Typical chart types:

- brand comparison
- tag penetration
- price distribution
- hero SKU concentration

Typical page takeaways:

- `Winning brands combine narrow hero functions with clearer price ladders`
- `High-volume brands rely on simpler narratives, not broader SKU complexity`

### Design Point

Goal:

- turn product evidence into design language

Typical chart types:

- silhouette or detail distribution
- feature combination ranking
- best-selling detail examples

Typical page takeaways:

- `Design opportunity lies in refining functional clarity rather than adding more details`
- `Visible protection cues outperform subtle technical storytelling`

### Color Trend

Goal:

- identify dominant, growing, and under-served color directions

Typical chart types:

- color share
- YoY color shift
- brand color structure
- bestseller color mapping

Typical page takeaways:

- `Core neutral colors still dominate, but soft outdoor greens show opportunity`
- `Growth colors remain limited, suggesting room for differentiated seasonal accents`

### Core Competitor Pages

Goal:

- go deep on one brand at a time
- explain why that brand matters

Typical structure:

- one page headline about that competitor’s strategic position
- bullets on their strength, weakness, and implication
- 1-2 evidence charts or product examples

### Single-brand insight page defaults

For this project, `single-brand insight` pages are now fixed to one approved page grammar.

Use this as the default for brand-deep-dive pages such as:

- `DESCENTE`
- `KOLON SPORT`
- `BANANA UNDER`
- other one-brand deep-dive pages

This page type should not fall back to a dashboard layout.

Approved page formula:

`Headline conclusion -> left fixed brand read -> top gender conclusion cards -> bottom gender evidence cards`

### Approved page structure

The page should use:

1. small chapter label
2. one strong single-line headline
3. left fixed brand block
4. right gender evidence block

The width logic is:

- left = fixed and comparable across brands
- right = evidence-led and data-variable across brands

### Approved left-column structure

The left column should contain:

- `Brand Snapshot`
- brand logo or wordmark block
- one short takeaway sentence
- 2-3 anchor KPIs such as `GMV Share`, `YoY Growth`, `ATV`
- one radar chart

Approved radar dimensions:

- `ASP`
- `YoY`
- `Sport Outdoor`
- `Commute`
- `Functional Depth`

Definition note:

- `Functional Depth` should not simply mean `sun protection`
- for sunscreen apparel, `sun protection` is the category entry ticket
- `Functional Depth` should describe secondary functional depth beyond the basic sunscreen claim
- approved cues can include the strength and combination depth of tags such as `cooling`, `quick dry`, `breathable`, `lightweight`, `stretch`, `water-repellent`, or other secondary functions

Rules:

- keep the radar legend inside the container
- do not add extra explanatory copy below the radar unless explicitly requested
- do not let the left block become a KPI dashboard stack
- for single-brand insight pages, the radar comparison should use `Male / Female / Overall`
- default visible state should show `Male` and `Female`, while `Overall` stays available in the legend but off by default

### Approved right-column structure

The right side should use a `two-column by two-row` logic:

- top row = two light conclusion cards
- bottom row = two detailed evidence cards

The approved mapping is:

- top-left = `Female` conclusion card
- top-right = `Male` conclusion card
- bottom-left = `Female` detail card
- bottom-right = `Male` detail card

Do not collapse the top conclusion and bottom evidence into one undifferentiated card if scan speed becomes weaker.

### Approved top conclusion card pattern

Each top conclusion card should stay compact in height.

Inside the card, use:

- gender title in English
- one short Chinese/English sub-label if helpful
- `Share` and `YoY` as visually stronger KPI chips
- one short Chinese insight line
- one short English supporting line

Rules:

- enrich the content inside the card rather than making the card taller
- `Share` and `YoY` should read more strongly than body copy
- keep the card as a conclusion card, not a mini table

### Approved bottom evidence card pattern

Each gender detail card should follow this fixed order:

1. `Top Scene`
2. `Top Function`
3. `Color`

The three sections should be separated by modest spacing so they read as three blocks rather than one continuous list.

### Scene and function evidence rules

For both `Top Scene` and `Top Function`, use:

- item name
- share value
- YoY badge
- horizontal bar

Default quantity:

- scene = 3 rows
- function = 4 rows

Rules:

- scene and function rows must be immediately scannable
- share and YoY should both remain visible
- positive and negative YoY should preserve semantic color meaning
- do not revert these sections to plain text tables if ranking is important

### Color section rules

The approved color section for single-brand pages is:

- 4 colors per gender card
- circular color swatch on top
- one centered text line with `Chinese + English`
- one centered percentage line below

Rules:

- do not separate the color name and percentage too far apart
- do not force cramped left-right micro-layouts inside narrow 4-column color grids
- prefer a compact centered stack in narrow layouts
- mixed naming like `白色 White` is approved

### Single-brand page non-negotiables

Do not do these on future single-brand pages:

- do not return to full dashboard-style KPI tiles
- do not create a separate oversized `Gender Insight` module above the gender cards
- do not wrap the entire right side in a redundant outer frame if the inner cards are already clear
- do not make the top conclusion cards too tall
- do not force equal-height tricks that create awkward blank space above or below `Color`
- do not break the main page headline into multiple lines if one-line treatment can be preserved

### Final Summary / Brand Guidance

Goal:

- convert evidence into action

Typical structure:

- one page takeaway
- 3-5 clear recommendations
- no extra exploratory data

Typical output style:

- `For 27SS, the brand should move earlier, simplify the hero narrative, and develop clearer scene-led product reasons.`

Execution priority rule:

- when a page is clearly a `strategy`, `summary`, `recommendation`, or `brand guidance` page, do not start from a generic strategy-template mindset
- start from this skill's page grammar first
- prefer `one takeaway + 3-5 recommendations + one restrained action framework`
- do not introduce extra pillar rows, summary cards, or modular strategy widgets unless the user explicitly asks for them
- if there is a conflict between a generic strategy-layout habit and this deck grammar, this deck grammar wins

## Chart selection guide

Choose chart forms based on the question:

- trend over time -> line chart
- YoY or variance -> bar chart
- structure comparison -> stacked bar or grouped bar
- brand comparison -> ordered horizontal bar
- price architecture -> histogram or band share bar
- color share -> restrained blocks or bars

Avoid unusual chart types unless they reveal something essential.

Use simple forms first.

## On-chart annotation rules

Prefer a small number of meaningful annotations:

- peak month
- inflection point
- strongest YoY month
- major drop month

Do not annotate everything.

Each chart should have at most one or two visual highlights unless the story truly requires more.

## Multi-chart symmetry rules

When a page contains two side-by-side charts, treat them as a paired spread rather than two unrelated widgets.

Default expectations:

- align the top edges of both chart panels
- keep the same title block structure on both sides
- keep the same summary placement on both sides
- keep chart heights identical
- keep legend placement consistent unless there is a strong reason not to
- keep horizontal padding and top breathing room visually matched

If one chart has an icon before the title, the paired chart should usually also have an icon or a deliberately equivalent offset.

If one summary is centered, the paired summary should also be centered.

Do not let one chart feel crowded and the other feel empty.

## Trend chart language

For this project, trend charts should feel like edited consulting charts, not default library output.

Preferred defaults for YoY trend lines:

- use thin or medium-weight lines
- prefer dashed lines when they help the page feel lighter and more analytical
- keep point markers small
- avoid heavy area fills by default
- use smoothness sparingly; do not let curves feel overly soft or decorative
- keep grid lines light and recessive
- use end labels or legends intentionally, not both by reflex

When a line is the key evidence, the chart should still be readable without hover.

That means at least one of these should usually be true:

- all monthly YoY values are labeled
- the most important values are labeled and the rest are obvious
- the end label clearly identifies the line

## Color semantics for growth charts

Use color to communicate business meaning, not just series identity.

Default rule for growth numbers:

- positive growth labels should read as green
- negative growth labels should read as red
- zero or neutral reference elements should stay gray or muted blue

If the line itself needs a branded or differentiated color, that is acceptable, but growth labels should still preserve positive/negative meaning when possible.

Good pattern:

- line identity color for the stroke
- green positive labels
- red negative labels

Bad pattern:

- changing positive labels to blue just because the line is blue
- making all labels one color when the chart is about growth direction

## Series differentiation rules

When a chart contains multiple lines, hierarchy must be obvious immediately.

Use a combination of:

- different stroke colors
- different stroke weights
- different opacity
- end labels
- restrained legend labels

Recommended hierarchy:

- primary series: darker or cleaner color, stronger label emphasis
- comparison or benchmark series: lighter gray or lower-contrast color

For benchmark lines such as `APP TTL`, keep them visually subordinate unless the benchmark is the actual message.

## Legend and line-end labeling

Legends are not mandatory, but if a chart has more than one series, the reader must be able to identify them in one scan.

Use one of these patterns:

- restrained legend only
- end labels only
- legend plus end labels only when the chart still feels quiet

Avoid:

- heavy boxed legends
- repeated naming in too many places
- making the user decode unnamed comparison lines

If both legend and end label are used, keep one quieter than the other.

## Tooltip rules

Tooltips should be supportive, not the primary reading path.

Default tooltip behavior:

- white background
- light border
- soft shadow
- compact content
- two to three rows maximum

Do not use:

- default black tooltip boxes
- oversized tooltip panels
- verbose explanatory sentences inside tooltips

The chart should still communicate the main story without hover.

If monthly labels already exist on chart, the tooltip should simply confirm the value and actual volume.

## Platform icon rules

Platform icons are allowed when they clarify data source or channel context.

Preferred usage:

- place icons directly before the chart title
- treat icon plus title as one aligned title block
- use real image assets when available
- keep icon size subordinate to the title text
- use the same alignment logic across paired charts

Do not:

- fake important brand/platform marks with decorative substitutes if a real asset exists
- let icons become larger than the title cap height by too much
- use icons as decoration with no informational purpose

If assets are available in the project, prefer those.

## Asset and fallback rules

When the user provides assets after the initial build:

- switch from CSS placeholder graphics to the real assets
- keep asset paths stable and relative to the report file when possible
- re-check alignment after swapping in real images

When localized text risks encoding issues in chart axes or script blocks:

- prefer stable English month abbreviations like `Jan`, `Feb`, `Mar`
- or use unicode escapes if the chart truly needs Chinese labels

Do not leave visible encoding corruption in the final page.

## Temporary data completion rules

The user may provide missing data mid-iteration through screenshots, pasted tables, or chat messages.

When that happens:

- treat the newly provided values as authoritative for the affected chart
- update the chart directly rather than waiting for a full dataset refresh
- keep the page narrative and chart labels synchronized with the new numbers
- if data exists for one side of a paired chart but not the other, do not invent symmetry; note the limitation and continue

If monthly actual values are available in addition to YoY:

- keep YoY as the visible trend when that is the main story
- use actual values in tooltips or small supporting labels

## Social listening chart defaults for this project

For the `Social Listening` spread in this report, prefer the following default expression:

- left chart: category buzz trend with category line plus `APP TTL` benchmark if available
- right chart: platform search trend for the most relevant channel such as Douyin
- chart summaries should show total-period YoY in one short line
- monthly growth should be directly readable from the chart
- benchmark lines should be lighter than hero-category lines

Typical naming pattern:

- `25 SS Category Buzz Trend | YOY Growth`
- `25 SS Sunscreen JK Douyin Search Trend`

This spread should feel evidence-led, highly readable, and slightly more annotated than the rest of the deck because timing matters.

## Single-chart page rules

Not every page should be forced into a two-chart spread.

When one chart is clearly the primary evidence, prefer a single-chart page grammar:

- one takeaway headline at top
- 2-3 bullets
- one large chart panel
- optional hover detail or inset detail only if it directly supports the hero chart

Single-chart pages should feel more relaxed than paired-chart pages.

That means:

- allow a slightly wider content frame if needed
- do not compress the hero chart into a dashboard-sized module
- do not overfill the page with extra support widgets just to balance space

However, avoid turning a single-chart page into a poster.

The goal is:

- one dominant chart
- one clear reading path
- one supporting layer at most

## Hero chart sizing rules

For single-chart pages, the hero chart should be larger than a normal paired chart, but still proportionate to the page.

Preferred behavior:

- give the chart more width before giving it much more height
- reduce unnecessary explanation above the chart if that buys chart space
- trim vertical whitespace between bullets and the chart

Do not:

- let the chart title block consume too much vertical space
- let the chart become so tall that the page feels stretched compared with neighboring pages
- shrink a hero chart to the same density as a paired chart if that makes it feel cramped

## Bubble / scatter landscape rules

Use a bubble or scatter chart when the page is about market structure, competitive position, or category landscape.

Preferred mapping:

- x-axis: share, penetration, or size position
- y-axis: growth, YoY, or momentum
- bubble size: absolute scale such as GMV

Defaults:

- bubble size should communicate absolute scale clearly; do not make size differences too subtle
- highlight the focus category with stronger fill and border treatment
- keep comparison categories visible but subordinate
- use light gridlines and avoid heavy axis treatments

If labels become crowded:

- keep only the most important category labels always visible
- let secondary items rely on hover
- never let many pale overlapping labels reduce readability

## Hover detail card rules

Hover detail cards are allowed when the hero chart is primary and the secondary view is explanatory rather than equally important.

Use this pattern when:

- the main chart establishes the market structure
- one specific category needs a drill-down
- the user explicitly prefers the hero chart to occupy the main page real estate

Preferred hover-detail behavior:

- the detail card floats over unused chart space
- it should read like a tooltip card, not a second permanent dashboard panel
- it should be clearly secondary in hierarchy
- it can contain one small chart and one short summary line

Positioning rules:

- place the hover card where it does not obscure the most important chart reading
- if the right side of the chart needs more breathing room, move the card to the left
- adjust card width and internal chart height separately; do not confuse layout position with chart scaling

## Card sizing and movement rules

When the user comments on the size or position of a hover card, distinguish carefully between:

- overall card width
- overall card position
- internal chart height
- visual padding inside the card

These are different levers and should not be changed interchangeably.

If the user says:

- `make the container narrower` -> reduce card width
- `move it upward` -> adjust top/position, not internal chart height
- `the whole block should move up` -> make sure the card bottom also rises; do not only change top while expanding internal content

## Axis minimalism rules

When a chart already labels every important value directly, the axis should become quieter.

That means:

- axis labels may be reduced or removed if direct labels already carry the numbers
- keep axis lines and ticks minimal
- axis typography should stay consistent with neighboring charts on the page or section

Do not keep loud axes and full direct labeling at the same time unless the chart truly needs both.

For consistency, if the user requests it, match axis font size and color to an existing approved chart such as the page 2 social listening spread.

## Title alignment rules

Title alignment can differ by line. Do not assume one alignment rule applies to every line in a chart panel.

Possible valid pattern:

- small kicker left-aligned
- main chart title centered
- summary centered

If the user specifies alignment at this granularity, preserve it exactly.

Do not silently re-center or left-align all title elements together after later layout edits.

## Tmall industry page defaults

For the `Tmall Industry` page in this report, the approved logic now includes a market landscape hero chart.

Preferred expression:

- one hero bubble landscape chart as the main evidence
- focus category highlighted clearly
- an optional hover detail card for `Sunscreen Jacket` monthly share and YoY
- the detail card should not permanently steal equal visual weight from the hero chart

Approved chart naming pattern:

- `25 SS Tmall Outdoor Market Landscape`
- `25 SS Sunscreen Jacket Share in Outdoor Market`

Approved visual logic:

- `MARKET LANDSCAPE` kicker can stay left-aligned
- main chart title can be centered
- supporting summary may be removed entirely if it costs too much chart space
- the page should feel more open than a two-chart spread

## 16:9 page behavior

This report should now bias toward a stronger `16:9` deck feeling rather than a generic long webpage feeling.

That means:

- keep page width stable
- let page height feel closer to a presentation slide
- rebalance internal whitespace after changing the page ratio
- do not assume old webpage spacing rules still work once the page feels like a slide

Important:

- changing the outer page ratio is not enough
- each page layout must be rebalanced after the ratio changes

## Page density rules

Different page types need different density.

### Paired-chart pages

For pages like `Social Listening`, the reader expects the page to feel full and stable.

Preferred behavior:

- title and bullets at top
- chart row should sit lower on the page
- chart containers should expand vertically when needed to absorb dead space
- do not leave a large empty band between bullets and the chart row

When a paired-chart page has too much empty space:

- first increase chart container height
- then increase chart canvas height
- do not immediately add more text or filler modules

### Single-chart pages

For hero-chart pages like `Tmall Industry`, the page should feel more open.

Preferred behavior:

- keep one dominant chart
- let the chart breathe
- do not compress the chart just to mimic a paired-chart spread

But also:

- do not let the hero chart become so tall that it overpowers the whole page
- keep page 3 and later single-chart pages visually related to neighboring pages

## Vertical spacing diagnosis

When the user says a page feels wrong vertically, distinguish between these cases:

- `the chart block is too high` -> move the chart group downward
- `there is too much space above the chart` -> increase chart container height so the gap is consumed
- `the page footer area is too empty` -> reduce bottom spacing or let the footer sit closer
- `the page feels cramped` -> relax spacing and allow the chart more height

These are not the same fix.

Do not solve:

- a container-height problem by only changing a margin
- a position problem by only changing internal chart height

## Insight-to-chart spacing

The distance between insight bullets and the first chart row matters a lot in this deck.

Rules:

- this gap should feel intentional but tight
- avoid large blank bands between the section bullets and the chart area
- if the user says the gap is too large, reduce section-to-chart spacing before adding more explanatory text

The top reading path should remain:

- chapter label
- takeaway
- bullets
- immediate transition into evidence

## Title alignment rules for chart panels

Chart panel title blocks may use mixed alignment within the same panel.

Approved pattern from this project:

- kicker can stay left-aligned
- main chart title can be centered
- summary can be centered or removed

Do not force every line in the title block to share one alignment.

If the user specifies the alignment of a specific line such as `MARKET LANDSCAPE`, preserve that exact instruction.

## Headline length and layout rule

Headline wording is also a layout decision.

In this report, a headline that is technically correct can still be wrong if it damages page balance.

Especially for paired-chart pages:

- long English headlines can easily consume too much vertical space
- once a headline wraps into multiple heavy lines, it pushes bullets and charts downward
- this can make the whole page feel broken even if the chart code is correct

Preferred rule:

- compress the headline until it reads in one scan
- use shorter strategic language rather than fully spelled-out explanation
- treat title length as part of page composition, not only as copywriting

If a page feels structurally off, always check whether the headline is too long before changing chart sizes.

Good behavior:

- shorten the conclusion while preserving the judgment
- prefer a tighter strategic sentence over a fully descriptive sentence

Bad behavior:

- letting a headline become a paragraph
- keeping a long title just because the wording sounds precise

For this project, a shorter headline that preserves the decision meaning is usually better than a literal long one.

## Paired-chart fill rules

For pages with two charts in one row:

- use the available slide height
- if there is a large empty band above the chart row, prefer increasing panel height
- chart canvases may be increased substantially if needed
- the two panels should stay the same height

The desired feel is:

- not cramped
- not floating in a sea of whitespace
- visually anchored in the page

## Hover-card role rules

When a hover detail card exists inside a hero chart page:

- it is secondary
- it should not compete with the hero chart title area
- it may sit over the chart plotting area
- its internal chart can be smaller than the main plot

If the user comments on hover-card placement:

- interpret `move up` as moving the whole card block
- interpret `make narrower` as reducing overall card width
- interpret `top moved but bottom did not` as a sign that internal chart height is still too large

## What the user now clearly wants

The user preference expressed through iteration is:

- restrained consulting-deck pages
- more `16:9` slide feeling
- no wasted dead zones
- no accidental giant blank bands
- chart containers that are sized to the page rather than left at default web heights
- single-chart pages that feel open
- paired-chart pages that feel filled
- title alignment handled intentionally line by line

Future edits in this project should assume these preferences by default unless the user overrides them.

## Page containment rule

Every page must fit fully inside the visible `16:9` page frame.

Hard rule:

- the footer must remain inside the page
- no chart, note, or panel may push the footer outside the sheet
- no page should silently overflow just because another page used a taller chart

If a page overflows:

- first reduce unnecessary text
- then rebalance spacing
- then reduce panel height or chart height
- only after that consider changing the overall page composition

Do not accept a layout where `Data source / Page xx` falls outside the visible page area.

## Hero chart plotting-area rules

When a single-chart page uses one hero visualization, do not think only in terms of `container height`.

You must separately evaluate:

- panel height
- chart canvas height
- chart grid top/bottom/left/right
- whether axis titles or helper text are stealing plotting space

If the user says the chart still has dead space inside the panel:

- first tighten grid top/bottom
- then remove expendable helper text
- then reconsider axis-title placement

Do not keep a large empty plotting band under the last visible data points.

## Bubble chart spacing rules

For bubble or scatter hero charts:

- the plotting region should use as much of the panel as possible
- remove low-value explanatory text if it costs plotting space
- labels should not be so numerous that they create a pale cloud
- the right-top helper note such as `Bubble size = GMV` must not collide with grid lines or the panel edge

When helper text overlaps:

- move it inward first
- reduce clutter second
- only remove it if it is no longer necessary

## Axis-title and tick rules

If the user asks to keep an axis title such as `Market Share`, preserve it.

But:

- make sure grid bottom leaves enough room for it
- do not clip axis titles or ticks by over-compressing the chart
- if the user requests `10%` steps, explicitly set the interval
- when ticks are requested, show them intentionally instead of relying on defaults

The approved logic now includes:

- horizontal value axes may use explicit `10%` intervals
- axis ticks can be visible when they help a market map feel more legible
- axis typography should still match the approved page 2 style

## Single-chart page whitespace balancing

For single-chart hero pages, there are two different whitespace problems:

1. empty space between bullets and the chart block
2. empty space inside the chart panel below the plotting region

These require different fixes.

If the user says:

- `the chart should come down` -> adjust page-level placement or panel height
- `there is still empty space inside the chart` -> adjust chart grid and plotting region, not only panel position

Do not confuse these.

## Annotation collision rules

When chart labels, helper notes, or icons begin to collide with grid lines, borders, or nearby marks:

- move the annotation inward or away from the edge
- avoid leaving labels flush to the boundary
- prefer small positional corrections over introducing new modules

This is especially important for:

- top-right bubble-size notes
- end labels on line charts
- helper notes inside hover cards

## Page 3 approved behavior

The current `Tmall Industry` page now establishes these approved defaults:

- `MARKET LANDSCAPE` kicker left-aligned
- hero title centered with icon
- helper summary removable if it steals too much plotting area
- bubble chart is the main evidence
- hover detail card is secondary
- x-axis title may remain visible if requested
- x-axis tick interval can be fixed at `10%`
- chart should expand downward inside the panel until dead space is minimized

This page should feel like:

- one hero market map
- one secondary drill-down
- strong use of horizontal space
- minimal wasted vertical space inside the chart region

## Data hygiene reminder

Before building pages, clean the data first when needed:

- brand aliases
- duplicate spellings
- outlier labels
- mixed-language naming inconsistencies
- low-sample brands that should not drive conclusions

The page should not be forced to compensate for dirty data through explanation.

## Practical build workflow for this project

When editing `27SS防晒衣开发报告.html`, follow this workflow:

1. Read the current section
2. Decide whether the page already has a clear takeaway
3. Remove any modules that feel like dashboard leftovers
4. Rewrite the headline into a direct conclusion
5. Replace long subtitles with bullet insights
6. Tighten chart titles and reduce chart descriptions
7. Make sure the page reads top-down as a clean story
8. Run a quick syntax check on the final script block if needed

## Validation checklist

Before finishing, verify all of the following:

- Can the page be understood in under 10 seconds by reading the title and bullets?
- Does the page show only the evidence needed for that takeaway?
- Is there any repeated analysis that should be deleted?
- Does the layout feel like a report page rather than a dashboard?
- Are the bullets sharper than a paragraph subtitle would be?
- Is the chart area visually cleaner than the heading area?
- Is the page width controlled and not too sprawling?
- Does the page feel closer to `Outer JP Labeling report 0325_final.html` than to a generic analytics UI?

If any answer is no, simplify.

## Final rule

This skill should bias toward:

- fewer modules
- stronger conclusions
- tighter charts
- quieter pages

The report wins when it feels inevitable, not elaborate.

## Competitive structure page defaults

For the `Competitive Structure` page in this project, the approved logic now includes:

- left chart = brand ranking
- right chart = seasonal structure shift
- left chart should use `MS` as the primary visual
- `YoY` and `ASP` should be secondary reading columns, not competing hero signals
- the right chart should compare `Local / Global / Others`
- if the right chart needs a summarized change callout such as `+7.6ppt`, place it between the title area and the chart, not floating inside the plot

This page should read as:

- who holds share
- where growth is shifting
- what that means for 27SS positioning

## Color semantics for competitive pages

For page 4 and any related competitor-structure pages, use one stable color language across all charts on the same page.

Approved mapping:

- `Global = navy` such as `#1b2a4a`
- `Local = blue` such as `#6f8fc2`
- `Others = light gray` such as `#c9d0da`

Rules:

- the same segment must not change color between the left and right charts
- legend swatches, bars, stacked columns, and any supporting labels should use the same mapping
- if the current colors feel too close, increase contrast before adding more annotations
- avoid using a separate highlight color unless the user explicitly requests it

## Legend rules for semantic colors

When color carries category meaning rather than mere series identity:

- provide a legend by default
- keep the legend quiet and close to the title block
- do not rely on color alone when three structural segments are being compared
- if a chart becomes crowded, reduce legend size before removing it

Preferred order:

- title
- short summary
- legend
- optional delta row
- chart

## Delta-row rules

When the page needs to emphasize structural change such as `Global Top 10 +7.6ppt`:

- prefer a small HTML text row under the summary
- do not place these callouts as floating `graphic` annotations inside the ECharts plot unless there is a strong reason
- keep the row centered and compact
- use positive/negative semantic color sparingly
- do not let the delta row become visually louder than the chart title

## Horizontal vs vertical chart choice

Use orientation based on the question, not on habit.

Preferred rules:

- brand ranking -> horizontal bar
- structure mix with only 2 seasons -> either `100% stacked bar` or `100% stacked column`
- if the comparison is mainly about `before / after` across seasons, a vertical `100% stacked column` is acceptable
- if labels become cramped or the page overflows, revert to the orientation that reads more cleanly

Do not force a vertical chart if:

- the page height becomes unstable
- labels must be heavily squeezed
- the footer begins to overflow

## Footer containment and chart-height rules

This report now clearly requires footer-safe layouts.

## Vertical rhythm is non-negotiable

This is now a top-priority rule for the whole report.

Whenever creating a new page, revising a page, or changing chart types, check the vertical rhythm before considering the page finished.

Core principle:

- the page should feel vertically balanced in the same way as neighboring pages
- insight-to-chart spacing, chart-to-footer spacing, and total chart-row placement must feel intentional and consistent
- a page is not acceptable if the chart is technically correct but the vertical rhythm feels wrong

Hard rules:

- do not treat vertical spacing as a final polish step
- do not assume a page is correct just because every module fits inside the frame
- if a page feels different from adjacent pages in how the chart block sits vertically, treat that as a layout problem that must be solved
- chart rows must not look accidentally pinned to the top or bottom unless there is a deliberate reason

When building or revising a page, always check:

1. distance from bullets to chart row
2. chart row placement inside the page frame
3. panel bottom vs footer spacing
4. whether leftover space is above the chart row, inside the chart panel, or below the panel

Preferred decision order:

1. check page-level row alignment
2. check panel height and internal padding
3. check chart container height
4. check ECharts `grid`

Do not:

- solve a page-level vertical-rhythm issue only by changing chart height
- solve a plotting-area issue only by changing `align-self`
- accept mismatched whitespace just because the chart content itself looks good

This project now clearly requires:

- stable page-to-page vertical rhythm
- chart blocks that feel anchored the same way across the deck
- no accidental giant blank bands
- no pages where the chart appears to float because the middle layout track was misallocated

Hard rules:

- `Data source / Page xx` must remain fully inside the visible page frame
- if the footer overflows, reduce chart height or title-block height before changing the overall page ratio
- when increasing chart height, also review panel height, internal padding, and chart grid
- do not keep increasing `chart height` alone if that causes the right panel to exceed the left panel or pushes the footer outside the page

When the user points at blank space:

- determine whether the blank space is in the chart canvas, the chart panel, or the page below the panel
- fix the correct layer rather than applying a generic height increase

## Plotting-area diagnosis language

The user now clearly distinguishes between:

- outer panel height
- chart container height
- ECharts plotting area (`grid`)

This distinction should be preserved in future edits.

When the user points at a blank band and says it should be given to the chart, interpret that as:

- the blank space has no business meaning
- the blank space should be allocated to the plotting area if possible
- simply increasing the outer card height is not sufficient

Preferred diagnostic sequence:

1. Check whether the blank space is outside the `.chart` container
2. Check whether it is inside the `.chart` container but outside the ECharts `grid`
3. Check whether axis titles, helper notes, or legends are consuming the bottom plotting area
4. Only then decide whether to change `panel`, `.chart`, or `grid.bottom`

Use this language internally and when explaining tradeoffs:

- `This blank space is in the panel, not in the plotting area.`
- `ECharts can only use space inside its mounted chart container.`
- `The chart height increased, but the plotting area did not expand because the grid/panel relationship did not change.`
- `The request is to give this space to the plotting area, not merely to enlarge the card.`

Do not confuse:

- `make the card taller`
- `make the chart container taller`
- `give more height to the plotting area`

These are three different requests and require different fixes.

## Paired-chart height alignment

For paired charts on the same row:

- left and right panels should share the same bottom edge
- panel heights should feel intentional and aligned, even if the chart types differ
- when one panel grows because of a taller chart, check whether the paired panel should stretch with it or whether the taller chart should be compressed
- do not accept accidental mismatched card bottoms as a final state

## Page-level chart-row alignment

When a page uses a layout such as:

- `content-frame = auto / 1fr / auto`
- top = title and bullets
- middle = chart row
- bottom = footer

be careful with how the chart row is aligned inside the middle track.

Rules:

- if the chart row uses `align-self: end`, the charts will sit at the bottom of the middle track
- this can create an unnecessarily large blank band between the insight bullets and the charts
- if the user points out that the insight-to-chart gap is larger than on other pages, inspect `align-self` before changing chart height
- for report pages like `Gender Structure`, default to keeping the chart row closer to the top of the available middle track unless there is a strong reason not to

Preferred diagnosis:

- if the blank space is between the bullets and the chart row, it is often a page-level row-alignment problem
- if the blank space is below the chart inside the card, it is often a panel/chart/grid problem

Do not solve:

- a row-alignment problem by only increasing chart height
- a chart-grid problem by only changing `align-self`

## Brand naming rule

Brand names on competitor pages should follow one consistent naming style.

Preferred pattern:

- `English/中文`

Examples:

- `Beneunder/蕉下`
- `BANANAIN/蕉内`
- `THE NORTH FACE/北面`

Rules:

- if a brand has a well-known English name, include it
- do not leave one brand Chinese-only while the rest are mixed-language unless there is a clear reason
- keep naming consistent across chart labels, tooltips, and bullets

## Gender-structure page defaults

For the `Gender Structure` page in this project, the approved logic now includes:

- left chart = industry gender share
- right chart = brand-by-gender bubble landscape
- left chart may use real current-season share plus inferred prior-season share when only current share and YoY are available
- gender labels should stay in English: `Male / Female / Uni`
- the right bubble chart should keep clickable legend filtering when that improves readability
- bubble labels may use dark text on light bubbles instead of forcing white labels everywhere

Approved color mapping:

- `Male = blue`
- `Female = pink`
- `Uni = green`

If YoY values need to sit near the stacked bar:

- place each YoY value next to its corresponding `25SS` segment
- do not present the three YoY values as an unrelated floating column if the user wants segment-linked reading

## Bubble-chart readability and outlier treatment

For report-style bubble charts in this project, readability takes priority over mechanically plotting every value without adjustment.

Hard rules:

- do not allow one or two extreme values to destroy the readability of the full landscape
- keep raw values in tooltip even when the plotted position is visually capped for readability
- if an outlier is real but visually destructive, prefer controlled treatment over deletion

Preferred treatment order:

1. keep the chart linear where business reading depends on directional intuition
2. cap plotted display for extreme `YoY` values when needed
3. keep true values in tooltip
4. add explicit label handling for capped points if needed

Do not:

- let one extreme `YoY` compress every other point into the bottom band
- quietly delete extreme points just because they are hard to plot
- assume statistical purity matters more than report readability

## Axis semantics for business charts

Axis choice should follow business reading, not mathematical neatness.

Rules:

- `ASP` may use `log` when it improves separation across price bands
- `YoY` should default to a linear axis unless there is a very strong reason otherwise
- business-facing charts should use clean, business-readable ticks rather than awkward decimal ticks

Preferred examples:

- `50% / 100% / 150% / 200%`
- not `49.8% / 99.8% / 149.8%`

If negative values must remain in the plotting area:

- keep the negative range for point placement if needed
- but it is acceptable to suppress negative tick labels when the main read should stay focused on the positive growth ladder

## Label and color role separation

When color already encodes a category clearly, labels should not repeat that same category unless interaction requires it.

For the `Gender Structure` bubble chart:

- bubble color carries `Male / Female / Uni`
- labels should default to English brand names only
- do not append gender suffixes to every label if color already makes the segment obvious

Interaction rule:

- when the legend is used to isolate one gender, labels must still remain fully readable
- users should not end up with anonymous bubbles after filtering

## Relative label positioning for bubbles

Bubble labels should not rely on one fixed placement rule such as always `inside` or always `top`.

Preferred logic:

- decide label position based on local density, bubble size, edge proximity, and capped-axis behavior
- use relative positioning within local clusters
- when multiple points are pushed to the top by a cap, push labels outward so they do not all sit on the same horizontal line

Rules:

- if a capped point approaches the legend zone, first create more top grid space, then refine label offsets
- small bubbles may move labels outside the bubble for readability
- large bubbles may keep internal labels when contrast is sufficient
- use stable directional logic rather than random offsets

Do not:

- allow top-capped points to collide with the legend
- force every label inside the bubble if that harms legibility
- fix overlap only brand-by-brand before checking whether a relative layout rule can solve it more generally

## Legend and plotting-area relationship

Interactive legend filtering is valuable and should be preserved when it improves reading.

Rules:

- keep clickable legend behavior when it helps the user inspect one segment at a time
- reserve explicit space for the legend so capped points or labels do not overlap it
- if the top of the plot feels crowded, check `grid.top` before removing useful chart features

Do not:

- solve a legend-overlap issue by deleting the legend if filtering is useful
- treat legend area as free plotting area if the page depends on interactive filtering

## Brand-name presentation in labels

Brand names in bubble-chart labels should follow a clean English-display rule.

Rules:

- labels on the chart should use English brand names unless a specific exception is requested
- preserve preferred capitalization for brand names where relevant
- keep tooltip or supporting context available for the full mixed-language form when needed

Example:

- use `Lululemon`, not all-lowercase `lululemon`

## Controlled distortion is allowed for readability

This report allows controlled visual adjustment when it improves comprehension without changing the conclusion.

Accepted techniques include:

- capped plotted positions
- selective label display
- relative label offsets
- log scaling on appropriate business axes
- suppressing low-signal tick labels

Principle:

- the chart should remain truthful in conclusion, even if the geometry is slightly normalized for reading
- visual design should support interpretation, not mirror raw export behavior

## Functional-needs and scenarios page defaults

For the page after `Gender Structure`, the current approved direction is:

- one page about `Functional Needs` and `Usage Scenarios`
- top message = female growth is strongest in selected lightweight / wear-resistant / commute / light-outdoor spaces
- one framed evidence area can contain both the function view and the scenario view
- use one compact metric strip or mini-table above the lower charts when it helps summarize high-signal dimensions

Preferred page anatomy:

1. section title with one clear conclusion
2. 2-3 bullets translating the conclusion into action
3. one framed evidence board
4. left side = functional-needs read
5. right side = usage-scenarios read

Preferred chart logic:

- bubble size = absolute sales or GMV size
- color = `Male / Female / Uni`
- left chart can compare function clusters
- right chart can compare scene clusters
- if female opportunity is the main message, use subtle annotation to highlight the female-growth cluster rather than adding more modules

Avoid:

- treating the page like four separate widgets
- placing many disconnected KPI cards above the charts
- repeating the same `female growth` message in title, subtitle, annotation, and footer

## Direction-page grammar for development use

When the deck starts translating evidence into development directions, the page unit should no longer be an abstract strategy statement.

For this project, direction pages should default to:

- `gender × scene × function`

Not:

- generic strategy pillars
- long implication cards
- one page of abstract recommendations
- single-function statements with no scene context

The page must help a designer answer:

- which scene is worth developing?
- in that scene, which functions have meaningful share?
- in that scene, which functions show the best growth?
- which tag combination is worth prioritizing or testing?

If a direction page cannot help answer those questions quickly, it is not specific enough.

## Trend-definition page rules

When a page is defining `3 development directions` for the brand, it must separate:

- shared foundational needs
- female-specific needs and design response
- unisex/shared-fit needs and design response

This page type is not a full design-solution page.

Its job is to:

- define the directional framework
- identify the few needs that matter most
- leave space for later pages to expand design details and image references

Do not write this page as if all design solutions must already be resolved.

## Shared vs specific logic is non-negotiable

For pages that split directions into `shared / female / unisex`, use this hierarchy:

1. `Direction 1` = shared foundational functional needs
2. `Direction 2` = female-specific needs plus female design response
3. `Direction 3` = unisex/shared-fit needs plus utility design response

Hard rules:

- `Direction 1` must not take too many silhouette or detail ideas from `Direction 2` or `Direction 3`
- `Direction 1` should focus on shared functional needs, fabric response, and wear comfort
- `Direction 2` should focus on what is specifically needed for female product expression
- `Direction 3` should focus on what is specifically needed for unisex/shared-fit product expression

If `Direction 1` starts talking too much about shape, pockets, plackets, utility lines, or gendered proportion, it will conflict with the later directions and must be simplified.

## Shared direction should stay narrow

The shared direction is not a catch-all summary of every good idea.

It should usually answer only:

- what core functional needs are shared?
- what material or fabric direction responds to those needs?
- what wearing comfort should the product deliver?

Preferred pattern for the shared direction:

- `Function Need`
- `Material Response`
- `Wear Comfort`

Avoid:

- listing too many functions
- turning the shared direction into a full product concept
- using the shared direction to solve female proportion or unisex utility detail

If the shared direction starts to feel too complete, it is probably over-expanded.

## Specific directions should add only 1-2 needs

For female-specific and unisex-specific directions, do not repeat a full function system after the shared base has already defined the common needs.

Preferred logic:

- first acknowledge the shared functional base
- then add only `1-2` additional needs that are truly distinctive
- then connect those needs to silhouette, proportion, fit, or detail direction

Examples:

- female-specific direction may add `quick dry` and `stretch`
- unisex/shared-fit direction may add `windproof` and `water-repellent`

Do not let `Direction 2` and `Direction 3` become long parallel lists of many functions.

The point is to isolate what is additionally important, not to restate the whole base.

## Need-first writing rules

For design-direction pages, the wording should follow this sequence:

1. `Need`
2. `Design response`
3. `Expandable detail system`

This means:

- the need is the strategic reason
- material or fabric is the response to that need
- silhouette, fit, or detail is the design expression

Do not invert this logic.

Bad pattern:

- starting from a fabric as if the fabric itself is the strategy

Better pattern:

- define the need first
- then say how material, fit, or detail responds to it

For example:

- better: `Use light shell-touch fabric to respond to windproof and water-repellent utility needs`
- worse: `Shell-touch fabric is the core direction`

## Design points must be expandable

Every design point on a direction page should be able to expand naturally into a later page with:

- more granular design bullets
- silhouette or detail references
- product image references
- styling boards

Therefore, design points should not be:

- too vague
- too conversational
- too final
- too broad to visualize

Preferred design-point language:

- `cropped proportion`
- `soft waist shaping`
- `shared H-line fit`
- `utility pocket system`
- `curved seam detailing`
- `light shell-touch material response`

Avoid language like:

- `make it feel nicer`
- `do it in a more feminine way`
- `build the whole story here`

If a point cannot be visualized in a later image page, it is not yet a strong enough design point.

## PPT wording rules for design directions

Direction-page copy should read like deck language, not spoken explanation.

Avoid:

- `先把...做出来`
- `让它...`
- `后面更容易...`
- `不是...而是...` repeated too often
- overly conversational causal phrasing

Prefer:

- `建立...需求`
- `回应...需求`
- `承接...功能`
- `强调...属性`
- `延展为...细节系统`
- `强化...比例`

The tone should feel:

- concise
- strategic
- visualizable
- appropriate for a PPT

Not:

- chatty
- explanatory in a spoken way
- overloaded with soft transitions

## Data-support rules for trend-definition pages

`Data Support` on direction-definition pages should not behave like a tag dump.

It should use a small number of clearly named evidence slots.

Preferred evidence slots:

- `Target Base`
- `Core Scene`
- `Scale Function`
- `Growth Function`
- `Female Need`
- `Utility Need`
- `Brand Validation`
- `Design Cue`

Not every card needs every slot.

Choose only the slots that actually strengthen the direction.

## Evidence-type split by direction

For this project, the preferred evidence split is:

- `Direction 1` shared base -> mostly function data
- `Direction 2` female-specific -> function need data plus, when available, female-oriented brand or design validation
- `Direction 3` unisex/shared-fit -> utility need data plus, when available, shared-fit or unisex brand / design validation

Hard rules:

- do not force design raw-data evidence where the data is weak or not clean
- if female design-tag evidence is not strong enough, use function need evidence and brand validation instead
- if unisex design-tag evidence exists, it may be used, but only when it reads cleanly

Do not invent a false symmetry where all three cards use the same evidence type just because the layout is parallel.

## Do not let data support repeat the card conclusion

The support box should add evidence, not restate the same message in different words.

Avoid evidence rows like:

- `Direction cue: this supports the direction`
- `This means the direction is valid`

Prefer:

- specific percentages
- specific YoY values
- specific brand validation
- specific scene/function combinations

If a support row sounds like a summary sentence rather than a data point, it is probably redundant.

## Direction-page summary rules

Top-of-module summaries on direction pages are for fast reading, not for repeating the full analysis.

Rules:

- do not write long paragraph summaries above a direction matrix
- prefer `2-3` short judgment lines or scene-specific summary lines
- if a module contains three scenes, it is often better to summarize them as three short scene rows than one large paragraph
- summary copy should help a designer scan the page, not explain every rationale in prose

Preferred pattern:

- scene name
- one short judgment
- one short qualification if needed

Bad pattern:

- one long paragraph that mixes all scenes together
- repeating the same logic already visible in the matrix below

## Complete scene matrix rule

When a page compares development directions across scenes, keep the scene set complete.

Rules:

- if the approved scene system contains three scenes, show all three scenes
- do not hide weaker scenes just because they are not the recommendation
- weak scenes should be visually weakened, not removed
- each scene should carry an explicit status such as:
  - `主方向`
  - `补强方向`
  - `观察方向`
  - `弱化方向`

This helps the designer understand:

- what to prioritize
- what to keep as backup
- what to watch
- what not to over-invest in

## Matrix alignment is non-negotiable

In matrix pages, horizontal alignment across comparable information layers must stay stable.

Hard rules:

- the same layer of information must sit on the same horizontal track across neighboring columns
- if one column has more chips or longer content, do not let that push the next labeled row downward
- labels such as `占比高功能`, `主开发组合`, `增速好功能`, and `增长组合` must align across columns

Preferred implementation:

- use fixed row tracks or minimum heights for repeated content layers
- stabilize chip regions so they do not unpredictably push the result rows
- if needed, reduce chip count before accepting broken alignment

Do not:

- accept a matrix where the reader has to zig-zag vertically because each column drifts
- solve alignment issues only by shrinking text while keeping unstable track logic

## Growth is not enough on its own

Direction decisions must not be made from `YoY` alone.

Rules:

- any direction judgment must consider both scene scale and function trend
- very high growth does not automatically equal a primary development direction
- when a scene or function shows extreme `YoY`, explicitly check whether the base is very small
- if the base is too small, present it as a test, watch point, or weak direction rather than a primary story

Preferred reading order:

1. scene scale
2. leading functions by share
3. strongest functions by growth
4. then decide whether the direction is primary, supporting, observational, or weak

## Use scene-level function evidence, not generic wording

For development-direction pages in this project, support should come from actual raw-data aggregation at:

- `gender × scene × function`

When available, use that evidence directly rather than writing generic strategy copy.

Preferred evidence types:

- scene share
- scene YoY
- top functions by share within scene
- top functions by growth within scene
- a short recommended combo built from those signals

Do not:

- write a direction card based only on general intuition
- promote a combo without showing whether it has share, growth, or both

## Icon use on direction pages

Direction pages may use small scene icons when they improve scan speed, but icon use must stay restrained.

Rules:

- icons must clarify scene type, not decorate the page
- scene icons should sit next to scene names only
- keep icons smaller than the text cap height or very close to it
- if local `file://` constraints make resource loading unreliable, prefer inline SVG over external asset or data-URI approaches
- use the same icon logic in summary rows and scene pills if both appear on the same page

Do not:

- add large decorative illustrations
- use icons that compete with the title or evidence
- introduce a separate icon language on one page only if the rest of the page does not support it

## Color-read page safety and layout rules

For `Color Read` pages like `14A`, preserve a stable, low-risk editing workflow. These pages often sit inside one large HTML file with CSS, HTML, and JS mixed together, so deletion and refactor work must be handled more conservatively than normal page edits.

### Hide pages before deleting them

If the user says a page such as `14` is no longer needed:

- hide the page before attempting to delete it
- remove its visible navigation entry
- remove it from grouped section toggles such as `data-sections`
- keep the underlying page HTML in place unless the user explicitly asks for full removal

Do not:

- delete a whole page block and its related script/config sections in one pass unless you have first confirmed the page still renders
- use broad regex replacement across the whole file as the default strategy for page removal

### Avoid whole-file rewrites in encoding-damaged HTML

If the report file already contains mojibake, broken Chinese text, or mixed encoding artifacts:

- prefer small local edits
- patch specific lines or blocks only
- avoid `Get-Content -Raw` plus global replace plus `Set-Content` across the whole file
- treat script strings as high risk even when the change request sounds simple

Do not:

- rewrite the whole HTML file just to remove one section
- assume malformed display text is harmless if it lives inside JavaScript strings

### Approved `14A` page grammar

The approved page grammar for the current `14A` color-read page is:

- one concise title line whenever possible
- a small gender toggle that does not steal vertical space
- left panel = ranked color structure chart
- right panel = image references only
- no black product row on the right reference panel
- each color group sits on its own horizontal row
- each row uses `5` images

Preferred current color rows:

- male: `Grey / Beige / Blue / Green`
- female: `Grey / Cream / Green / Purple`

### Color naming must stay synchronized

When changing color names on a color-read page:

- update the left chart label
- update the right image-row label
- update the support copy
- update any footer or conclusion sentence that refers to the same palette

Do not:

- keep `Brown` in one place and `Beige` in another
- keep `White` in one place and `Cream` in another if the page has already shifted to `Cream`

### Product-image grid rules

For right-side product reference grids:

- use fixed row height or fixed `grid-auto-rows`
- do not rely only on `aspect-ratio` when rows are tightly stacked
- keep hover scale restrained so one card does not collide with the next
- only apply zoom-style hover behavior when a real image exists
- allow click-to-enlarge preview when the page is being used as a review board

Do not:

- let image cards overlap vertically
- let placeholder cards animate as aggressively as real cards
- accept dashed placeholder styling in the final review state if the user wants a cleaner page

### Left-panel whitespace rule for `14A`

If the user says the left chart has too much blank space below the ranked rows:

- first make the rank list consume the available panel height
- then distribute the rows across the available space
- treat this as a panel-fill problem, not a title-copy problem

Do not:

- leave all seven rows compressed at the top while the panel bottom stays empty

### PPT image intake workflow

When product images live inside PowerPoint rather than normal folders:

- do not require the user to manually export and rename every file before you can help
- prefer a clipboard-based save workflow
- support sequential naming such as `male-grey-01` to `male-grey-05`
- store extracted references under a local folder such as `refs/page14a`

Preferred flow:

1. copy image from PowerPoint
2. save clipboard image into the target folder with the next sequence name
3. wire the saved file into the corresponding HTML slot

### Recovery rule after risky edits

If a page suddenly becomes blank after structural edits:

- assume script corruption before assuming styling failure
- restore from the last known-good local copy first
- then re-apply only the minimum necessary hide/show changes

Do not:

- continue layering layout tweaks on top of a blank page
- keep editing until the root cause of the white screen is understood

## Page 12 extension-board rules

For the current `Page 12 / Female Extension Board`, use a stable split-screen grammar rather than treating the page as a generic image board.

Approved page logic:

- left = `SNS 数据支持`
- right = female design-reference wall plus fabric-tech support

This page should feel like a restrained trend-support sheet, not a moodboard and not a dashboard.

### Left-side support panel rules

The left side is a compact support panel, not a conclusion module.

Rules:

- use the title `SNS 数据支持`
- do not keep extra English kicker copy like `SNS Data Support` unless explicitly requested
- do not place long explanatory conclusions in this area
- do not include `轻量 Lightweight` in the current Page 12 left support block
- keep only the user-approved signal tags such as `短款`, `修身`, `收腰`

Preferred content per support item:

- tag name
- total volume
- total YoY
- one compact monthly read for `Apr-Jul 2025`

### Left-side chart style rules

The support panel may use simple charting, but it must stay quiet and scan-friendly.

Rules:

- prefer compact evidence graphics over decorative charts
- keep monthly comparisons readable at normal report zoom
- positive growth should be green
- negative growth should be red
- avoid dashboard-like KPI tiles
- avoid over-annotated chart blocks
- avoid chart styles that look like mini BI widgets

Approved direction:

- clean monthly support graphics
- crisp labels
- minimal legend logic
- no repeated conclusion sentence under each chart

If a chart style feels noisy or over-designed, simplify it.

### Right-side image-wall rules

The right side should behave like a grouped visual reference wall.

Rules:

- keep the board on a white background
- use deep-blue title bars with white text for each visual module
- title bars should be slim, not heavy
- title bars may be slightly wider than the image grid, but must never collide with neighboring modules
- image groups should be visually centered under their own title bars
- image width and spacing should be adjusted separately
- do not change image size when the real request is about image gap

Hard distinction:

- `image size`
- `image gap`
- `module gap`

These are different controls and should not be conflated.

### Image-display rules

For Page 12 reference images:

- keep image size fixed once approved by the user
- change `column-gap` only when the user asks to increase the whitespace between images
- keep module spacing separate from image spacing
- when the user says the blank area inside a module is too large, first consider widening inter-image spacing before changing the overall module frame
- keep the image groups visually balanced under the title bars

### Fabric-tech module rules

The fabric-tech area is not just an image placeholder block.

It should behave like a mini material-support module with:

- a deep-blue title bar
- 2 material columns when the user only wants 2 fabrics
- each material column containing:
  - material name
  - one `Function:` line
  - one material image

Approved current material wording pattern:

- `1. [BRAND] [FABRIC NAME]`
- `Function: ...`

Rules:

- do not force four equal cards if the user only wants two fabrics
- treat fabric images as material-reference images, not model-look images
- for wide material images, prefer `contain`
- do not crop away key text or material information
- allow material-image height to stay flexible when width-led layouts read better
- if width needs to be reduced, reduce width without distorting ratio

### Page 12 writing rules

Top title area rules:

- keep the headline on one line whenever possible
- keep exactly two short insight lines if the user asks for insights
- do not turn the subtitle area into a long paragraph
- keep the page explanation short and deck-like

The tone should feel:

- edited
- evidence-led
- visually quiet
- suitable for a strategy deck

Not:

- dashboard-like
- decorative
- over-explained
- multi-module and noisy
