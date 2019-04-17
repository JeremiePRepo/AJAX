// == FONCTIONS ==

function htmlEntities(text) {
	r = "";
	for (let i = 0; i < text.length; i++) {
		r += "&#" + text.charCodeAt(i) + ";";
	}
	return r;
}

function formatTime(timestamp) {
	const date = new Date(timestamp * 1000);
	const day = "0" + date.getDate();
	const month = "0" + (date.getMonth() + 1);
	const year = "0" + date.getFullYear();
	const hours = date.getHours();
	const minutes = "0" + date.getMinutes();
	const seconds = "0" + date.getSeconds();
	return "le " + day.substr(-2) + "/" + month.substr(-2) + "/" + year.substr(-2) + "</b> à <b>" + hours + ":" + minutes.substr(-2) + ":" + seconds.substr(-2);
}

function createTouitItem(name, message, timestamp) {
	let touit_element = document.createElement("div");
	touit_element.className = "touit-item";
	touit_element.style = "order: -" + timestamp + ";";

	let touit_message = document.createElement("p");
	touit_message.innerHTML = htmlEntities(message);

	let touit_name = document.createElement("span");
	touit_name.innerHTML = htmlEntities(name);

	touit_element.appendChild(touit_message);
	touit_element.appendChild(touit_name);

	return touit_element;
}

function getMessages(url, callback) {

	const request = new XMLHttpRequest();

	request.open("GET", url + "/list?ts=" + last_timestamp, true);
	// Numéros de retours : https://www.toutjavascript.com/reference/ref-xmlhttprequest.readystate.php
	request.addEventListener(
		"readystatechange",
		function () {
			if (request.readyState === XMLHttpRequest.UNSENT) {
				console.log("Requête non envoyée");
				alert_message.innerText = "UNSENT";

			}
			if (request.readyState === XMLHttpRequest.OPEN) {
				console.log("XMLHttpRequest.OPEN");
				alert_message.innerText = "OPEN";
			}
			if (request.readyState === XMLHttpRequest.LOADING) {
				console.log("XMLHttpRequest.LOADING");
				alert_message.innerText = "LOADING";
			}
			if (request.readyState === XMLHttpRequest.HEADERS_RECEIVED) {
				console.log("XMLHttpRequest.HEADERS_RECEIVED");
				alert_message.innerText = "HEADERS_RECEIVED";
			}
			if (request.readyState === XMLHttpRequest.DONE) {
				if (Math.floor((request.status / 100)) === 2) {
					console.log("XMLHttpRequest.DONE");
					alert_message.innerText = "DONE";
					messages = Object.values(JSON.parse(request.responseText))[1];
					last_timestamp = Object.values(JSON.parse(request.responseText))[0];
					messages.forEach(function (message) {
						htmlElement = createTouitItem(message['name'], message['message'], message['ts']);
						touit_container.appendChild(htmlElement);
					});
				} else {
					alert_message.innerText = "Probleme serveur. Code reçu :" + request.status;
				}
			} else {
				timeout = setTimeout(function () {
					alert_message.innerText = "Problème réseau critique";
				}, 5000);
			}
		}
	);
	request.send();
}

function sendMessage(name, message) {

	const request = new XMLHttpRequest();

	request.open("POST", URL + "/send", true);
	request.addEventListener(
		"readystatechange",
		function () {
			if (timeout !== undefined) {
				clearTimeout(timeout);
			}
			if (request.readyState === XMLHttpRequest.DONE && request.status === 200) {

				if (Math.floor((request.status / 100)) === 2) {
					alert_message.innerText = "Message envoyé";
				} else {
					alert_message.innerText = "Erreur. Code d'erreur :" + request.status + " : " + request.statusText;
				}
			}
		}
	);
	request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	message_clean = encodeURIComponent(message);
	name_clean = encodeURIComponent(name);
	request.send("name=" + name_clean + "&message=" + message_clean);
}

// == MAIN ==

const send_form = document.getElementById("send_form");
const send_name = document.getElementById("name");
const send_message = document.getElementById("message");
const touit_container = document.getElementById("touit_container");
const alert_message = document.getElementById("alerts");

// By Jérem
const URL = "http://192.168.20.81:5000";

let last_timestamp = 0;
let timeout;

const refresh = function () {
	getMessages(URL);
}

refresh();
setInterval(refresh, 5000);

send_form.addEventListener('submit', function (evt) {
	evt.preventDefault();
	name = document.getElementById('name').value;
	message = document.getElementById('message').value;
	sendMessage(name, message);
	getMessages(URL);
})