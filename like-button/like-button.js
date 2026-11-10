// NAME: Like Button
// DESCRIPTION: Heart on tracklist rows next to "Add to playlist". Full heart: liked. Half heart: another version of the same recording (ISRC) is liked. Internal Spotify APIs only, no Web API.

(async function likeButton() {
	const L = Spicetify?.Platform?.LibraryAPI;
	const main = document.querySelector(".Root__main-view");
	if (!L?.getEvents || !Spicetify.Platform.AuthorizationAPI || !main) {
		setTimeout(likeButton, 300);
		return;
	}

	const ICONS = {
		liked: '<path d="M12 4.248c-3.148-5.402-12-3.825-12 2.944 0 4.661 5.571 9.427 12 15.808 6.43-6.381 12-11.147 12-15.808 0-6.792-8.875-8.306-12-2.944z"/>',
		half: '<path d="M 5.449219 1.058594 C 5.339844 1.078125 5 1.148438 4.699219 1.210938 C 4.398438 1.269531 3.769531 1.5 3.300781 1.71875 C 0.710938 2.960938 -0.550781 5.949219 0.261719 8.949219 C 0.648438 10.410156 1.851562 12.390625 3.550781 14.398438 C 4.089844 15.03125 6.210938 17.238281 8.269531 19.300781 L 12 23.050781 L 15.730469 19.300781 C 19.769531 15.25 21.019531 13.859375 22.160156 12.148438 C 23.359375 10.339844 23.851562 9.109375 23.960938 7.550781 C 24.199219 4.410156 22.148438 1.761719 19 1.140625 C 16.480469 0.640625 13.738281 1.699219 12.390625 3.691406 C 12.199219 3.96875 12.03125 4.199219 12 4.199219 C 11.96875 4.199219 11.871094 4.070312 11.769531 3.910156 C 11.238281 3.011719 10 1.988281 8.871094 1.53125 C 7.839844 1.109375 6.28125 0.898438 5.449219 1.058594 Z M 9.289062 4.039062 C 9.691406 4.171875 10.269531 4.449219 10.570312 4.660156 C 11.160156 5.070312 11.859375 5.871094 11.949219 6.230469 C 11.980469 6.351562 11.988281 9.550781 11.980469 13.351562 L 11.949219 20.25 L 9.140625 17.449219 C 5.28125 13.589844 4.019531 12.011719 3.269531 10.050781 C 3.121094 9.660156 3.070312 9.28125 3.070312 8.351562 C 3.058594 7.179688 3.070312 7.128906 3.410156 6.398438 C 3.929688 5.300781 4.898438 4.441406 6.050781 4.050781 C 6.679688 3.839844 6.800781 3.820312 7.699219 3.808594 C 8.359375 3.800781 8.730469 3.859375 9.289062 4.039062 Z M 9.289062 4.039062"/>',
		none: '<path d="M19.5 10c-2.483 0-4.5 2.015-4.5 4.5s2.017 4.5 4.5 4.5 4.5-2.015 4.5-4.5-2.017-4.5-4.5-4.5zm2.5 5h-2v2h-1v-2h-2v-1h2v-2h1v2h2v1zm-6.527 4.593c-1.108 1.086-2.275 2.219-3.473 3.407-6.43-6.381-12-11.147-12-15.808 0-4.005 3.098-6.192 6.281-6.192 2.197 0 4.434 1.042 5.719 3.248 1.279-2.195 3.521-3.238 5.726-3.238 3.177 0 6.274 2.171 6.274 6.182 0 .746-.156 1.496-.423 2.253-.527-.427-1.124-.768-1.769-1.014.122-.425.192-.839.192-1.239 0-2.873-2.216-4.182-4.274-4.182-3.257 0-4.976 3.475-5.726 5.021-.747-1.54-2.484-5.03-5.72-5.031-2.315-.001-4.28 1.516-4.28 4.192 0 3.442 4.742 7.85 10 13l2.109-2.064c.376.557.839 1.048 1.364 1.465z"/>',
	};
	const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
	const req = (r) => new Promise((res, rej) => ((r.onsuccess = () => res(r.result)), (r.onerror = () => rej(r.error))));

	const open = indexedDB.open("like-button", 1);
	open.onupgradeneeded = () => open.result.createObjectStore("isrc");
	const db = await req(open);
	const store = (mode) => db.transaction("isrc", mode).objectStore("isrc");

	// track id -> ISRC, "" when the track has none
	const isrcs = new Map();
	const [keys, values] = await Promise.all([req(store("readonly").getAllKeys()), req(store("readonly").getAll())]);
	keys.forEach((k, i) => isrcs.set(k, values[i]));
	if (!isrcs.size) {
		const s = store("readwrite");
		for (const k of Object.keys(localStorage)) {
			const v = localStorage.getItem(k);
			if (k.startsWith("maskowh-oldlike-") && /^[a-z0-9]{12}$/i.test(v)) {
				isrcs.set(k.slice(16), v.toUpperCase());
				s.put(v.toUpperCase(), k.slice(16));
			}
		}
	}

	const B62 = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
	const gid = (id) => [...id].reduce((n, c) => n * 62n + BigInt(B62.indexOf(c)), 0n).toString(16).padStart(32, "0");

	async function fetchIsrc(id) {
		const token = Spicetify.Platform.AuthorizationAPI.getState().token.accessToken;
		const res = await fetch(`https://spclient.wg.spotify.com/metadata/4/track/${gid(id)}`, { headers: { authorization: `Bearer ${token}` } });
		if (!res.ok) throw new Error(`metadata ${res.status}`);
		const text = new TextDecoder("latin1").decode(await res.arrayBuffer());
		return text.match(/\x04isrc\x12\x0c([a-z0-9]{12})/i)?.[1].toUpperCase() ?? "";
	}

	// Serial and slow on purpose: the old extension fired 50-track batches every 30 s and got the client rate limited.
	const wanted = new Set();
	let pumping = false;
	function want(id) {
		if (isrcs.has(id) || wanted.has(id)) return;
		wanted.add(id);
		pump();
	}
	async function pump() {
		if (pumping) return;
		pumping = true;
		for (const id of wanted) {
			try {
				const isrc = await fetchIsrc(id);
				isrcs.set(id, isrc);
				store("readwrite").put(isrc, id);
				wanted.delete(id);
				schedulePaint();
				await sleep(200);
			} catch (e) {
				console.warn("[like-button]", e);
				await sleep(60000);
			}
		}
		pumping = false;
	}

	let liked = new Set();
	let likedIsrcs = new Set();
	async function loadLiked() {
		const { items } = await L.getTracks({ limit: 99999 });
		liked = new Set(items.filter((t) => t.uri.startsWith("spotify:track:")).map((t) => t.uri.slice(14)));
		liked.forEach(want);
		schedulePaint();
	}

	function tip(el, text) {
		el.setAttribute("aria-label", text);
		if (el._tippy) el._tippy.setContent(text);
		else if (text) Spicetify.Tippy(el, { ...Spicetify.TippyProps, content: text });
	}

	function paint(btn) {
		const id = btn.dataset.id;
		const state = liked.has(id) ? "liked" : likedIsrcs.has(isrcs.get(id)) ? "half" : "none";
		if (btn.dataset.state === state) return;
		btn.dataset.state = state;
		btn.setAttribute("aria-checked", String(state !== "none"));
		tip(btn, state === "liked" ? "Remove from Liked Songs" : state === "half" ? "Add to Liked Songs (another version is already liked)" : "Add to Liked Songs");
		btn.style.opacity = state === "none" ? "" : "1";
		btn.querySelector("svg").innerHTML = ICONS[state];
		btn.querySelector("svg").style.fill = state === "none" ? "var(--text-subdued)" : "var(--text-bright-accent)";
	}

	async function toggle(e) {
		e.stopPropagation();
		const btn = e.currentTarget;
		const id = btn.dataset.id;
		const uris = [`spotify:track:${id}`];
		if (liked.has(id)) {
			await L.remove({ uris });
			liked.delete(id);
		} else {
			await L.add({ uris });
			liked.add(id);
		}
		schedulePaint();
	}

	function attach(anchor, uri) {
		let btn = anchor.previousElementSibling;
		if (!btn?.classList.contains("like-button")) {
			btn = document.createElement("button");
			btn.className = `${anchor.className} like-button`;
			btn.innerHTML = '<span class="e-10180-button__icon-wrapper"><svg role="img" height="16" width="16" viewBox="0 0 24 24"></svg></span>';
			btn.onclick = toggle;
			anchor.before(btn);
		}
		const id = uri.slice(14);
		if (btn.dataset.id !== id) {
			btn.dataset.id = id;
			delete btn.dataset.state;
		}
		want(id);
		paint(btn);
	}

	function scan() {
		likedIsrcs = new Set([...liked].map((id) => isrcs.get(id)).filter(Boolean));
		for (const row of main.querySelectorAll("[data-sp-track-uri^='spotify:track:']")) {
			const anchor = row.querySelector(".main-trackList-rowAddToPlaylistButton:not(.like-button)");
			if (anchor) attach(anchor, row.dataset.spTrackUri);
		}
		const uri = Spicetify.Player.data?.item?.uri;
		const anchor = document.querySelector(".main-nowPlayingWidget-actionButtonWrapper > button:not(.like-button)");
		if (anchor && uri?.startsWith("spotify:track:")) attach(anchor, uri);
	}

	let queued = false;
	function schedulePaint() {
		if (queued) return;
		queued = true;
		requestAnimationFrame(() => {
			queued = false;
			scan();
		});
	}

	L.getEvents()._emitter.addListener("update", loadLiked, {});
	new MutationObserver(schedulePaint).observe(main, { childList: true, subtree: true });
	new MutationObserver(schedulePaint).observe(document.querySelector(".Root__now-playing-bar") ?? document.body, { childList: true, subtree: true });
	Spicetify.Player.addEventListener("songchange", schedulePaint);
	loadLiked();
})();
