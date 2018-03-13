// ==UserScript==
// @name		lainmod
// @namespace	https://niles.xyz
// @include 	http://lainchan.org/*/res/*
// @include 	https://lainchan.org/*/res/*
// @include 	http://lainchan.org/*/catalog.html
// @include 	https://lainchan.org/*/catalog.html
// @version		2.0
// @grant       GM_getValue
// @grant       GM_setValue
// @run-at		document-end
// ==/UserScript==
var started = false;
var onload = function () {

	// Only start once
	if (started) {
		return;
	}
	started = true;

	var as = $("#Grid .mix a");
	for (var i = 0; i < as.length; i++) {
		var a = as[i];
		// I think this will always return true for "#Grid .mix a", but the selector used to be $("a") and it can't hurt
		if (a.href.indexOf("/res/") != -1) {
			a.href = a.href.replace("lainchan.org", "lainchan.org/mod.php?");
		}
	}


	var rs = $("#Grid .mix");
	for (i = 0; i < rs.length; i++) {
		var r = rs[i];
		var replies = parseFloat(r.children[0].children[1].children[0].innerHTML.replace("R: ", ""));
		var href = r.children[0].children[0].href;
		// I get the board for each post instead of just once at the beginning because of /mega/
		var board = href.substr(0, href.lastIndexOf("/")); // like "https://lainchan.org/q/res"
		board = board.substr(0, board.lastIndexOf("/")); // like "https://lainchan.org/q"
		board = board.substr(board.lastIndexOf("/") + 1); // like "q"
		var id = href.substr(href.lastIndexOf("/") + 1).replace(".html", ""); // like "1"
		var key = board.concat(":".concat(id)); // like "q:1", just used for local storage
		var oldreplies = GM_getValue(key, -1);
		if (oldreplies < replies) {
			r.children[0].children[1].children[0].innerHTML = "<span style='color:red;'>+" + (replies - oldreplies) + "</span>";
			r.children[0].children[0].href += "#" + (replies - oldreplies);
			// we have to wrap this in a closure because otherwise it clicking any post would only update the last post processed in this loop
			(function(intkey, intreplies, intr) {
				r.addEventListener("click", function() {
					GM_setValue(intkey, intreplies);
					//alert("clicked " + intkey);
					intr.children[0].children[1].children[0].innerHTML = "Read all " + intreplies + " replies";
				});
			})(key, replies, r);
		} else {
			r.children[0].children[1].children[0].innerHTML = "Read all " + replies + " replies";
		}
	}
	var ops = Array.prototype.slice.call(document.getElementsByClassName("op")).filter(function(e) { return e.classList.contains("post"); });
	var reply_containers = Array.prototype.slice.call(document.getElementsByClassName("postcontainer"));
	var posts = ops.concat(reply_containers);
	var req = Number(document.location.hash.slice(1));
	if (!isNaN(req) && req !== 0) {
		var to_select = posts[posts.length - req];
		to_select.scrollIntoView(true);
		var hr = document.createElement("hr");
		to_select.parentElement.insertBefore(hr, to_select);
		hr.style.display = "block";
		hr.style.borderTop = "1px solid red";
		GM_setValue(encodeURIComponent(board_name) + ":" + thread_id, posts.length - 1);
	}
};

// In chrome, the userscript runs in a sandbox, and will never see these events
// Hence the run-at document-end
//document.addEventListener('DOMContentLoaded', onload);
//document.onload = onload;

// One of these should work, and the started variable should prevent it from starting twice (I hope)
function GM_main() {
	onload();
}
onload();

