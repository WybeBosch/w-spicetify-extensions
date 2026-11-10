# Like Button

Heart button on tracklist rows and in the now playing widget. Replacement for Maskowh's Old Like Button.

- Full heart: liked. Half heart: another version of the same recording (ISRC) is liked. Plus heart: not liked.
- Liked list and like/unlike go through `Spicetify.Platform.LibraryAPI`, ISRCs through the internal metadata service (`spclient.wg.spotify.com/metadata/4/track/{gid}`). No Web API, so no 429s.
- ISRCs are cached in IndexedDB `like-button`. On first run it imports the old `maskowh-oldlike-*` localStorage cache.
- Missing ISRCs are fetched one at a time with a pause, and back off 60 s on errors.
