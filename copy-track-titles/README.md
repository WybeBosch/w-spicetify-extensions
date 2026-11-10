# Copy Track Titles

Select one or more tracks, right-click, "Copy titles". Copies `Artist, Artist - Title` lines to the clipboard.

Replaces CopyTrackTitles (mchubby). Uses the internal GraphQL `getTrack` query.

Install: symlink `copy-track-titles.js` into `~/.config/spicetify/Extensions/`, then `spicetify config extensions copy-track-titles.js && spicetify apply`.
