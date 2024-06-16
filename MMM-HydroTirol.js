/* global Module */

/* Magic Mirror
 * Module: MMM-HydroTirol
 *
 * By Benjamin Kostner
 */

Module.register("MMM-HydroTirol", {
	defaults: {
		refresh: 1,
		width: 600,
		align: "center",
		station: "201525"
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

		// alle 5min
		var refreshImageTime = parseInt(new Date().getTime() / 1000 / 60 / 5);


		stationUrl = "https://hydro.tirol.gv.at/stations/" 
			+ stationid + "/Parameter/W/"
			+ stationid + "_W_500.png"
			+ "?" + refreshImageTime;
		return stationUrl;
	},

	getDom () {
		var modulecontainer = document.createElement("div");
		modulecontainer.className = `container hydrotirol`;
		if (this.stationData == null) {
			return modulecontainer;
		}

		const options = {
			month: 'numeric',
			day: 'numeric',
			hour: "numeric",
			minute: "numeric"
		};
		  
		var wInfo15m = this.stationData["values"]["W"]["Cmd"]
		var wtInfo15m = this.stationData["values"]["WT"]["15m.Cmd.HD"]
		var lastUpdate = new Date(wInfo15m["dt"]);
		lastUpdateString = lastUpdate.toLocaleDateString('de-AT', options);

		imageUrl = this.getStationImageUrl(this.config["station"]);
		// console.log("URL: " + imageUrl);

		var titleContainer = document.createElement("div")
		titleContainer.innerText = "Station " + this.stationData["WTO_OBJECT"]
		+ " / " + this.stationData["name"];
		titleContainer.className = "title medium";
		
		var infoContainer = document.createElement("div")
		infoContainer.className = "hydrotirol-info";
		
		var depthContainer = document.createElement("span")
		depthContainer.innerText = wInfo15m["v"] + wInfo15m["unit"] + " | "
		+ wtInfo15m["v"] + wtInfo15m["unit"] ;
		depthContainer.className = "large hydrotirol-wasserstand-pegel bright";
		
		var depthContainerInfo = document.createElement("span")
		depthContainerInfo.innerText = wInfo15m["classification"]  
		+ " | Stand: " + lastUpdateString

		depthContainerInfo.className = "hydrotirol-wasserstand-info";

		infoContainer.appendChild(depthContainer);
		infoContainer.appendChild(depthContainerInfo);
		
		var img = document.createElement("img");
		img.className = "hydrotirol-wasserstand-image";
		img.src = imageUrl;

		modulecontainer.appendChild(titleContainer);
		modulecontainer.appendChild(infoContainer);
		modulecontainer.appendChild(img);
		return modulecontainer;
	},

	start () {
		Log.info(`Starting module: ${this.name}`);
		Log.info(this.config);
		this.loaded = false;
		this.lastUpdateMillis = 0;
		this.stationid = this.config["station"];
		this.stationData = null;
		this.sendSocketNotification("CONFIG", this.config);
	},

	socketNotificationReceived (notification, payload) {
		if (notification === "STARTED") {
			// nichts?
		} else if (notification === "REFRESH") {
			if (payload == null) {
				return;
			}
			payload.forEach((station) => {
				if (station["number"] == this.stationid) {
					this.stationData = station;		
					updateMillis = this.stationData["values"]["W"]["Cmd"]["dt"];
					if (updateMillis > this.lastUpdateMillis) {
						this.lastUpdateMillis = updateMillis;
						var d = new Date(updateMillis);
						console.log("HydroTirol - Neue Daten: " + d.toLocaleDateString('de-AT', { hour: "numeric", minute: "numeric"}));
						this.updateDom();
					}
				}					
			});
		}
	}
});
