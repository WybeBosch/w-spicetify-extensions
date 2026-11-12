# w-spicetify-extensions

Extensions for [Spicetify](https://spicetify.app). They only use Spotify's internal client APIs, not the public Web API, so they do not run into its rate limits (429).

Built and tested on Spotify 1.2.87 with spicetify 2.46.4.

| Extension | What it does |
|---|---|
| [Like Button](like-button/) | Heart button on tracklist rows and in the now playing bar. A half heart means another version of the same recording is already liked. No Web API calls. |
| [Release Date](release-date/) | Shows the release year next to the playing track's title, and the full release date in the track context menu. |
| [Genre Tags](genre-tags/) | Shows Last.fm genre tags of the playing artist in the now playing bar. Click a tag to open its 'The Sound of' playlist by The Sounds of Spotify. |
| [Playing From](playing-from/) | Shows the playlist, album or artist you are playing from in the now playing bar. Click it to open it. Shows 'Recommended songs' during autoplay. |
| [Copy Track Titles](copy-track-titles/) | Adds 'Copy titles' to the track context menu. Copies the selected tracks as 'Artist - Title' lines. |
| [Random Playlist](random-playlist/) | Button next to the Your Library title that plays a random playlist from your library, opens it and scrolls to it in the sidebar. |
| [Folder Breadcrumb](folder-breadcrumb/) | Shows the library folder path at the top of a playlist page. Click a folder to expand it and jump to it in the sidebar. |
| [Folder Alt Click](folder-alt-click/) | Alt-click a folder arrow in Your Library to collapse or expand it together with all its subfolders. |
| [Menu Dividers](menu-dividers/) | Groups the track context menu with extra dividers: these extensions, other extensions, then Spotify's own items. |
| [Layout Tweaks](layout-tweaks/) | Shows up to 10 custom app icons in the top bar instead of 4. |
| [Made For You](made-for-you/) | Custom app: a "Made For You" link in the navigation that opens Spotify's own Made For You page. |

## Install

**Marketplace:** search for the extension name in the Extensions tab of the Spicetify Marketplace.

**Manual:** copy the `.js` file of an extension into your spicetify `Extensions` folder (`spicetify config-dir` shows where), then:

```sh
spicetify config extensions like-button.js
spicetify apply
```

Made For You is a custom app, see [its README](made-for-you/README.md).

## Notes

- Genre Tags needs a free [Last.fm API key](https://www.last.fm/api/account/create), see [its README](genre-tags/README.md).
- Menu Dividers, Random Playlist and Folder Alt Click match on Spotify's English labels, so they need the client language set to English.
- Spotify changes its client often. If something breaks after a Spotify update, open an issue.

## License

MIT
