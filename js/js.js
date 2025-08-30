const params = new URLSearchParams(window.location.search);
const stage =  params.get("stage");
var SINGLE_VIDEO_DURATION = 178;
var NUM_VIDEOS = 13
var apngList = [];
switch (stage) {
	case "filtered":
		SINGLE_VIDEO_DURATION = 290;
		NUM_VIDEOS = 8
		TOTAL_DURATION = SINGLE_VIDEO_DURATION * NUM_VIDEOS;
		apngList = [
			"background_apngs/1.apng",
			"background_apngs/2.apng",
			"background_apngs/3.apng",
			"background_apngs/4.apng",
			"background_apngs/5.apng",
			"background_apngs/6.apng",
			"background_apngs/7.apng",
			"background_apngs/8.apng"
		];
	break;
	case "woke":
		SINGLE_VIDEO_DURATION = 290;
		NUM_VIDEOS = 8
		TOTAL_DURATION = SINGLE_VIDEO_DURATION * NUM_VIDEOS;
		apngList = [
			"background_apngs/part1.apng",
			"background_apngs/part2.apng",
			"background_apngs/part3.apng",
			"background_apngs/part4.apng",
			"background_apngs/part5.apng",
			"background_apngs/part6.apng",
			"background_apngs/part7.apng",
			"background_apngs/part8.apng"
		];
	break;
	default:
		SINGLE_VIDEO_DURATION = 178;
		NUM_VIDEOS = 13
		TOTAL_DURATION = SINGLE_VIDEO_DURATION * NUM_VIDEOS;
		apngList = [
			"background_apngs/segment_1.apng",
			"background_apngs/segment_2.apng",
			"background_apngs/segment_3.apng",
			"background_apngs/segment_4.apng",
			"background_apngs/segment_5.apng",
			"background_apngs/segment_6.apng",
			"background_apngs/segment_7.apng",
			"background_apngs/segment_8.apng",
			"background_apngs/segment_9.apng",
			"background_apngs/segment_10.apng",
			"background_apngs/segment_11.apng",
			"background_apngs/segment_12.apng",
			"background_apngs/segment_13.apng"
		];
	break;
}
document.addEventListener("DOMContentLoaded", () => {
	var user = "silent8ch";
	var domain = "gmail.com";
	var email = user + "@" + domain;
	var link = document.getElementById("mail-link");
	//check if link is null
	if (link) {
		link.href = "mailto:" + email;
		link.textContent = email;		
	}

	var stageLink = document.getElementById("stage-link");
	var stageString = ""
	var stageHref = ""
	switch (stage) {
		case "dream":
			stageHref = "?stage=woke"
			stageString = "Wake up.";
		break;
		case "woke":
			stageHref = "?stage=filtered"
			stageString = "Filter reality.";
		break;
		case "filtered":
			stageHref = "?stage=dream"
			stageString = "Enter the dream.";
		break;
		default:
			stageHref = "?stage=woke"
			stageString = "Wake up.";
		break;
	}
	if (stageLink) {
		stageLink.href = stageHref;
		stageLink.textContent = stageString
	}
	setBackgroundApng();
	setTimeout(() => {
	window.location.reload();
	}, SINGLE_VIDEO_DURATION * 1000);
	
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
