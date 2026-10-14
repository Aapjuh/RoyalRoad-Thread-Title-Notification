// ==UserScript==
// @name			RoyalRoad Thread Title Notification
// @namespace		RoyalRoad Thread Title Notification
// @version			1.2
// @description		Adds the title of the topic when someone replies to your notifications.
// @author			Aapjuh
// @icon			https://raw.githubusercontent.com/Aapjuh/RoyalRoad-Thread-Title-Notification/main/RR-logo.png
// @supportURL		https://github.com/Aapjuh/RoyalRoad-Thread-Title-Notification/issues
// @homepageURL		https://github.com/Aapjuh/RoyalRoad-Thread-Title-Notification
// @downloadURL		https://github.com/Aapjuh/RoyalRoad-Thread-Title-Notification/raw/main/RoyalRoad-Thread-Title-Notification.user.js
// @updateURL		https://github.com/Aapjuh/RoyalRoad-Thread-Title-Notification/raw/main/RoyalRoad-Thread-Title-Notification.user.js
// @match			https://www.royalroad.com/*
// @grant			GM_xmlhttpRequest
// ==/UserScript==
/* globals jQuery, $ */
//
(function() {
	'use strict';

	//--- Wait for the document to be ready
	$(document).ready(function() {
		//--- Add Listener for notification icon
		document.getElementById("header_notification_bar").addEventListener("click", Run, {
			once: true
		});

	})

	//--- Timeout after clicking notification icon
	function Run() {
		//--- Add the button.
		//alert('test2');
		setTimeout(() => {
			Go()
		}, 500);
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
		var NotesList = document.querySelectorAll('ul[class="dropdown-menu notifications"]>li>ul[class="dropdown-menu-list scroller"]')[0].children;
		return NotesList;
	}

	//--- Get the Note text for filtering
	var GetNoteTextElem = function(Note) {
		var NoteTextElem = Note.querySelector('a[class="row"]');
		return NoteTextElem ? NoteTextElem.children[1] : null;
	}

	//--- Process the notifications
	var ProcessLink = function(Notes) {
		//--- Get the Note text
		var NoteText = GetNoteTextElem(Notes);
		if (NoteText) {
			//--- Get the Topic Url
			var TopicUrl = GetTopicUrl(Notes);
			//--- Get the page source from the url
			GetPage(TopicUrl, function(response) {
				//--- Debug
				//console.log(NoteText.textContent);
				//--- chop off part of the note text
				NoteText.textContent = NoteText.textContent.replace('a thread you are subscribed to.', '');
				//--- add the topic title
				NoteText.append(GetTopicTitle(response));
                //Convert HTML symbols to plain text
                var $NoteText = $(NoteText);
                $NoteText.html($NoteText.text())
			});
		}
	}

	//--- Get the Topic Url
	var GetTopicUrl = function(Note) {
		var Href = Note.querySelector('a[class="row"]').getAttribute('href');
		return 'https://www.royalroad.com' + Href;
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

})();
