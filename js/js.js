const SINGLE_VIDEO_DURATION = 290;
const NUM_VIDEOS = 8;
const TOTAL_DURATION = SINGLE_VIDEO_DURATION * NUM_VIDEOS;

const apngList = [
	"background_apngs/1.apng",
	"background_apngs/2.apng",
	"background_apngs/3.apng",
	"background_apngs/4.apng",
	"background_apngs/5.apng",
	"background_apngs/6.apng",
	"background_apngs/7.apng",
	"background_apngs/8.apng"
];

document.addEventListener("DOMContentLoaded", () => {
	var user = "silent8ch";
	var domain = "gmail.com";
	var email = user + "@" + domain;
	var link = document.getElementById("mail-link");
	link.href = "mailto:" + email;
	link.textContent = email;
	setBackgroundApng();
	setTimeout(() => {
	window.location.reload();
	}, 290000);
	const params = new URLSearchParams(window.location.search);
    const playerVal = params.get("player");

    if (playerVal === "1") {
    	document.querySelectorAll(".container").forEach(container => {
        	container.style.display = "none";
    	});
    }
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
