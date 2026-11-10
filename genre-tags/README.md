# Genre Tags

Shows the top Last.fm tags of the playing artist above the track title. Click a tag to search Spotify for its "The Sound of ..." playlist (Every Noise).

Replaces Better Spotify Genres (Vexcited), whose repo was deleted. Spotify no longer exposes artist genres in its internal metadata, and the Web API is rate limited, so this uses Last.fm.

Needs a Last.fm API key in localStorage `genre-tags:lastfm-api-key`. Falls back to the Stats app key (`stats:config:api-key`).

Install: symlink `genre-tags.js` into `~/.config/spicetify/Extensions/`, then `spicetify config extensions genre-tags.js && spicetify apply`.
