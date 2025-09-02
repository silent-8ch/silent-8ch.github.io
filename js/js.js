const params = new URLSearchParams(window.location.search);
const stage =  params.get("stage");

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
			stageHref = "funtimes.html"
			stageString = "Fun Times";
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
			stageHref = "funtimes.html"
			stageString = "Fun Times";
		break;
	}
	if (stageLink) {
		stageLink.href = stageHref;
		stageLink.textContent = stageString
	}	
});
