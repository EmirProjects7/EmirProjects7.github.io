# Portfolio

Personal portfolio site. Plain HTML, CSS and JavaScript, no build step, no
dependencies, no third-party requests.

Live at <https://emirprojects7.github.io>.

## Layout

```
index.html            the whole page
assets/css/style.css  styles
assets/js/main.js     demo loader
demos/<name>/         one self-contained demo per project
```

## Project demos

Each demo is a single HTML file that runs entirely in the browser: no server, no
database, no storage. State lives in memory, so reloading resets it. The page
ships with a poster drawn in CSS; the iframe is created only when the visitor
presses play, which keeps the first load light.

To add one, drop `demos/<name>/index.html` in place and copy the `.demo` block in
`index.html`, pointing `data-src` at the new file.

## Running locally

```
python3 -m http.server 4173 --bind 127.0.0.1
```

Then open <http://localhost:4173>.

## Deploying

GitHub Pages serves the default branch from the repository root, so a push to
`main` is the deploy. `.nojekyll` keeps Pages from running the files through
Jekyll first.
