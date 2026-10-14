/* live.paste.no · standarder for gjester (Komplett Studio, 2026-10-14)
 *
 * Gjesten åpner live.paste.no, trykker «Add your Camera to OBS» og sender
 * ID-en. Uten egne parametre i lenken gjør VDO.Ninja et anslag på mobilen og
 * velger ofte 720p i 60 fps. Det gir et mykt bilde og mye arbeid for mobilen.
 *
 * Denne fila endrer bare standardene, og bare når lenken ikke sier noe selv:
 *   · høyst 30 fps (kamera trenger ikke mer)
 *   · ett hakk høyere oppløsning enn anslaget: 720p blir 1080p, 360p blir 720p.
 *     Med 30 fps i stedet for 60 blir lasten omtrent den samme.
 *   · på mobilnett (Android Chrome kan se det, iPhone kan ikke) får mottakeren
 *     høyst 6 Mbit/s fra gjesten. Wifi har ingen grense herfra.
 * Står quality, maxframerate eller maxvideobitrate i lenken, gjelder lenken.
 *
 * Fila lastes etter main.js i index.html og pakker inn previewWebcam(), så den
 * gjelder både kortet på forsiden og ?push=…-lenker. Resten av forken er
 * upstream VDO.Ninja uendret, så sammenslåing med steveseguin/develop går greit.
 */
(function () {
	"use strict";
	var p = new URLSearchParams(window.location.search);
	function har() {
		for (var i = 0; i < arguments.length; i++) {
			if (p.has(arguments[i])) return true;
		}
		return false;
	}
	var egenKvalitet = har("quality", "q", "fullhd", "1080p", "4k", "width", "w", "height", "h");
	var egenFps = har("maxframerate", "mfr", "mfps", "framerate", "fr", "fps");
	var egenBitrate = har("maxvideobitrate", "maxbitrate", "maxvb", "mvb");

	var MAKS_FPS = 30;
	var MOBILNETT_KBPS = 6000;

	function mobilnett() {
		try {
			var c = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
			return !!(c && c.type === "cellular");
		} catch (e) {
			return false;
		}
	}

	function settRadio(verdi) {
		["webcamquality", "webcamquality3"].forEach(function (id) {
			try {
				var form = document.getElementById(id);
				if (form && form.elements.namedItem("resolution")) {
					form.elements.namedItem("resolution").value = String(verdi);
				}
			} catch (e) {}
		});
	}

	function forbered() {
		if (typeof session === "undefined" || !session) return;
		if (!egenFps && session.maxframeRate === false) {
			session.maxframeRate = MAKS_FPS;
		}
		if (!egenKvalitet && session.quality === false && !session.roomid) {
			var anslag = typeof session.quality_wb === "number" ? session.quality_wb : 1;
			if (anslag > 0) {
				session.quality_wb = anslag - 1;
				settRadio(session.quality_wb);
			}
		}
		if (!egenBitrate && session.maxvideobitrate === false && mobilnett()) {
			session.maxvideobitrate = MOBILNETT_KBPS;
		}
	}

	var original = window.previewWebcam;
	if (typeof original === "function") {
		var ferdig = false;
		window.previewWebcam = function () {
			if (!ferdig) {
				ferdig = true;
				try {
					forbered();
				} catch (e) {
					console.warn("paste.js", e);
				}
			}
			return original.apply(this, arguments);
		};
	}
})();
