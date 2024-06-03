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
        console.log("Wasserstand Daten empfanken ok: " + response.ok);
        return response;
    },  

    fetchStationData: function() {
        var self = this;
        fetch( "https://hydro.tirol.gv.at/stationdata/data.json?parameter=Wasserstand")
        .then(self.checkStationData)
        .then((response) => response.json())
        .then((responseJson) => {
            self.stationData = responseJson;
            self.log("Stationsdaten geladen")
        });
    },

    start: function () {
        var self = this;
        self.stationData = null;
        self.fetchStationData();
        
        // Alle 15min Daten holen
        setInterval(function() { 
            self.fetchStationData();
        }, 1000 * 60 * 15);
        
        // Refresh alle 5s machen
        setInterval(function() { 
            self.sendSocketNotification("REFRESH", self.stationData);
        }, 1000 * 5);
    },
});


