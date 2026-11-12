# Genre Tags

Shows the top Last.fm tags of the playing artist under the artist name in the now playing bar.

Click a tag to open the matching "The Sound of ..." playlist by [The Sounds of Spotify](https://open.spotify.com/user/thesoundsofspotify) (Every Noise at Once). If there is no exact match it opens the playlist search instead, where their playlists get a green border.

Spotify no longer exposes artist genres in its client, and the Web API is rate limited, so the tags come from Last.fm.

## Setup

You need a free [Last.fm API key](https://www.last.fm/api/account/create). Open the Spotify devtools console (`spicetify enable-devtools`, then right-click, Inspect) and run:

```js
localStorage.setItem("genre-tags:lastfm-api-key", "YOUR_KEY");
```

Then reload Spotify. If you use the Stats custom app with a Last.fm key, that key is used automatically.

## How the playlist lookup works

On first start it fetches the list of all "The Sound of" playlists once in the background (about 7000, takes under a minute) and caches it in localStorage for 30 days. Tag clicks before that finishes go to the search page.
