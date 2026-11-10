# Release Date

Shows the release date of the playing track above its title, and adds "Show release date" to the track context menu.

Replaces Song Stats (CharlieS1103), which died when Spotify closed the audio-features API. Uses the client's internal GraphQL `getTrack` query, so no Web API calls and no rate limits.

Install: symlink `release-date.js` into `~/.config/spicetify/Extensions/`, then `spicetify config extensions release-date.js && spicetify apply`.
