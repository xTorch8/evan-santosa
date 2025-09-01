/** @type {import('tailwindcss').Config} */
export default {
	content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
	theme: {
		extend: {
			colors: {
				navy: "#0D1232",
				biru1: "#C6DBEF",
				biru2: "#BDE3FF",
				biru5: "#445EF2",
				darkblue: "#002B58",
				gold: "#FCD324",
				silver: "#D9E0D2",
				bronze: "#F4AA6B",
				color4: "#445EF2",
			},
			fontFamily: {
				quicksand: ["Quicksand", "sansserif"],
			},
		},
	},
	plugins: [],
};
