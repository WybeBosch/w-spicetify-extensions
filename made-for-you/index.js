const MADE_FOR_YOU = "/genre/0JQ5DAt0tbjZptfcdMSKl3";

function render() {
	return Spicetify.React.createElement(Redirect);
}

function Redirect() {
	Spicetify.React.useEffect(() => {
		Spicetify.Platform.History.replace(MADE_FOR_YOU);
	}, []);
	return null;
}
