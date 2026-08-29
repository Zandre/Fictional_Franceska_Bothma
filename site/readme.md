# Franceska Bothma — online profile

A five-page static profile. No framework, no build step required, no data collected.

## Files

    site/
      index.html          Profile / about
      experience.html     Timeline, roles expand on click
      interests.html      Six animated scenes
      skills.html         Skills planted as a garden — click a bloom
      ambitions.html      Three growing trees + closing note
      css/main.css        Compiled stylesheet (committed — open the HTML and it works)
      scss/               Source styles
        _tokens.scss      Colours, type, spacing, motion — change the look here
        _mixins.scss      Editorial column, hairlines, kicker type
        _base.scss        Resets and base type
        _layout.scss      Header, nav, page shell, hero, footer
        _components.scss  Cards, tags, timeline, garden, interests, ambitions
        _animations.scss  Every keyframe and every piece of scenery
        main.scss         Entry point
      js/main.js          Nav, scroll reveals, season switch, garden clicks

## Editing the styles

    sass scss/main.scss css/main.css --style=expanded

That is the only tooling. `css/main.css` is committed so the site runs by
double-clicking `index.html`; recompile after any SCSS change.

## Hosting

Upload the `site/` folder as-is to any static host (GitHub Pages, Netlify,
Cloudflare Pages, plain Apache). No server-side anything.

## Texture

The ground is not flat cream: `body` carries a 4px crossing hairline weave
(paper tooth) plus three soft radial washes — green at top-left, honey at
right, meadow-green at the foot — all fixed, so scrolling moves the page over
the light rather than with it. Every page ends in a grass band (`.meadow`)
drawn with four layers of crossing gradient strokes at different heights,
drifting slowly in the wind. All of it lives in `_base.scss` (weave and
washes) and `_animations.scss` (meadow).

## Design notes

Built on the *Classical* design system — Cormorant Garamond over Lora,
justified columns, hairline rules, colour applied as stroke rather than fill —
with the palette retuned from gold to a moss-green ramp. The single warm accent
(honey) is reserved for bees, pollen, sun and ripening crops.

All motion is CSS. `js/main.js` only adds `.is-visible` when a section scrolls
into view, tracks scroll for the vine in the header, and remembers the season.
Everything is switched off under `prefers-reduced-motion: reduce`.

### Animations

| Where | What grows |
| --- | --- |
| Hero | Sun rises and pulses, crops sway, bees fly looping paths, pollen drifts, petals fall, birds glide |
| Header | Scroll progress drawn as a vine; a leaf unfurls beside the current page |
| About / Ambitions | Vines draw themselves, buds open at the nodes |
| Experience | A vine grows down the timeline; a blossom opens at each role |
| Interests | Ripples and a swimmer, a bicycle crossing the frame, crops and bees, a tree growing branch by branch, steam, gliding birds |
| Skills | Stalks rise, leaves unfurl, blooms open — staggered along each bed |
| Ambitions | Trunk, then branches, then canopy, per tree |

### Seasons

The Spring / Summer / Autumn control in the header re-tints the foliage,
crops and falling petals. It is the only thing the site stores (one
`localStorage` key, `fb-season`).
