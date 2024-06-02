/* global Module */

/* Magic Mirror
 * Module: MMM-HydroTirol
 *
 * By Benjamin Kostner
 */

Module.register("MMM-HydroTirol", {
	defaults: {
		refresh: 1
	},

	getStyles () {
		return ["mmm-hydrotirol.css"];
	},

	metadata: {

	},

	getStationImageUrl(stationid) {
		if (this.stationData == null) {
			return null;
		}
		stationUrl = "https://hydro.tirol.gv.at/stations/" 
			+ stationid + "/Parameter/W/"
			+ stationid + "_W_500.png";
		return stationUrl;
	},

	getDom () {
		var modulecontainer = document.createElement("div");
		modulecontainer.className = `container hydrotirol-panel`;
		if (this.stationData == null) {
			return modulecontainer;
		}
		imageUrl = this.getStationImageUrl(this.config["station"]);
		console.log("URL: " + imageUrl)		;

		var img = document.createElement("img");
		img.className = "hydrotirol-wasserstand-image";
		img.src = imageUrl;

		// var infoContainer = document.createElement("div")
		// infoContainer.innerText = this.stationData["WTO_CATCHMENT"];
		// infoContainer.className = "title";
		// console.log(this.stationData);

		modulecontainer.appendChild(img);
		// modulecontainer.appendChild(infoContainer);
		return modulecontainer;
	},

	start () {
		Log.info(`Starting module: ${this.name}`);
		Log.info(this.config);
		this.loaded = false;
		this.stationid = this.config["station"];
		this.stationData = null;
		this.sendSocketNotification("CONFIG", this.config);
	},

	socketNotificationReceived (notification, payload) {
		console.log("Hydro: Notification: " + notification);
		if (notification === "STARTED") {
			// nichts?
		} else if (notification === "REFRESH") {
			if (payload != null && this.stationData == null) {
				payload.forEach((station) => {
					if (station["number"] == this.stationid) {
						this.stationData = station;					
					}					
				});
			}
			this.updateDom();
		}
	}
});
