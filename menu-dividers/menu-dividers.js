// NAME: Menu Dividers
// DESCRIPTION: Groups the context menu: own extensions, other extensions, then Spotify's items with an extra divider before "Hide song".

(function menuDividers() {
	const V = Spicetify?.ContextMenuV2;
	if (!V?.renderItems || !Spicetify.React) {
		setTimeout(menuDividers, 300);
		return;
	}

	const OWN = new Set(["Copy titles", "Show release date"]);
	const NATIVE_DIVIDE_BEFORE = new Set(["Hide song"]);
	const divider = (key) => Spicetify.React.createElement("div", { key, className: "main-contextMenu-dividerBefore" });

	const renderItems = V.renderItems;
	V.renderItems = function () {
		const items = renderItems.apply(this, arguments);
		if (!items.length) return items;
		const own = items.filter((i) => OWN.has(i.props?.children));
		const other = items.filter((i) => !own.includes(i));
		return [...own, own.length && other.length && divider("own-divider"), ...other, divider("extensions-divider")].filter(Boolean);
	};

	new MutationObserver(() => {
		const menu = document.getElementById("context-menu");
		if (!menu) return;
		for (const li of menu.querySelectorAll("li.main-contextMenu-menuItem")) {
			if (NATIVE_DIVIDE_BEFORE.has(li.textContent) && !li.previousElementSibling?.matches(".main-contextMenu-dividerBefore")) {
				const d = document.createElement("div");
				d.className = "main-contextMenu-dividerBefore";
				li.before(d);
			}
		}
	}).observe(document.body, { childList: true, subtree: true });
})();
