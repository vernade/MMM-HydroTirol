"use strict";

const NodeHelper = require("node_helper");
const fetch = require("node-fetch");
const { response } = require("express");
// var request = require('request');


module.exports = NodeHelper.create({
    
    log: function(outstr) {
        console.log("[MMM-HydroTirol] " + outstr);
    },

    checkStationData: function(response) {
        console.log("Antwort ok: " + response.ok + "/" + response.body);
        return response;
    },  

    start: function () {
        var self = this;
        self.stationData = null;
        setInterval(function() { 
            self.sendSocketNotification("REFRESH", self.stationData);
        }, 50 * 60);

        fetch( "https://hydro.tirol.gv.at/stationdata/data.json?parameter=Wasserstand")
        .then(self.checkStationData)
        .then((response) => response.json())
        .then((responseJson) => {
            self.stationData = responseJson;
            // console.log("Stationen geladen: " + responseJson.length)
            // self.sendSocketNotification(
            //     `LOADED_STATION_DATA`,
            //     responseJson
            // );
        });
    },
});


