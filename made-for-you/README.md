# Made For You

Custom app that adds a "Made For You" link to the navigation. It opens Spotify's own Made For You page (`/genre/0JQ5DAt0tbjZptfcdMSKl3`).

As a custom app, spicetify places the link itself, so it survives sidebar changes.

## Install

Copy this folder to your spicetify `CustomApps` folder as `made-for-you` (`spicetify config-dir` shows where), then:

```sh
spicetify config custom_apps made-for-you
spicetify apply
```
