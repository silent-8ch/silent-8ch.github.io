const SINGLE_VIDEO_DURATION = 290;
const NUM_VIDEOS = 8;
const TOTAL_DURATION = SINGLE_VIDEO_DURATION * NUM_VIDEOS;

const apngList = [
	"1.apng",
	"2.apng",
	"3.apng",
	"4.apng",
	"5.apng",
	"6.apng",
	"7.apng",
	"8.apng"
];

document.addEventListener("DOMContentLoaded", () => {
	var user = "paul";
	var domain = "p4u1.com";
	var email = user + "@" + domain;
	var link = document.getElementById("mail-link");
	link.href = "mailto:" + email;
	link.textContent = email;
	setBackgroundApng();
	setTimeout(() => {
	window.location.reload();
	}, 290000);
});

function getApngIndexForCurrentTime() {
	const now = new Date();
	const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
	const secondsSinceMidnight = (now - midnight) / 1000;
	const cyclePosition = secondsSinceMidnight % TOTAL_DURATION;
	const videoIndex = Math.floor(cyclePosition / SINGLE_VIDEO_DURATION);
	return videoIndex;
}

function setBackgroundApng() {
	const idx = getApngIndexForCurrentTime();
	const chosenApng = apngList[idx] || apngList[0];
	const bgDiv = document.querySelector(".background-container");
	bgDiv.style.backgroundImage = `url("${chosenApng}")`;
}
