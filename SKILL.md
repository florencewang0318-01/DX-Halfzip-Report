---
name: sunscreen-report-deck
description: Use when creating, revising, or extending the sunscreen apparel report in this project. This skill is for editing the consulting-style report/deck surface, not a dashboard: update page structure, section copy, charts, direction boards, image walls, color-read pages, and the single-file build workflow while preserving the project's modular src-to-dist pipeline, restrained premium styling, and evidence-led page grammar.
---

# Sunscreen Report Deck

Use this skill for the report in this repository.

This project is not a dashboard and not a generic webpage.
It is a restrained consulting-style deck built from modular source files and shipped as one standalone HTML.

## Project Model

Treat the repo as a maintained source project, not a single giant HTML file to freestyle inside.

Primary source files:

- `src/template.html`: page skeleton and stable structure
- `src/styles.css`: shared layout, spacing, and visual system
- `src/content-data.js`: page copy, page data objects, section registries, board content
- `src/content-render.js`: DOM render helpers and section binding
- `src/content-bootstrap.js`: startup wiring, chart init, lightweight interactions
- `src/chart-app.js`: ECharts option logic and chart-specific behavior
- `assets/`: preferred location for assets and references
- `dist/edited.single.html`: built deliverable, not the preferred editing surface

Default workflow:

1. Edit `src/*`
2. Keep assets in `assets/*`
3. Build the standalone HTML
4. Verify the output

Do not treat `dist/edited.single.html` as the main place for durable changes unless the user explicitly asks for a temporary emergency patch.

## What The User Actually Wants

The desired feel is:

- consulting-deck logic
- restrained white-background presentation
- evidence-first but conclusion-led storytelling
- clean and relatively narrow content frame
- quiet premium polish
- very little visual noise
- no card soup
- no dashboard behavior

The user does not want:

- a "nice marketing webpage"
- a flashy landing page
- a heavy data cockpit
- lots of decorative UI modules
- scattered insight cards
- generic web design patterns that could belong to any project

The correct mental model is:

`one page = one message`

Not:

`one page = many blocks`

## What This Project Already Does Well

Preserve and extend these strengths:

- Content is separated from rendering. Prefer changing page text and structural data in `src/content-data.js`.
- Rendering logic is centralized. Reuse or extend helpers in `src/content-render.js`.
- Startup is registry-driven. Prefer extending registries and init flows over scattered one-off patches.
- Build and validation are explicit. Keep the `src -> dist` pipeline intact.
- The report already has a distinct deck language. Keep the pages edited, calm, and directional.

When adding a page or section, first ask:

- Can it fit the existing page grammar?
- Can it be modeled as data plus a render binding?
- Can it stay within the deck's visual discipline?
- Can it avoid becoming a dashboard?

## Deck Philosophy

The page should behave like a strategy deck:

- the title already contains the conclusion
- bullets create the reasoning bridge
- charts prove the point
- everything else stays quiet

The viewer should not have to decode what the page is trying to say.
The page should feel edited, not accumulated.

If a page starts asking the viewer to browse, compare many widgets, or interpret a pile of modules, simplify it.

## Core Page Grammar

Default page structure:

1. Small chapter label
2. One strong takeaway headline
3. Two to three bullet insights
4. One or two evidence blocks
5. Minimal footer if needed

The top half of the page should let the viewer understand the conclusion before reading the chart in detail.

The chart then proves the conclusion.

Use bullets to replace:

- long subtitle paragraphs
- summary cards between title and chart
- metadata rows under the title
- duplicated chart explanations

## Non-Negotiables

Do not do these by default:

- Do not build KPI tile rows or dashboard cards.
- Do not stack many unrelated modules on one page.
- Do not repeat the same message in headline, bullets, chart note, and footer.
- Do not widen the content frame just to fit more things.
- Do not add gradients, glow, glossy shadows, or promotional styling.
- Do not use decorative UI to compensate for weak narrative structure.
- Do not fill whitespace with extra boxes.
- Do not accept blurry chart text.
- Do not move stable content out of the modular source files into ad hoc inline edits.

When unsure, remove instead of add.

## Visual Direction

This deck should feel:

- premium
- restrained
- editorial
- evidence-led
- spacious but not empty
- polished without showing off

The page should not feel:

- playful
- app-like
- promotional
- over-designed
- dark-mode-first
- glossy

The background should stay mostly quiet and bright.
Color is used to support reading hierarchy, not to decorate.

## Width And Composition Rules

Keep the composition narrow enough to feel like a presentation page, not a browser canvas.

Prefer:

- a centered content frame
- disciplined left and right edges
- clearly grouped title and bullet block
- one dominant content row
- balanced paired chart panels

Avoid:

- extra-wide content stretches
- small modules floating in too much horizontal space
- random right-side fillers
- pushing charts wider when the real issue is weak editing

If the page looks sparse, do not immediately add modules.
First check whether the headline, bullets, chart scale, or chart plotting area should be stronger.

## Typography And Writing Tone

Write like a strategy report, not a product page.

Requirements:

- Make the headline a conclusion, not a topic label.
- Keep bullets short, directional, and evidence-led.
- Prefer direct business language over decorative wording.
- Avoid narrating what the chart already says.
- Keep page text edited and compressed.

Good headline pattern:

- change or tension
- business implication
- direction for 27SS or next action

Bad headline pattern:

- section name only
- generic category label
- topic statement without judgment
- vague "analysis" wording

## Headline Layout Rule

The main headline is the strongest line on the page.

Rules:

- It must contain the actual conclusion.
- It should read horizontally in one scan.
- It should not break like a poster slogan.
- It should not be only a topic label.
- It should feel edited and specific.

If a headline wraps badly, first shorten or tighten the wording before shrinking type.

## Bullet Rules

Bullets sit directly under the headline and are part of the main storytelling block.

Rules:

- Use 2-3 bullets by default.
- Each bullet should add a distinct piece of evidence or implication.
- Lead with the strongest proof point.
- Keep bullets short enough to scan quickly.
- Use emphasis only where it improves reading hierarchy.

Bullets replace:

- generic subtitles
- summary cards
- repeated chart captions
- explanatory filler text

## Chapter Label Rules

Use a compact chapter label above the main title.

Purpose:

- orient the viewer
- show report structure
- provide navigation, not messaging

The chapter label should stay low priority compared with the headline.

## Footer Rules

The footer is support information, not a design feature.

Rules:

- Keep it light.
- Use it only for source, page number, or minimal note.
- Do not let the footer compete with the chart area.
- Do not create a large bottom bar unless the page truly needs it.

If the page feels cramped near the bottom, adjust chart height or spacing before styling the footer.

## Border, Radius, And Shadow Rules

Use containers to organize the page, not to produce generic modern UI.

Preferred behavior:

- thin borders
- very light panel separation
- controlled radius
- almost invisible shadows, or none

Avoid:

- large radii everywhere
- soft floating cards
- stacked shadow layers
- "card deck" aesthetics

If panels feel too web-like, reduce radius, shadow, and border contrast.

## Whitespace And Density Rules

Whitespace is part of the report tone.

Use it to:

- create calm
- separate thought groups
- highlight the main evidence
- make the page feel edited

Do not use whitespace to justify weak content.

If a page looks empty, diagnose in this order:

1. Is the takeaway too weak?
2. Is the chart too small inside its container?
3. Is the plotting area underfilled?
4. Are there too many tiny sub-elements?
5. Only then consider whether one more support block is necessary.

## Chart Philosophy

Charts are supporting evidence, not the main character.

Use them to prove a pre-decided point.

A strong page usually has:

- one hero chart
- or one pair of clearly coordinated charts

It should not have:

- many small charts
- equal-weight modules competing for attention
- dashboard-style summaries

## Chart Text Clarity Is Non-Negotiable

Chart text must read crisply in the actual report page, not only in code or zoomed-in inspection.

Rules:

- Prefer readability over compactness.
- Increase chart typography before adding explanatory copy.
- Do not keep important axis or label text tiny.
- Use `renderer: "svg"` for text-heavy ECharts when clarity matters.
- Minimize text borders, shadows, and muddy effects.
- Keep chart text quality close to nearby HTML text.

Preferred defaults:

- axis and tick text usually around `10px` to `11px` when page scale allows
- direct labels usually at least `10px`
- outlines only when contrast truly requires them

If chart text feels fuzzy, treat that as a bug.

## Chart Selection Guide

Choose charts by business message, not novelty.

Prefer:

- line charts for trend and rhythm
- bar charts for rank and structure
- scatter or bubble charts for opportunity mapping
- radar only when the comparison logic is already clear and limited

Avoid:

- charts that need too much decoding
- charts with too many simultaneous encodings
- chart forms chosen only because they look advanced

## Chart Framing Rules

A chart panel should feel like an evidence stage.

Preferred structure:

- small kicker
- concise chart title
- optional one-line summary or note
- large plotting area

Avoid:

- dense top matter
- multiple stacked notes
- decorative headers
- subtitle clutter

The chart should get most of the panel's visual weight.

## Axis Minimalism Rules

Axes should support reading, not dominate the page.

Rules:

- keep axis lines and grid lines light
- keep tick density controlled
- remove redundant labels
- show only the information needed for the message
- favor simple business semantics

If the axis feels louder than the data, reduce it.

## Annotation Rules

On-chart annotation should help the viewer read faster, not create clutter.

Rules:

- annotate only what matters to the argument
- avoid labeling every point when the trend is enough
- use direct labels where they remove legend friction
- keep annotation language short
- resolve label collisions before finalizing

Do not turn a chart into a poster full of callouts.

## Paired-Chart Symmetry Rules

When using two charts on one page:

- make them feel like one argument, not two unrelated modules
- align panel heights
- align title blocks
- keep chart scale visually balanced
- maintain similar visual weight

If one chart is clearly the hero, make that hierarchy intentional instead of leaving the pair awkwardly uneven.

## Plotting-Area Diagnosis

When a chart looks weak, diagnose the plotting area before changing the whole page.

Check:

1. Is the chart itself too small inside the panel?
2. Is there too much dead margin around the plot?
3. Are labels or legends stealing vertical space?
4. Is the summary block too tall?
5. Is the chart type wrong for the message?

Often the fix is to enlarge or tighten the plot, not to redesign the full page.

## Title Alignment Rules For Chart Panels

Chart panel titles should feel orderly across the deck.

Rules:

- use consistent alignment within the same page type
- do not let one panel feel centered while another feels editorial-left unless intentional
- keep kicker, title, and summary aligned as a system
- avoid title blocks that consume too much height

## Color Semantics

Use color semantically and consistently.

Preferred roles:

- neutral or dark ink tones for stable structure
- one restrained accent for emphasis
- consistent up/down or positive/negative colors
- category colors only when they are meaningful and readable

Avoid:

- rainbow palettes by default
- loud dashboard color coding
- decorative gradients
- multiple unrelated accent systems on the same page

If a chart uses many colors, check whether structure can be shown with fewer.

## Page Density Rules

Each page type should maintain a stable density.

Paired-chart pages:

- Keep the intro concise.
- Give the chart row the visual priority.
- Avoid extra support cards unless they are essential.

Single-chart pages:

- Let the hero chart feel large and intentional.
- Do not surround it with small competing modules.
- Use one support note at most unless explicitly needed.

Direction and board pages:

- Allow more visual variety, but keep the page edited.
- Image walls and evidence blocks should still follow one hierarchy.

## Market And Data Page Defaults

Examples:

- social listening
- Tmall industry
- competitive structure
- gender structure
- needs and scenario pages

Default behavior:

- lead with a single takeaway
- use 2-3 bullets
- show one hero chart or two coordinated charts
- keep chart framing quiet
- make the conclusion readable before the evidence

## Competitive And Gender Page Defaults

These pages should feel analytical but still presentation-led.

Rules:

- emphasize structure shift, not raw data density
- use business-readable labels
- keep bubble or scatter charts legible first
- separate label role from color role
- allow controlled distortion or spacing adjustments if that materially improves readability

If an outlier destroys label clarity, adjust layout deliberately rather than accepting unreadable overlap.

## Functional Needs And Scenario Page Defaults

These pages should translate data into development language.

Rules:

- focus on the opportunity logic, not just ranking
- connect scene or function evidence to what should be built
- avoid generic wording like "consumers value comfort" unless the data meaning is more specific
- show where growth and share interact, not only one metric

## Direction-Page Grammar

Direction pages are for development use, not moodboard chaos.

They should answer:

- what direction is worth building
- what user need it answers
- what design points support it
- what evidence justifies it

The page should feel like curated direction logic, not a collage.

## Shared Vs Specific Logic

Shared and segment-specific directions must stay clearly separated.

Rules:

- shared pages should stay narrow and transferable
- female or uni pages should add only the segment-specific need or styling layer
- do not repeat the same direction with cosmetic wording changes
- do not let specific pages drift so far that the deck loses coherence

## Need-First Writing Rules For Directions

Direction copy should start from need and usage logic, not generic aesthetics.

Preferred sequence:

1. user or scene tension
2. product response
3. key design expression
4. supporting evidence

Avoid writing direction text as vague fashion commentary.

## Design-Point Rules

Design points must be concrete and buildable.

Rules:

- keep naming consistent across page labels, image labels, and support copy
- make expandable detail possible
- connect design points to scene or function logic
- avoid generic labels that could fit any outdoor product

If labels and image content drift apart, fix the naming first.

## Image Wall Rules

Image walls should feel curated and legible.

Rules:

- keep image sizes intentional
- align crops and spacing cleanly
- avoid chaotic masonry unless the page truly calls for it
- maintain enough whitespace around the image wall so it feels edited
- ensure captions, tags, and labels remain synchronized with the actual imagery

If the image wall looks like a random dump, reduce quantity and improve grouping.

## Color-Read Page Rules

Color-read pages should stay disciplined and specific.

Rules:

- keep color naming synchronized across chips, labels, and supporting imagery
- let the color story stay narrow
- avoid turning the page into a full palette library
- use product imagery to support the read, not to overwhelm it
- preserve left-panel whitespace and reading hierarchy

## Brand Focus Page Defaults

Brand pages should feel comparative and editorial, not encyclopedic.

Default behavior:

- show only the strongest product, positioning, scene, function, and color cues
- keep support blocks concise
- use matrix or radar only when they stay legible
- keep the page clearly about "what to borrow" and "what this brand is doing well"

Do not overload brand pages with catalogue-style detail.

## Summary Page Defaults

Summary pages should compress the logic of the deck.

Rules:

- do not restate every section
- translate evidence into development guidance
- keep the final actions concrete
- preserve the deck tone instead of switching into generic recommendation language

## Project-Specific Editing Rules

Follow the existing architecture before inventing new patterns.

### Content changes

- Put page copy, bullets, labels, and section-level content in `src/content-data.js`.
- Preserve the existing `*_PAGE_DATA` object pattern.
- Extend `REPORT_PAGE_REGISTRY` instead of inventing parallel registration systems.
- Keep page metadata declarative when possible.

### Rendering changes

- Add or reuse render helpers in `src/content-render.js`.
- Prefer shared section-intro binding patterns over page-specific manual DOM code.
- If a new block repeats across pages, create a helper for it.

### Bootstrap changes

- Register new charts and startup behavior in `src/content-bootstrap.js`.
- Prefer registry-driven init flows over scattered one-off initialization.
- Keep interactive behavior lightweight and report-appropriate.

### Chart changes

- Put chart option logic in `src/chart-app.js`.
- Match the current visual language before introducing new chart idioms.
- Prefer readable business charts over technically dense but tiny plots.

### HTML changes

- Update `src/template.html` only for stable structure.
- Avoid risky large rewrites when the file contains encoding damage or fragile copied sections.
- Prefer surgical edits over whole-file reformatting.

## Asset Rules

- Prefer assets from `assets/*`.
- Keep project-local assets usable even if archive extraction fails.
- If a fallback is necessary, keep the page functional and visually orderly.
- Do not scatter duplicated assets across random folders without reason.

## Practical Workflow For This Project

When making meaningful changes:

1. Update data and copy in `src/content-data.js`
2. Update structure in `src/template.html` only if needed
3. Update rendering helpers in `src/content-render.js`
4. Update chart options in `src/chart-app.js`
5. Register new behavior in `src/content-bootstrap.js`
6. Build the standalone output
7. Run the verification scripts

Prefer adapting the existing patterns over inventing a new mini-system for one page.

## Build And Validation

After meaningful edits, run:

1. `python build_single_html.py`
2. `python verify_build.py`
3. `python verify_content_data.py`

What these checks protect:

- `build_single_html.py`: rebuilds the standalone deliverable from modular sources
- `verify_build.py`: ensures the built HTML is self-contained
- `verify_content_data.py`: catches content-data mutations and obvious garbling regressions

If you changed only source files and did not rebuild, say so clearly.

## Recovery Rules

When editing risky or encoding-damaged sections:

- avoid unnecessary whole-file rewrites
- make the smallest possible structural change
- verify the affected page after editing
- rebuild promptly so source and deliverable stay aligned

If a quick manual fix is applied to unblock review, move the durable version back into `src/*` before considering the work finished.

## Final Decision Heuristics

Use these checks before finalizing:

- Does the page communicate one message quickly?
- Is the conclusion visible before the viewer studies the chart?
- Did the change preserve the source-to-build architecture?
- Did copy stay in data files and behavior stay in logic files?
- Did the page remain a deck, not a dashboard?
- Is chart text crisp enough at normal viewing size?
- Did spacing, panel treatment, and composition still feel premium and restrained?

If any answer is no, revise before finishing.

## Difference Between Report And Dashboard

Keep this distinction active while editing.

Dashboard behavior:

- many filters
- many modules
- many simultaneous dimensions
- browse-first logic
- viewer decides what matters

Report behavior:

- one storyline per page
- one takeaway per page
- selected evidence only
- conclusion-first logic
- page already tells the viewer what matters

If the viewer needs to perform the analysis alone, the page is acting like a dashboard and should be simplified.

## Content Compression Rules

Compression is part of the deck's quality.

Rules:

- reduce duplicate meaning before reducing font size
- shorten titles before narrowing the frame
- remove support boxes before adding more rows
- compress obvious text before shrinking chart area
- prefer one sharp statement over three soft statements

Compression order:

1. remove duplicate language
2. reduce explanatory filler
3. simplify labels
4. tighten bullets
5. merge repeated modules

Do not compress by making the page harder to read.

## How To Translate Data Into A Page

Use this workflow when turning raw data into a page:

1. identify the strongest business conclusion
2. identify the two or three supporting proofs
3. choose the chart form that proves those proofs fastest
4. write the headline as a conclusion
5. write bullets as bridge logic
6. remove every block that does not strengthen the argument

If the data is interesting but not directional, do not force a busy page around it.
Find the real tension first.

## Approved Intro Block Pattern

For most report pages, the intro block should contain:

- chapter label
- one headline
- one bullet list

Optional additions:

- one compact subtitle line only if necessary
- one minimal meta row only if the page truly needs it

Do not put:

- large stat cards
- multiple annotation ribbons
- a wide explanation paragraph
- decorative separators that push charts down

## Section-Head Balance Rules

The section head must feel strong enough to lead the page, but not so tall that it starves the evidence area.

Rules:

- keep the kicker compact
- keep the headline dominant
- keep bullets within a compact vertical block
- avoid stacking extra note rows between intro and chart
- treat the intro as one cluster, not three separate strips

If the section head becomes too tall, tighten copy before shrinking the chart.

## Subtitle Rules

Subtitles are optional and should be rare.

Use a subtitle only when:

- the page needs a narrow framing statement
- the headline alone would become too long
- the page needs one clarifying scope line

Do not use subtitles to restate the headline in softer words.

## Summary Box Rules

Summary boxes are not the default pattern for this deck.

Use one only when:

- it compresses genuinely separate information
- it creates faster reading than bullets would
- it supports a page type that already needs a side panel

Avoid summary boxes when:

- the same message can live under the title
- the box is only decorative
- the box weakens the main chart area

## Metadata Row Rules

Metadata should stay quiet.

Allowed metadata:

- source
- time window
- category scope

Rules:

- place metadata low in hierarchy
- do not put a long metadata bar directly under the headline by default
- do not let metadata outgrow the bullets

## Width Diagnosis Rules

When a page feels wrong horizontally, diagnose this order:

1. Is the content frame too wide?
2. Are the side margins too inconsistent?
3. Are the panels too shallow because of unnecessary side padding?
4. Are the charts underfilled rather than undersized?
5. Is the problem really weak narrative rather than width?

Do not solve a weak page by stretching it wider.

## Content Containment Rules

Every page should feel contained.

Rules:

- keep major rows aligned to one visual frame
- avoid stray modules hanging outside the main content system
- make sure the page edges feel deliberate
- let topbar or navigation stay secondary to the report page itself

If a module feels like it belongs to another screen, pull it back into the report system or remove it.

## Visual Hierarchy Rules

The reading hierarchy should usually be:

1. headline
2. bullets
3. chart title or chart shape
4. chart labels
5. footer/meta

If support elements are competing with the headline or chart, reduce them.

## Neutral Tone Rules

The deck's premium feeling mostly comes from restraint.

Preferred palette behavior:

- off-white or white surfaces
- dark neutral text
- cool restrained grays
- one or two disciplined accents

Avoid:

- saturated large-area backgrounds
- gradient-heavy surfaces
- tinted panels everywhere

## Divider Rules

Dividers should be rare and almost invisible.

Rules:

- use thin lines only when they help grouping
- prefer spacing over hard separators
- never let divider systems become the main visual language

## Rounded Corner Rules

Radii should be subtle.

Suggested behavior:

- small radius for image or panel containment
- medium radius only when the component already exists in that language
- no oversized rounded corners for serious report surfaces

If a page starts looking like a design-system demo, reduce radii.

## Shadow Rules

Shadows should not advertise themselves.

Preferred behavior:

- none
- or one extremely light containment shadow

Avoid:

- layered shadows
- soft-glow card lift
- floating dashboard panels

## Background Texture Rules

Default background is quiet.

Do not add:

- abstract shapes
- strong patterns
- decorative mesh gradients
- hero backgrounds

If a page feels too plain, improve the evidence and composition instead.

## Vertical Rhythm Is Non-Negotiable

The page should have a deliberate top-to-bottom rhythm.

Check:

- title block is one cluster
- chart row starts at a clear visual beat
- paired panels share a baseline
- footer is detached but not drifting

If the page feels uneven, fix spacing before adding new content.

## Vertical Spacing Diagnosis

Diagnose vertical issues in this order:

1. Is the intro block too tall?
2. Is the chart title block too tall?
3. Is the panel top padding too loose?
4. Is the footer taking space needed by the chart?
5. Is one page type borrowing spacing values from an incompatible page type?

## Insight-To-Chart Spacing Rules

The distance between bullets and chart row matters.

Rules:

- close enough to feel like one argument
- loose enough to avoid crowding
- consistent within similar page types

If bullets feel detached from the chart, reduce the gap.
If the chart feels jammed under the bullets, simplify the intro or increase air slightly.

## Page Density By Narrative Strength

If the narrative is strong:

- allow more whitespace
- let one chart dominate
- keep supporting modules minimal

If the narrative is complex:

- add one carefully chosen support block
- do not default to many small boxes

Density should follow logic, not habit.

## 16:9 Page Behavior

Design each sheet like a 16:9 report page even though it lives in a browser.

Rules:

- preserve presentation-style framing
- avoid vertically endless web behavior inside a sheet
- keep each section feeling like a discrete page
- avoid mobile-app style stacking inside desktop presentation views

## Single-Section Mode Rules

When the report is viewed as a continuous page with navigation:

- each section should still feel page-like
- transitions between sections should stay calm
- page-level composition should remain intact
- do not let navigation chrome dominate the reading experience

## Paired-Chart Fill Rules

Two-chart pages often fail when panels are formally equal but visually unequal.

Check:

- do both plots occupy a similar percentage of panel height?
- do both title blocks consume similar vertical space?
- do both panels feel equally resolved?

If one side feels weak, strengthen its plot or tighten its header before changing the entire layout.

## Paired-Chart Height Alignment

For paired-chart pages:

- align the visual bottoms of both panels
- keep chart canvases or SVG areas close in height
- avoid one panel having a tall explanation stack and the other a compact plot

The page should read as one comparison system.

## Page-Level Chart-Row Alignment

Across different pages of the deck, chart rows should start at a reasonably stable vertical position.

Rules:

- keep intro clusters within a similar height range for the same page family
- avoid one page with a very deep intro and another with almost none unless intentional

Stable chart-row alignment helps the deck feel edited and premium.

## Headline Length And Layout Rules

Target a headline that reads in one scan.

Prefer:

- one line
- or two balanced lines

Avoid:

- three short poster-like lines
- ragged manual line breaks
- weak trailing words on a final line

When the headline is too long:

1. tighten wording
2. merge repeated concepts
3. move support information to bullets
4. only then consider small type adjustment

## Bullet-Length Control

Bullet lines should be readable at presentation distance.

Rules:

- avoid very long bullets with multiple clauses
- split when one bullet contains two insights
- keep bold emphasis selective
- avoid all-bold bullets

## Kicker And Badge Rules

The badge and kicker should feel like navigation aids, not branding moments.

Rules:

- keep them compact
- use low-to-medium contrast
- do not oversize the chapter number
- do not let the badge become a decorative block

## Intro Alignment Rules

Within one page:

- align kicker, headline, and bullets as a coherent stack
- avoid center/left mixing unless the page type explicitly requires it
- keep the intro anchored to the main frame

## Chart Title Wording Rules

Chart titles should be factual and compact.

Prefer:

- what the chart shows
- time scope if necessary
- business frame if necessary

Avoid:

- long narrative chart titles
- marketing language
- repeating the page headline judgment word-for-word

## Chart Summary Rules

Chart summaries are optional.

Use them when:

- they pull out one important read quickly
- they help a hero chart lock its message

Do not use them when:

- they repeat the chart title
- they restate the headline
- they shrink the plotting area too much

## Chart Note Rules

Notes should be strictly utilitarian.

Good notes:

- bubble size semantics
- axis semantics
- unit clarifications

Bad notes:

- mini insight paragraphs
- duplicated takeaways
- long methodological caveats

## Axis Title And Tick Rules

Axis labels should clarify the logic fast.

Rules:

- use plain business terms
- avoid overly technical abbreviations if the audience is not technical
- keep tick density moderate
- shorten labels if they compete with data
- rotate only when necessary

## Axis Semantics For Business Charts

Use axis terms the viewer can parse immediately.

Prefer:

- Share
- YoY
- ASP
- GMV
- Search
- Buzz
- Rank

Avoid obscure internal jargon unless the whole deck assumes it.

## Trend Chart Language

Trend charts should emphasize rhythm and turning points.

Rules:

- make the period structure readable
- call attention to inflection points, not every fluctuation
- avoid overly decorative smoothing if it distorts the business read
- use line-end labeling when it reduces legend scanning

## Line Chart Styling Rules

Preferred behavior:

- thin-to-medium lines
- clear point emphasis only where needed
- restrained area fill if it truly helps
- readable end states

Avoid:

- thick, soft, web-style strokes
- strong gradients under every line
- too many simultaneous patterns

## Bar Chart Styling Rules

Preferred behavior:

- clean bars
- consistent spacing
- readable category order
- annotations only where helpful

Avoid:

- decorative rounded bars when the page is serious
- excessive inside labels on crowded charts
- unnecessary 3D or faux-depth effects

## Scatter And Bubble Landscape Rules

Scatter and bubble charts are useful for opportunity mapping but fail easily.

Rules:

- keep axis meaning obvious
- keep the number of points curated
- label the points that matter most
- protect readability over geometric purity
- accept controlled spacing adjustments if the business signal becomes clearer

## Bubble Chart Spacing Rules

When bubbles are crowded:

- increase plot size first
- simplify labels second
- adjust point positions carefully if required for readability
- reduce low-value points if they add noise

Do not accept unreadable bubble clusters just to stay mathematically pure in presentation mode.

## Bubble-Chart Readability And Outlier Treatment

Outliers can distort the whole reading experience.

Rules:

- allow controlled domain expansion or point offset if one outlier crushes the rest
- annotate the outlier if needed
- do not let one point make every other label unreadable

## Relative Label Positioning For Bubbles

Label positions should adapt to local crowding.

Rules:

- do not force all labels to the same side
- protect the most important brands first
- keep label motion deliberate, not random
- avoid crossing leader lines when possible

## Controlled Distortion Is Allowed For Readability

For this deck, readability can justify controlled distortion when:

- the chart remains honest in overall meaning
- the adjustment clearly improves interpretation
- the alternative is unreadable overlap or wasted plot area

Do not distort in ways that create false business conclusions.

## Annotation Collision Rules

Before finishing a chart:

- scan for overlapping text
- scan for labels clipped at edges
- scan for annotations colliding with symbols
- scan for legends fighting with the plot

Collision cleanup is not optional polish.

## Legend Rules

Legends should reduce effort, not add scanning cost.

Rules:

- keep legends compact
- place them where they do not steal plot area
- use direct labels instead of legends when that is simpler
- avoid giant multi-row legends

## Legend And Line-End Labeling

When there are only a few lines:

- prefer line-end labels if they are clean
- use legends only when line-end labels would clutter the plot

When there are many series:

- reduce series count first
- do not assume a large legend solves the problem

## Legend And Plotting-Area Relationship

The legend should never dominate the plot.

If the legend:

- takes too much top space
- forces the plot to shrink
- creates a second focal area

Then the chart needs a different labeling strategy.

## Tooltip Rules

Tooltips are secondary because this is a report surface, not a dashboard.

Rules:

- keep them useful but not relied upon for core reading
- never hide the key message only in tooltip
- keep tooltip content concise
- match tooltip tone to the premium restrained visual language

## Platform Icon Rules

Icons should support quick platform recognition only.

Rules:

- keep them small
- keep them aligned with chart titles
- do not treat them as decorative hero assets
- avoid adding icons where the label already communicates enough

## Social Listening Chart Defaults For This Project

Social pages should usually show:

- buzz or visibility signal
- search or demand signal

Rules:

- keep the comparison between attention and demand explicit
- let one line or metric carry the main directional message
- avoid adding too many social sub-metrics on the same page

The conclusion should usually connect season timing, search intent, and reasons to buy.

## Social Listening Page Defaults

Preferred page behavior:

- title expresses the change in heat versus demand
- bullets explain the contradiction or continuity
- one chart shows buzz trend
- one chart shows search or demand trend

Do not turn the social page into a platform matrix.

## Tmall Industry Page Defaults

The Tmall page should explain category position and growth pressure quickly.

Preferred behavior:

- one hero chart for market landscape
- one support chart for share or monthly behavior
- concise explanation of share vs growth tension

Keep the page strategic, not catalog-like.

## Hero Chart Sizing Rules

A hero chart should look like the main event of the page.

Rules:

- allocate most of the page's available evidence area to it
- avoid placing many small support widgets around it
- keep top framing compact so the plot has room

If a hero chart feels underwhelming, increase the plot area before adding more surrounding modules.

## Hero Chart Plotting-Area Rules

Within the hero chart panel:

- minimize dead margin
- keep title block short
- keep legends compact
- ensure the plot feels dense enough to carry the page

## Single-Chart Page Rules

Single-chart pages succeed when the chart is clearly dominant.

Rules:

- one strong intro cluster
- one large chart
- one optional support note or side detail
- no extra mini cards unless indispensable

If the page feels empty, enlarge the hero chart or strengthen the title before adding modules.

## Single-Chart Page Whitespace Balancing

For single-chart pages:

- preserve a calm margin around the hero chart
- avoid a giant empty strip under the intro
- avoid a large dead zone under the chart before the footer

Balance whitespace around the plot, not around decorative wrappers.

## Hover Detail Card Rules

Hover panels are allowed only when they strengthen an existing chart read.

Rules:

- treat them as secondary detail
- do not depend on hover to communicate the main insight
- keep the hover card visually consistent with the report
- do not let it behave like an app tooltip system

## Hover-Card Role Rules

Hover cards are useful for:

- one deeper drill-down related to a highlighted point
- one compact share or detail panel

They are not useful for:

- replacing a missing support chart
- hiding essential logic
- turning the page into an exploratory product

## Multi-Chart Symmetry Rules

When a page contains more than two visual evidence blocks:

- there must be a strong reason
- one block should still clearly lead
- secondary blocks should be quieter and smaller

Avoid three equal-weight charts on one page by default.

## Color Semantics For Growth Charts

For growth-oriented pages:

- keep positive and negative colors stable across the deck
- use neutral tones for baseline categories
- reserve accent tones for highlighted opportunity

Do not change the meaning of colors page to page.

## Series Differentiation Rules

Differentiate series by:

- semantic color
- line style only when necessary
- direct labels where possible

Avoid:

- too many line styles
- decorative marker variety
- relying on subtle hues that collapse at presentation scale

## Horizontal Vs Vertical Chart Choice

Choose direction by readability.

Prefer horizontal bars when:

- category names are long
- ranking is the main point
- label readability matters most

Prefer vertical bars when:

- temporal or ordered progression matters
- labels are short
- composition benefits from a taller plot

## Footer Containment And Chart-Height Rules

If the footer feels too close to the chart:

1. check whether the chart can be slightly shorter without losing force
2. check whether the footer can be simplified
3. check whether extra bottom padding is needed

Do not solve footer collisions with heavy divider bars.

## Competitive Structure Page Defaults

Competitive structure pages should show how share and growth are shifting, not just who exists.

Rules:

- emphasize structural movement
- show leaders versus gaining specialists clearly
- separate scale from momentum when possible
- avoid overly busy brand ranking walls

## Color Semantics For Competitive Pages

Competitive pages often need more than one semantic layer.

Recommended logic:

- neutral for incumbent structure
- accent for gaining players
- muted negative or subdued decline tone for softening players

Keep the meaning stable across all competitive pages.

## Legend Rules For Semantic Colors

If colors carry business meaning:

- the legend or labels must make that meaning immediately clear
- do not ask the viewer to infer whether a color means brand identity or business state

One color should not simultaneously mean both.

## Delta-Row Rules

If you use a delta row or change strip:

- keep it compact
- align it tightly with the main chart
- make the sign and comparator obvious
- do not let it become a second large module

## Brand Naming Rule

Brand naming must stay consistent across:

- chart labels
- matrix labels
- page titles
- bullets
- radar legends

Do not mix naming styles casually.

Pick one house style and keep it stable.

## Brand-Name Presentation In Labels

For dense charts:

- shorten brand names only if they remain unambiguous
- prefer consistent casing
- avoid mixing local and English names in the same chart unless necessary

## Gender-Structure Page Defaults

Gender pages should explain structure and premium band movement fast.

Rules:

- show share and growth together when possible
- keep ASP logic readable
- let the page explain where male, female, and unisex differ
- avoid turning the page into a taxonomy sheet

## Label And Color Role Separation

Keep role separation clear:

- labels identify who or what
- colors explain state, segment, or meaning

Do not make one color system do too many jobs at once.

## Functional-Needs And Scenario Page Defaults

These pages should convert tags into development logic.

Rules:

- identify the base function
- identify the growth function
- identify the scene that changes the recommendation
- explain what to build differently

Avoid generic trend language without product implication.

## Opportunity-Map Reading Rules

When using share-vs-growth maps:

- clearly establish what quadrant logic matters
- highlight only the points that support the recommendation
- avoid forcing every point to have a long label

The map should help decision-making, not just show distribution.

## Direction-Page Summary Rules

Each direction page should arrive at one concise development conclusion.

Rules:

- summarize the direction in buildable language
- connect it to user need and scene
- keep the summary narrower than the full evidence wall

Do not finish the page with vague inspiration language.

## Evidence-Type Split By Direction

Choose evidence type according to the direction:

- use function evidence for technical directions
- use scene evidence for use-case directions
- use image and detail evidence for design-point directions
- use color evidence only when color is truly part of the direction logic

## Data-Support Rules For Trend-Definition Pages

Trend-definition pages should not drown in data.

Rules:

- use only enough data to justify why the direction matters
- keep the conclusion ahead of the proof
- do not repeat the same proof in three visual forms

## Do Not Let Data Support Repeat The Card Conclusion

If a card or support panel already states the conclusion:

- the next block should add proof
- not restate the same wording

Repetition makes the page feel padded.

## Shared Direction Should Stay Narrow

Shared direction pages should only contain what truly spans segments.

Rules:

- keep the language broad enough to travel
- avoid segment-specific styling details
- keep the direction core concise

## Specific Directions Should Add Only One Or Two Needs

Segment-specific direction pages should not rebuild the whole logic.

Rules:

- inherit the shared base
- add only the segment-specific tension
- show one or two specific design responses
- avoid duplicating the whole shared page with minor wording changes

## PPT Wording Rules For Design Directions

Direction-page wording should work well in presentation reading.

Prefer:

- short declarative labels
- buildable feature phrases
- editorial but direct wording

Avoid:

- decorative fashion copy
- vague premium adjectives without product meaning
- long narrative paragraphs

## Design Points Must Be Expandable

Each named design point should be strong enough to support:

- a label
- one visual example
- one brief explanation
- one reason it matters

If a design point cannot support that structure, it is probably too vague.

## Complete Scene Matrix Rules

If you build a scene or comparison matrix:

- use only dimensions that drive development decisions
- keep row and column labels concise
- maintain equal visual treatment across comparable cells
- avoid matrixes that read like spreadsheets

## Matrix Alignment Is Non-Negotiable

For comparison matrix pages:

- keep header alignment strict
- keep cell padding consistent
- make brand columns or scene columns visually equal
- do not let one dense cell distort the whole grid

## Growth Is Not Enough On Its Own

Do not recommend a direction only because a metric is growing.

Check:

- current size
- brand fit
- scene fit
- differentiation value
- buildability

The deck should recommend opportunities, not just momentum.

## Use Scene-Level Function Evidence, Not Generic Wording

When arguing for a product direction:

- tie function to scene
- tie scene to need
- tie need to a buildable product response

Avoid broad statements like "people want comfort" without scene evidence.

## Icon Use On Direction Pages

Icons can be used sparingly for scanning support.

Rules:

- keep them small
- use them only where they improve recognition
- avoid turning the page into an infographic board
- maintain the deck's restrained tone

## Page 12 Extension-Board Rules

For extension-style design boards:

- maintain a strong left-side logic panel
- keep the right-side imagery curated
- let the board explain how the direction extends rather than merely showing more images

## Left-Side Support Panel Rules

When a board uses a left support panel:

- keep the hierarchy strict
- use concise headings
- avoid stacking many equal-weight micro modules
- make sure the panel supports the images instead of competing with them

## Left-Side Chart Style Rules

If a board page includes a small support chart:

- keep it visually simpler than the main data pages
- use it as proof, not as a full analysis block
- avoid consuming too much vertical space

## Right-Side Image-Wall Rules

For image-heavy pages:

- group images intentionally
- keep a stable rhythm of crops and gaps
- avoid too many tiny tiles
- preserve enough empty space for the page to breathe

## Image-Display Rules

Images should feel like selected evidence.

Rules:

- use clean crops
- avoid mismatched aspect-ratio chaos unless intentionally editorial
- keep image edges aligned where possible
- avoid mixed-quality images on the same focal row

## Fabric-Tech Module Rules

When showing fabric or tech detail:

- connect the module to a user-facing benefit
- keep technical detail concise
- avoid turning the page into a spec sheet
- integrate with the overall direction logic

## Color Naming Must Stay Synchronized

For color pages:

- chip labels
- support copy
- image labels
- comparison notes

Must all refer to the same color logic.

If the naming drifts, fix the naming first before redesigning the page.

## Product-Image Grid Rules

Product grids should be tidy and intentional.

Rules:

- keep row heights stable when possible
- avoid one oversized product image without narrative reason
- preserve consistent crop logic
- use captions only where they add meaning

## Left-Panel Whitespace Rule For Color Pages

Color pages often need strong restraint on the text side.

Rules:

- do not overfill the left panel with copy
- preserve breathing space around color chips and labels
- let the text panel act as a calm reading anchor

## Color Read Safety Rules

Color-read pages fail when they become either too decorative or too broad.

Rules:

- keep palette interpretation narrow
- show only the colors that matter to the recommendation
- avoid full-spectrum exploration
- support color logic with product examples, not abstract mood imagery

## Single-Brand Insight Page Defaults

A single-brand page should answer:

- what this brand is doing distinctively
- what is worth borrowing
- what should not be copied directly

Keep the page practical, not biographical.

## Approved Left-Column Structure

For split-layout brand pages, the left column should usually contain:

- intro or brand thesis
- one comparison or summary block
- one short set of borrow cues

Do not turn the left column into a text wall.

## Approved Right-Column Structure

The right column should usually contain:

- the strongest visual evidence
- one disciplined chart, matrix, or radar
- tightly curated product or styling examples

Do not let the right side become a dense catalog.

## Approved Top Conclusion Card Pattern

If a brand or comparison page uses a top conclusion card:

- keep it compact
- let it compress one thesis only
- keep styling restrained
- do not let it become a full-width hero banner

## Approved Bottom Evidence Card Pattern

If a bottom evidence card is used:

- make sure it adds new proof
- keep its tone quieter than the main page thesis
- align its width and padding with the rest of the page system

## Scene And Function Evidence Rules

When combining scene and function:

- avoid treating them as two unrelated tag lists
- show how scene drives function importance
- show what that means for development

## Color Section Rules

When a page has a dedicated color area:

- keep it synchronized with the overall page direction
- avoid turning it into decoration
- use a limited number of chips, swatches, or references

## Single-Brand Page Non-Negotiables

Do not:

- over-explain brand background
- show too many products
- mix too many visual systems
- bury the borrowable lesson

## Final Summary / Brand Guidance Rules

When the deck closes with guidance:

- make actions concrete
- tie them to evidence already established
- keep the tone strategic and buildable
- avoid generic "keep observing the market" endings

## Asset And Fallback Rules

Preferred asset order:

1. project-local `assets/*`
2. organized archive references if needed
3. graceful fallback only when necessary

Fallback behavior:

- keep layout intact
- avoid broken-image chaos
- preserve the reading logic

## Temporary Data Completion Rules

Sometimes the user may ask for layout work before all data is final.

In that case:

- keep placeholder values clearly structured
- do not invent misleading business conclusions
- make later replacement easy in `src/content-data.js`
- avoid hardcoding temporary fixes across multiple files

## Data Hygiene Reminder

This project already tries to keep data definitions clean.

Rules:

- avoid post-definition mutation patterns in `src/content-data.js`
- prefer declarative page objects
- keep labels, arrays, and page config close to their owning page objects
- avoid scattering last-minute overrides through bootstrap logic

## Practical Build Workflow Detail

After a substantial change:

1. inspect affected source files
2. edit only the smallest necessary source surfaces
3. rebuild with `python build_single_html.py`
4. verify with `python verify_build.py`
5. verify with `python verify_content_data.py`
6. inspect the relevant page visually if possible

## Recovery Rule After Risky Edits

If an edit goes sideways:

- stop making new stylistic changes
- restore structural clarity first
- check whether the issue belongs in data, render, bootstrap, or chart logic
- avoid compounding the problem with wide rewrites

## Approved Risk Posture For This Repo

Preferred editing style:

- narrow
- reversible
- source-first
- registry-aware
- visually disciplined

Avoid:

- giant rewrites
- blind search-and-replace passes through fragile HTML
- solving layout issues with arbitrary one-off CSS

## Final Reminder

This skill should bias toward preserving the project's existing identity, not replacing it with cleaner but blander general web design.

If a proposed change makes the deck more generic, more dashboard-like, or less visually opinionated, it is probably the wrong direction even if the code becomes simpler.

## Compare Page Grammar

Compare pages should answer one question clearly:

- how the brands or options differ in a way that changes development judgment

Do not make compare pages into reference dumps.

Preferred structure:

1. one thesis
2. one concise bullet cluster
3. one matrix, radar, or comparison evidence block
4. one compact "borrow" or "avoid" read

## Compare Page Density Rules

Compare pages can tolerate slightly more density than trend pages, but only if the hierarchy remains obvious.

Rules:

- thesis stays short
- comparison system gets the visual focus
- supporting notes stay compressed
- each brand or column should be equally readable

If the compare page starts reading like a spreadsheet, reduce dimensions.

## Compare-Pill Rules

If a compare page uses pill cards or compact comparison strips:

- each pill should represent one takeaway only
- keep metric and label relationship obvious
- avoid multi-line clutter in pill headers
- do not use pills as decorative filler above the real evidence

Pills should compress difference, not add another layer of modules.

## Compare Matrix Tone Rules

A matrix should feel disciplined and editorial.

Rules:

- one stable grid
- one controlled set of row tones
- one clear column system
- minimal ornament

Avoid:

- many cell-level color codes with unrelated meaning
- irregular padding by row
- one cell visually overpowering the rest without reason

## Matrix Cell Writing Rules

Each matrix cell should contain:

- one short main point
- one optional supporting phrase
- one optional micro label if necessary

Do not let cells become mini paragraphs.

If a cell needs more than that, the matrix is likely carrying too much logic.

## Matrix Row Logic Rules

Rows should represent dimensions that genuinely matter for comparison.

Good row types:

- positioning
- growth logic
- scene
- function
- color
- silhouette or design expression

Bad row types:

- vague quality judgments
- repeated synonyms
- data points that do not change the recommendation

## Matrix Column Logic Rules

Columns should compare truly comparable objects.

Rules:

- keep the brand set or option set stable
- avoid mixing segment, channel, and brand in one column system
- do not insert one "other" column that breaks the logic

## Matrix Scanability Rules

The viewer should be able to scan matrix pages both vertically and horizontally.

Rules:

- vertical scan should reveal each brand's pattern
- horizontal scan should reveal each dimension's contrast
- row labels should be stronger than cell detail
- the eye should not get lost in uniform gray text

## Matrix Header Rules

Headers must stay quieter than the body insight but stronger than cell detail.

Rules:

- keep brand names clear
- maintain equal column width when possible
- use minimal brand markers or dots if helpful
- avoid decorative brand treatments that turn headers into banners

## Matrix Color-Swatch Rules

When matrix cells use color swatches:

- keep swatch size consistent
- keep count limited
- ensure swatches support a color conclusion instead of simply decorating the cell
- pair swatches with a short meaning, not just empty chips

## Radar Use Rules

Radar charts are allowed only when they truly clarify relative shape.

Use radar when:

- the compared dimensions are few
- the compared brands are few
- the shape difference itself carries meaning

Do not use radar when:

- the dimensions need long explanation
- the series count is high
- a matrix or bar chart would be clearer

## Radar Readability Rules

For radar charts:

- keep indicator count disciplined
- keep labels short
- keep the center open enough to read shape overlap
- use muted area fill
- ensure line colors remain distinct without shouting

If the radar looks cool but explains less than a matrix, remove it.

## Radar Legend Rules

Radar legends can become clutter fast.

Rules:

- prefer a small centered legend or direct label strategy
- keep marker size compact
- do not allow a large legend row to shrink the radar too much

## Radar Comparison Logic

A radar should compare relative profile, not exact score interpretation.

Therefore:

- keep the verbal takeaway outside the radar
- do not ask the viewer to compute precise meaning from polygon shape alone
- support the radar with one concise explanatory read

## Brand Compare Borrow-Logic Rules

A compare page should lead naturally to borrow logic.

Rules:

- identify what each brand is strongest at
- identify what should be borrowed carefully
- identify what should not be copied literally
- avoid turning the page into fan commentary

## Borrow-Vs-Copy Rule

The deck should recommend what to borrow, not what to duplicate.

Therefore:

- express the underlying logic
- translate it into the user's product context
- avoid praising features that only work because of another brand's full system

## Brand Focus Thesis Rules

Each brand-focus page needs one thesis sentence that explains why this brand matters.

Good thesis types:

- this brand defines a clear premium band
- this brand owns a sharper scene interpretation
- this brand expresses function through better design cues
- this brand turns a known feature into a stronger product language

Avoid generic thesis such as:

- this brand is popular
- this brand is strong
- this brand has many products

## Brand Focus Intro Rules

The intro on a brand page should be concise and directional.

It may include:

- one brand thesis
- one short supporting note
- one borrow cue cluster

It should not include:

- long brand history
- large brand-background copy
- many disconnected subheads

## Brand Focus Layout Balance

Brand pages often have one side for narrative and one side for evidence.

Rules:

- the narrative side should anchor the reading
- the evidence side should contain the most compelling support
- neither side should visually collapse or dominate without intent

If the evidence side becomes too catalog-like, reduce asset count.

## Brand Focus Radar And Matrix Combination Rules

If a brand page uses both radar and matrix elements:

- one must clearly lead
- the other must act as support
- they must not explain the exact same thing twice

Avoid double-comparison systems without a strong reason.

## Brand Focus Product-Example Rules

Product examples should be curated to prove the thesis.

Rules:

- choose only the strongest examples
- avoid showing multiple near-duplicate products
- ensure examples support the stated scene, function, or color logic
- keep labels concise and synchronized

## Brand Focus Column Rhythm Rules

If the page uses multiple gender or segment columns:

- keep top alignment strict
- keep card heights reasonably controlled
- preserve equal visual dignity across columns
- avoid one overloaded column next to one empty column

## Brand Focus Cue Stack Rules

Cue stacks or takeaway stacks should remain editorial.

Rules:

- 3-5 strong cues is usually enough
- each cue should be short
- avoid repeating the same cue in slightly different language
- keep cue typography supportive, not headline-sized

## Spacing Escalation Rules

When spacing looks wrong, escalate carefully.

Fix order:

1. remove unnecessary elements
2. tighten text
3. rebalance section spacing
4. adjust panel padding
5. resize chart area
6. only then consider layout restructure

Do not jump straight to global CSS changes when one page family is the real issue.

## Micro-Spacing Rules

Micro-spacing controls premium feel.

Check:

- distance between kicker and title
- distance between title and bullets
- bullet line height
- title block to chart gap
- chart title to plot gap

Small inconsistencies here make the page feel cheap faster than color choices do.

## Macro-Spacing Rules

Macro-spacing controls whether the whole deck feels disciplined.

Check:

- topbar to section start
- section head to evidence row
- page bottom to footer
- page-to-page consistency within a page family

## Plotting-Area Priority Rule

When choosing between extra framing and more plot:

- choose more plot unless the framing is essential to comprehension

This deck gets much of its quality from letting evidence breathe.

## Plot Density Rules

Plot density should be strong enough to look intentional but light enough to remain readable.

Rules:

- avoid huge empty plot zones
- avoid overpacking labels into a tiny area
- calibrate point count, label count, and plot size together

## Readability Over Symmetry Rule

Perfect geometric symmetry is less important than clean reading.

Therefore:

- allow slight asymmetry if it materially improves chart legibility
- keep asymmetry controlled and justified
- do not force mirrored layouts when content weight is different

## Readability Triage

When a page is hard to read, check in this order:

1. headline clarity
2. bullet compression
3. chart type clarity
4. label size
5. plot spacing
6. color meaning
7. support-module noise

## Readability At Presentation Distance

Always judge readability as if the page were being presented, not just inspected up close.

Rules:

- important labels should survive normal zoom
- small notes should stay secondary
- no key business message should depend on tiny type

## Design Board Entry Rules

A design board should have a clear entry point.

Possible entry anchors:

- the headline
- the left logic panel
- one hero image cluster

Do not make the viewer search for where to start.

## Board Logic Spine

Even visual boards need a logic spine.

That spine should usually be:

- need
- direction
- design point
- evidence

If the board only shows imagery and labels, it is incomplete.

## Board Module Hierarchy

On board pages:

- one module should clearly lead
- support modules should feel subordinate
- image groups should not all compete equally

Avoid a wall of equal boxes.

## Board Labeling Rules

Board labels should be:

- short
- concrete
- buildable
- consistent with the image content

Avoid poetic or fashion-editorial labels that do not help development.

## Board Evidence Balance

Boards should balance inspiration and proof.

Rules:

- imagery can lead the emotion
- but at least one support layer should justify why the direction matters
- support can be text, tags, a small chart, or structured cues

## Board Left-Right Tension Rules

For split boards:

- the left side should provide logic
- the right side should provide visual evidence
- neither side should feel like a leftover area

If the left side is too dense, the board becomes a text report.
If the right side is too chaotic, the board becomes a collage.

## Board Cropping Rules

When selecting product imagery:

- crop for the design point being argued
- do not keep background clutter if it weakens the read
- align crops when the images are meant to compare
- allow intentional variation only when it supports hierarchy

## Board Grouping Rules

Group images by one logic at a time:

- silhouette
- pocket treatment
- hood treatment
- hem treatment
- fabric surface
- color family

Do not mix unrelated grouping logic in the same row.

## Board Caption Rules

Captions should clarify what the viewer should notice.

Rules:

- keep them short
- keep them close to the relevant image
- avoid repeating the image label and the caption with the same wording

## Board Image Count Rules

More images do not automatically make a stronger board.

Rules:

- choose enough images to prove a direction
- stop before redundancy
- remove weak or repetitive references aggressively

## Color Story Structure

A color-read page should usually have:

1. one color conclusion
2. one short rationale
3. one constrained set of chips or swatches
4. one curated image wall proving usage

If the page has more than that, check whether it is trying to become a palette database.

## Color Story Narrowing Rules

When the color story feels too broad:

- reduce the number of named colors
- merge similar tones
- keep only the colors that change the design recommendation
- cut decorative supporting references

## Color Chip Rules

Color chips should behave like analytical tools.

Rules:

- keep size consistent
- keep labels legible
- avoid over-styled chip containers
- show only enough chips to carry the logic

## Color Chip Layout Rules

If multiple chips are shown:

- align them cleanly
- maintain equal rhythm
- avoid ragged wrapping unless the page intentionally uses that expression

## Color Family Naming Rules

A color family name should be:

- specific enough to guide design
- broad enough to cover grouped variants
- consistent across chips, captions, and copy

Avoid poetic names that make replacement and comparison harder.

## Color Comparison Rules

When comparing colors across brands or segments:

- compare families, not isolated swatches
- keep the comparison at the level of design implication
- do not imply false precision if the visual evidence is qualitative

## Color Temperature Rules

If the page discusses warm vs cool direction:

- make the comparison visually obvious
- avoid mixing too many mid-tone exceptions
- keep the takeaway linked to product application

## Color Saturation Rules

If saturation level matters:

- show the contrast with enough clarity
- explain whether muted, chalky, bright, or technical tones are favored
- connect that read to product positioning rather than aesthetics alone

## Color-As-Accent Rules

Many pages in this deck use color as accent, not main story.

Rules:

- keep accent colors subordinate to the neutral system
- do not let one bright chip hijack the page
- use accent color to reinforce, not distract

## Color-Read Image Wall Rules

Color-read imagery should show how color behaves on product, not just color in isolation.

Rules:

- prioritize product shots over abstract mood images
- keep crop logic clear
- group images by useful color logic
- avoid moodboard clutter

## Color Read Label Density

Do not over-label color pages.

Rules:

- one clear family label can do more than many micro tags
- use secondary labels only when they change interpretation
- leave room for the eye to read color itself

## Color Read Premium Tone

To keep color pages premium:

- preserve whitespace
- keep chip count limited
- reduce decorative framing
- let material and product imagery do the work

## Brand-Compare Page Defaults

A brand-compare page should answer:

- who leads on what
- what patterns repeat
- what gaps or opportunities matter for the user's brand

The page should not try to archive everything known about all brands.

## Brand-Compare Ranking Rules

If ranking is shown:

- make the ranking purpose explicit
- pair rank with at least one interpretive layer
- avoid a ranking-only page unless the insight is truly just rank

## Brand-Compare Matrix Defaults

If the compare page uses a matrix:

- choose only the dimensions that change strategy
- keep rows limited
- keep cell language consistent
- make the final read actionable

## Brand-Compare Radar Defaults

If the compare page uses radar:

- support it with a short translation
- keep series count low
- ensure the radar complements, not replaces, the real insight

## Brand-Compare Pill Defaults

If compare pills are used near the top of a page:

- keep count limited
- align them tightly
- make them summary aids, not primary evidence

## Brand-Compare Translation Rule

Every compare page should translate evidence into one clear implication for the user's development work.

Without that translation, the page is only observation.

## Page-Family Consistency Rules

Pages within the same family should share:

- similar intro depth
- similar panel treatment
- similar chart-title behavior
- similar footer weight
- similar spacing rhythm

This consistency helps the deck feel authored by one mind.

## Intentional Variation Rule

Variation is allowed only when it serves content.

Good reasons for variation:

- a page is image-led rather than data-led
- a page needs a comparison system
- a page needs a board layout

Bad reasons:

- visual boredom
- random experimentation
- importing a layout from another project without fit

## Page-Specific Exception Rule

Some pages can break defaults, but only if:

- the exception is deliberate
- the reading becomes better
- the page still belongs to the same deck

Breaking the system should feel like a controlled exception, not drift.
