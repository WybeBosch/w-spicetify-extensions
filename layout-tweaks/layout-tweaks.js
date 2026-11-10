// NAME: Layout Tweaks
// DESCRIPTION: Small CSS overrides: show up to 10 custom app icons in the top bar instead of 4.

(function layoutTweaks() {
	const style = document.createElement("style");
	style.textContent = ":root { --max-custom-navlink-count: 10 !important; }";
	document.head.append(style);
})();
