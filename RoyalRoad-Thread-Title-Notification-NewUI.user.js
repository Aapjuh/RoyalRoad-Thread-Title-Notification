// ==UserScript==
// @name			RoyalRoad Thread Title Notification NewUI
// @namespace		RoyalRoad Thread Title Notification NewUI
// @version			1.1
// @description		Adds the title of the topic when someone replies to your notifications.
// @author			Aapjuh
// @icon			https://raw.githubusercontent.com/Aapjuh/RoyalRoad-Thread-Title-Notification/main/RR-logo.png
// @supportURL		https://github.com/Aapjuh/RoyalRoad-Thread-Title-Notification/issues
// @homepageURL		https://github.com/Aapjuh/RoyalRoad-Thread-Title-Notification
// @downloadURL		https://github.com/Aapjuh/RoyalRoad-Thread-Title-Notification/raw/main/RoyalRoad-Thread-Title-Notification-NewUI.user.js
// @updateURL		https://github.com/Aapjuh/RoyalRoad-Thread-Title-Notification/raw/main/RoyalRoad-Thread-Title-Notification-NewUI.user.js
// @match			https://www.royalroad.com/*
// @grant			GM_xmlhttpRequest
// ==/UserScript==
/* globals jQuery, $ */
//
(function() {
	'use strict';

	//--- Wait for the document to be ready
	$(document).ready(function() {
		//--- Add Listener for notification icon (somehow 'once:true' fails to register clicks)
		document.getElementById("header_notification_bar").addEventListener("click", Run, true);
	})

	//--- Timeout after clicking notification icon
	function Run() {
        //--- Remove the Eventlistener
		document.getElementById("header_notification_bar").removeEventListener("click", Run, true);
		setTimeout(() => {Go()}, 1000);
	};

	//--- Funtion to grab individual notifications and filter them
	function Go() {
		//--- Get array of all notifications
		var Notes = GetNotes();
		//--- Loop through the array
		for (let i = 0; i < Notes.length; i++) {
			//--- Get the Note text for filtering
			var Note = GetNoteTextElem(Notes[i])
			//--- Filter the notifications that are related to a forum topic
			if (Note.textContent.toLowerCase().includes("replied to a thread".toLowerCase())) {
				//--- Send them to processing
				ProcessLink(Notes[i]);
			}
		}
	};

	//--- Get array of all notifications
	var GetNotes = function() {
		var NotesList = document.querySelectorAll('div[class="absolute w-fit flex-col overflow-hidden rounded-md bg-surface-alt border-1 shadow-on-surface/40 dark:shadow-primary/15 border-on-surface/25 dark:bg-surface-dark-alt shadow-lg z-50 top-full right-0 mt-1 min-w-[20rem] p-0 flex"]>div[class="w-80 max-w-sm"]>div[class="relative overflow-auto overflow-y-auto overflow-x-hidden scroll-area max-h-96 h-96"]')[0].children;
		return NotesList;
	}

	//--- Get the Note text for filtering
	var GetNoteTextElem = function(Note) {
		var NoteTextElem = Note.querySelector('div[class="flex-1 min-w-0 relative"]');
		return NoteTextElem ? NoteTextElem.children[0] : null;
	}

	//--- Process the notifications
	var ProcessLink = function(Notes) {
		//--- Get the Note text
		var NoteText = GetNoteTextElem(Notes);
		if (NoteText) {
			//--- Get the Topic Url, the post ID, and the username
			var TopicUrl = GetTopicUrl(Notes);
			var HrefPID = GetPID(TopicUrl);
			var UserName = GetUserName();
			//--- Get the page source from the url
			GetPage(TopicUrl, function(response) {
				//--- chop off part of the note text
				NoteText.textContent = NoteText.textContent.replace('a thread you are subscribed to.', '');
				//--- add the texts together
				NoteText.append(GetTopicTitle(response) + GetQuote(UserName, HrefPID, response));
			});
		}
	}

	//--- Get the Topic Url
	var GetTopicUrl = function(Notes) {
		var Href = Notes.getAttribute('href');
		return 'https://www.royalroad.com' + Href;
	}

	//--- Get the post ID
	var GetPID = function(TopicUrl) {
		var startPos = TopicUrl.indexOf("post=") + "post=".length;
		var endPos = TopicUrl.indexOf("#");
		var PID = TopicUrl.substring(startPos, endPos).trim();
		return PID;
	}

	//--- Get the Username
	var GetUserName = function() {
		var UserName = document.querySelector('div[id="rr-header-user-dropdown"]>div>button>span');
		return UserName;
	}

	//--- Get the page source from the url
	var GetPage = function(url, callback) {
		GM_xmlhttpRequest({
			method: 'GET',
			url: url,
			onload: callback
		});
	}

	//--- Strip the topic title from the page source
	//<title>Disabling Author Notes | Royal Road</title>
	var GetTopicTitle = function(response) {
		var PageSource = response.responseText;
		var startPos = PageSource.indexOf("<title>") + "<title>".length;
		var endPos = PageSource.indexOf(" | Royal Road</title>");
		var Title = PageSource.substring(startPos, endPos).trim();
		return ' Topic: ' + Title;
	}

	//--- Grab the reply article part from the page source
	//<div id="post-content-123456" class=""> bla bla bla </article>
	var GetQuote = function(UserName, HrefPID, response) {
		var ID = 'post-content-' + HrefPID;
		var PageSource = response.responseText;
		var startPos = PageSource.indexOf('<div id="post-content-' + HrefPID + '" class="">');
		var endPos = PageSource.indexOf("</article>", startPos);
		var Article = PageSource.substring(startPos, endPos).trim();
		var AddText = '';
		if (Article.includes(UserName.textContent)) {
			AddText = ' and Quoted You.'
		}
		return AddText;
	}
})();
