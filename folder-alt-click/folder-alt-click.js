// NAME: Folder Alt Click
// DESCRIPTION: Alt-click a folder arrow in Your Library to collapse (or expand) it together with all its subfolders.

(function folderAltClick() {
	if (!Spicetify?.Platform?.RootlistAPI || !Spicetify.Platform.LocalStorageAPI) {
		setTimeout(folderAltClick, 300);
		return;
	}

	async function subfolders(uri) {
		const { items } = await Spicetify.Platform.RootlistAPI.getContents();
		const find = (list) => {
			for (const i of list) {
				if (i.type !== "folder") continue;
				if (i.uri === uri) return i;
				const hit = find(i.items);
				if (hit) return hit;
			}
			return null;
		};
		const all = [];
		const collect = (folder) => folder.items.forEach((i) => i.type === "folder" && (all.push(i.uri), collect(i)));
		const folder = find(items);
		if (folder) collect(folder);
		return all;
	}

	document.addEventListener(
		"click",
		async (e) => {
			const button = e.target.closest?.(".main-yourLibraryX-listItem button[aria-label='Collapse folder'], .main-yourLibraryX-listItem button[aria-label='Expand folder']");
			if (!button || !e.altKey) return;
			const uri = button
				.closest(".main-yourLibraryX-listItem")
				.querySelector("[aria-labelledby*=':folder:']")
				?.getAttribute("aria-labelledby")
				.match(/listrow-title-(\S+)/)?.[1];
			if (!uri) return;
			const collapsing = button.getAttribute("aria-label") === "Collapse folder";
			const nested = await subfolders(uri);
			const storage = Spicetify.Platform.LocalStorageAPI;
			const expanded = new Set(storage.getItem("ylx-expanded-folders") ?? []);
			for (const f of [uri, ...nested]) collapsing ? expanded.delete(f) : expanded.add(f);
			storage.setItem("ylx-expanded-folders", [...expanded]);
		},
		true,
	);
})();
