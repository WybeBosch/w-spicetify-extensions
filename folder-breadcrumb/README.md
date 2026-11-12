# Folder Breadcrumb

Shows the library folder path (for example `Games › Racing`) at the top of a playlist page.

Click a folder in the path: it expands in the sidebar together with its parent folders, the sidebar jumps to it and the row flashes briefly.

The path hides when you scroll down, because Spotify then shows its own title and play button in that bar. Playlists that are not in a folder show no path.

Uses `Spicetify.Platform.RootlistAPI.getContents()` and the native `ylx-expanded-folders` setting.
