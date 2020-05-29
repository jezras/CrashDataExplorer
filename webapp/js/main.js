//HARDCODED DATA SOURCE GEOJSON VARIABLE NAMES
pedgeo = "PedCrashes";
bikegeo = "BikeCrashes";
polbound = "CityComms";

//CONSTANTS
const type_census = 1;
const type_crashes = 2;
const type_ped = 3;
const type_bike = 4;
const type_race = 5;
const type_eth = 6;
const type_pov = 7;
const type_mode = 8;
const type_chi = 9;
const type_hou = 10;

//TRACKING VARIABLES 
var isLoading = false;
var lastcensusmap = null;
var lastpointmap = null;
var lastheatmap = null;
var lastpolymap = null;
var choro1 = null;
var choro2 = null;
var choro3 = null;
var choro4 = null;
var choro5 = null;
var choro6 = null;
var point1 = null;
var point2 = null;
var point3 = null;
var poly1 = null;
var heat1 = null;
var heat2 = null;
var pointcoords_ped = [];
var pointcoords_ped_heat = [];
var pointcoords_bike = [];
var pointcoords_bike_heat = [];
var countbyyear_ped = [];
var countbyyear_bike = [];
var yearsActive = [years[0], years[years.length - 1]];
var severityActive = [severity[0], severity[severity.length - 1]];;
var basemap = null;
var basemapon = false;
var transon = "none";
var demoon = 0;
var hasHeat = 0;
var checkedHeat = true;
var checkedMarker = true;
var checkedCommunity = true;
var lineChart = null;
var currentCrashesTitle = "";
var currentCrashesCount = "";

//INITIALIZE MAP
var map = L.map('map', {
	scrollWheelZoom: false, minZoom: 10, maxZoom: 14
});
// set the position and zoom level of the map
map.setView([centerLat, centerLong], 11);

//INTERFACE CONTROLS AND UTILITIES
function openInfoOverlay() {
	document.getElementById("infoOverlay").style.opacity = "0.9";
	document.getElementById("infoOverlay").style.height = "100%";
}

function closeInfoOverlay() {
	document.getElementById("infoOverlay").style.opacity = "0";
	document.getElementById("infoOverlay").style.height = "0%";
}

function closeStartOverlay() {
	document.getElementById("launchOverlay").style.opacity = "0";
	document.getElementById("launchOverlay").style.height = "0%";
}

function checkHeat() {
	checkedHeat = document.getElementById('heatButton').checked
	showHeatMap();
}

function checkMarkers() {
	checkedMarker = document.getElementById('markerButton').checked
	if (transon == type_ped) {
		switchMap(type_crashes, type_ped);
	}
	else if (transon == type_bike) {
		switchMap(type_crashes, type_bike);
	}
}

function checkCommunity() {
	checkedCommunity = document.getElementById('commButton').checked
	showCommunities()
}

function loadStart() {
	document.getElementById("loading").style.display = "block";
	isLoading = true;
}

function loadStop() {
	document.getElementById("loading").style.display = "none";
	isLoading = false;
}

function getStreetViewURL(lat, long) {
	var svurl = "http://maps.google.com/maps?q=&layer=c&cbll=" + lat + "," + long + "&cbp=11,0,0,0,0";
	return svurl;
}

function getNumber(object) {
	if (object == null || object == "null" || object == "0" || object == 0) {
		return "";
	}
	else {
		return object;
	}
}

function compareAgainstSettings(feature) {
	if ((feature.properties.year >= yearsActive[0] && feature.properties.year <= yearsActive[1]) && (feature.properties.severity >= severityActive[0] && feature.properties.severity <= severityActive[1])) {
		return 1;
	}
	else {
		return 0;
	}
}

//Event handler for button clicks
function manageButtonState(which, setto) {
	if (!isLoading) { //only act if we are not already loading data from a previous click
		if (which == type_crashes) {
			document.getElementById("linkPed").style.borderColor = "#124d77"
			document.getElementById("linkBike").style.borderColor = "#124d77"
			if (transon != setto) {
				transon = setto;
				if (setto == type_ped) {
					document.getElementById("linkPed").style.borderColor = "#CC0000"
					switchMap(type_crashes, type_ped);
				}
				else if (setto == type_bike) {
					document.getElementById("linkBike").style.borderColor = "#CC0000"
					switchMap(type_crashes, type_bike);
				}
				if (lastpolymap) {
					map.removeLayer(lastpolymap);
					lastpolymap = null;
					showCommunities();
				}
			}
			else {
				if (lastpointmap) {
					map.removeLayer(lastpointmap);
					lastpointmap == null;
				}
				if (lastheatmap) {
					map.removeLayer(lastheatmap);
					lastheatmap = null;
				}
				pointcoords_ped = []; pointcoords_ped_heat = []; countbyyear_ped = [];
				pointcoords_bike = []; pointcoords_bike_heat = []; countbyyear_bike = [];
				transon = 'none'
				document.getElementById("legendCrashes").innerHTML = "";
				document.getElementById("labelCrashes").style.display = "none";
			}
		}
		else if (which == type_census) {
			document.getElementById("linkRace").style.borderColor = "#124d77"
			document.getElementById("linkEth").style.borderColor = "#124d77"
			document.getElementById("linkPov").style.borderColor = "#124d77"
			document.getElementById("linkMode").style.borderColor = "#124d77"
			document.getElementById("linkChi").style.borderColor = "#124d77"
			document.getElementById("linkHou").style.borderColor = "#124d77"
			if (demoon != setto) {
				if (setto == type_race) {
					document.getElementById("linkRace").style.borderColor = "#CC0000"
					switchMap(type_census, type_race);
				}
				else if (setto == type_eth) {
					document.getElementById("linkEth").style.borderColor = "#CC0000"
					switchMap(type_census, type_eth);
				}
				else if (setto == type_pov) {
					document.getElementById("linkPov").style.borderColor = "#CC0000"
					switchMap(type_census, type_pov);
				}
				else if (setto == type_mode) {
					document.getElementById("linkMode").style.borderColor = "#CC0000"
					switchMap(type_census, type_mode);
				}
				else if (setto == type_chi) {
					document.getElementById("linkChi").style.borderColor = "#CC0000"
					switchMap(type_census, type_chi);
				}
				else if (setto == type_hou) {
					document.getElementById("linkHou").style.borderColor = "#CC0000"
					switchMap(type_census, type_hou);
				}
				demoon = setto;
			}
			else {
				map.removeLayer(lastcensusmap);
				lastcensusmap = null
				demoon = 0
				document.getElementById("legendCensus").innerHTML = "";
				document.getElementById("labelCensus").style.display = "none";
			}
		}
	}
}

function switchMap(type, num) {
	loadStart();
	if (type == type_census) {
		document.getElementById("legendCensus").innerHTML = "";
		document.getElementById("labelCensus").style.display = "hidden";
		if (num == type_race) { //black
			doCensusMap(1, centerLat, centerLong, "B01003_001E", "B02001_003E", null, null, null, "Percent of Population Who Identify as Black or African American", 3)
		}
		else if (num == type_eth) { //ethnicity
			doCensusMap(2, centerLat, centerLong, "B01003_001E", "B03001_003E", null, null, null, "Percent of Population Who Identify as Hispanic or Latino", 3)
		}
		else if (num == type_pov) { //poverty below 100
			doCensusMap(3, centerLat, centerLong, "B01003_001E", "B06012_002E", null, null, null, "Percent of Population Below Poverty Level", 3)
		}
		else if (num == type_mode) { //travel
			doCensusMap(4, centerLat, centerLong, "B01003_001E", "B08301_019E", "B08301_018E", "B08301_011E", null, "Percent of Population Who Walked, Biked or Rode Bus to Work", 1)
		}
		else if (num == type_chi) { //children
			doCensusMap(5, centerLat, centerLong, "B01003_001E", "B01001_029E", "B01001_005E", "B01001_028E", "B01001_004E", "Percent of Children Aged 5 to 14 Years", 2)
		}
		else if (num == type_hou) { //housing
			doCensusMap(6, centerLat, centerLong, "B25001_001E", "B25003_003E", null, null, null, "Percent of Renter Occupied Units", 4)
		}
	}
	else if (type == type_crashes) {
		document.getElementById("labelCrashes").style.display = "hidden";
		title = "";
		legend = "";
		countTot = 0
		countYears = [];
		if (lastpointmap) {
			map.removeLayer(lastpointmap);
			lastpointmap = null;
		}
		if (lastheatmap) {
			map.removeLayer(lastheatmap);
			lastheatmap = null;
		}
		if (num == type_ped) {
			coords_length = pointcoords_ped.length
			for (i = 0; i < years.length; i++) {
				countbyyear_ped.push(0)
			}
			currentCrashesTitle = "Pedestrian-Involved Crashes in " + localeTechnicalName;
			legend = '<div class="dot1"></div> Pedestrian Crash';
			point1 = L.geoJson(eval(pedgeo), {
				pointToLayer: function (feature, latlng) {
					if (compareAgainstSettings(feature)) {
						return L.circleMarker(latlng, circlePedStyle);
					}
				},
				onEachFeature: function (feature, layer) {
					if (compareAgainstSettings(feature)) {
						if (coords_length == 0) {
							topush = [feature.geometry.coordinates[1], feature.geometry.coordinates[0], (invertSeverityValues(feature.properties.severity) * 20) / 100, feature.properties.year]
							pointcoords_ped.push(topush);
							pointcoords_ped_heat.push(topush.slice(0, 3))
							yeartoindex = feature.properties.year - years[0]
							countbyyear_ped[yeartoindex]++;
						}
						layer.bindPopup(
							'<span class=popuptitle>Crash Detail</span>' +
							'<ul><li><span class="listlabel">Type</span>: Pedestrian-Involved</li>' +
							'<li><span class="listlabel">Year</span>: ' + feature.properties.year + '</li>' +
							'<li><span class="listlabel">Road</span>: ' + new String(feature.properties.road).toUpperCase() + '</li>' +
							'<li><span class="listlabel">Injury</span>: ' + injuryLabels[parseInt(feature.properties.severity) - 1] + '</li>' +
							//'<li><span class="listlabel">Speed Limit</span>: ' + getNumber(feature.properties.drv_posted_nbr) + '</li>' +
							'<li><span class="listlabel">Lighting</span>: ' + lightingconditionLabels[parseInt(feature.properties.lightingcondition) - 1] + '</li>' +
							'<li><a target="_blank" href="' + getStreetViewURL(feature.geometry.coordinates[1], feature.geometry.coordinates[0]) + '">Launch Street View in New Tab</a></li></ul>'
						);
					}
				}
			})
			countTot = pointcoords_ped.length
			if (checkedMarker) {
				point1.addTo(map);
			}
			lastpointmap = point1
			if (checkedHeat) {
				showHeatMap();
			}
			doChart(countbyyear_ped, yearsActive, "Pedestrian Crashes")
		}
		else if (num == type_bike) {
			coords_length = pointcoords_bike.length
			for (i = 0; i < years.length; i++) {
				countbyyear_bike.push(0)
			}
			currentCrashesTitle = "Cyclist-Involved Crashes in " + localeTechnicalName;
			legend = '<div class="dot2"></div> Cyclist Crash';
			point2 = L.geoJson(eval(bikegeo), {
				pointToLayer: function (feature, latlng) {
					if (compareAgainstSettings(feature)) {
						return L.circleMarker(latlng, circleBikeStyle);
					}
				},
				onEachFeature: function (feature, layer) {
					if (compareAgainstSettings(feature)) {
						if (coords_length == 0) {
							topush = [feature.geometry.coordinates[1], feature.geometry.coordinates[0], (invertSeverityValues(feature.properties.severity) * 20) / 100, feature.properties.year]
							pointcoords_bike.push(topush);
							pointcoords_bike_heat.push(topush.slice(0, 3))
							yeartoindex = feature.properties.year - years[0]
							countbyyear_bike[yeartoindex]++;
						}
						layer.bindPopup(
							'<span class=popuptitle>Crash Detail</span>' +
							'<ul><li><span class="listlabel">Type</span>: Cyclist-Involved</li>' +
							'<li><span class="listlabel">Year</span>: ' + feature.properties.year + '</li>' +
							'<li><span class="listlabel">Road</span>: ' + new String(feature.properties.road).toUpperCase() + '</li>' +
							'<li><span class="listlabel">Injury</span>: ' + injuryLabels[parseInt(feature.properties.severity) - 1] + '</li>' +
							//'<li><span class="listlabel">Speed Limit: ' + getNumber(feature.properties.drv_posted_nbr) + '</li>' +
							'<li><span class="listlabel">Lighting</span>: ' + lightingconditionLabels[parseInt(feature.properties.lightingcondition) - 1] + '</li>' +
							'<li><a target="_blank" href="' + getStreetViewURL(feature.geometry.coordinates[1], feature.geometry.coordinates[0]) + '">Launch Street View in New Tab</a></li></ul>'
						);
					}
				}
			})
			countTot = pointcoords_bike.length
			if (checkedMarker) {
				point2.addTo(map);
			}
			lastpointmap = point2
			if (checkedHeat) {
				showHeatMap();
			}
			doChart(countbyyear_bike, yearsActive, "Cyclist Crashes")
		}
		document.getElementById("titleCrashes").innerHTML = currentCrashesTitle;
		currentCrashesCount = " (found " + countTot + " crashes matching these settings)";
		document.getElementById("countCrashes").innerHTML = currentCrashesCount
		document.getElementById("legendCrashes").innerHTML = legend;
		document.getElementById("labelCrashes").style.display = "block";
		loadStop();
	}
}

for (i = 0; i < years.length; i++) {
	countbyyear_ped.push(0)
}

function countPointsInPolygon(pointcoords, polygon) {
	var totalcount = pointcoords.length
	var thiscount = 0
	var thiscountfs = 0
	var countbyyear_temp = []
	for (i = 0; i < years.length; i++) {
		countbyyear_temp.push(0)
	}
	if (lastpointmap || lastheatmap) {
		for (i = 1; i < pointcoords.length; i++) {
			var tone = turf.point([pointcoords[i][1], pointcoords[i][0]])
			if (turf.booleanPointInPolygon(tone, polygon)) {
				thiscount++
				if (pointcoords[i][2] >= 0.8) {
					thiscountfs++
				}
				yeartoindex = pointcoords[i][3] - years[0]
				countbyyear_temp[yeartoindex]++;
			}
		}
	}
	var returnArray = [thiscount, thiscountfs, totalcount, countbyyear_temp]
	return returnArray;
}

function formatPercent(num, denom) {
	var percent = (num / denom) * 100
	var returnString = "";
	if (percent < 1) {
		returnString = "<1%"
	}
	else {
		returnString = Math.round(percent) + "%"
	}
	return returnString
}

function showCommunities() {
	if (checkedCommunity) {
		poly1 = L.geoJSON(eval(polbound), {
			style: polyCommunityStyle,
			onEachFeature: function (feature, layer) {
				layer.bindPopup(
					'<span class=popuptitle>Community Detail</span>' +
					'<ul><li>' + feature.properties.AREA_NAME.toUpperCase() + '</li>' +
					'<li class="areacount" id="ccount' + feature.properties.OBJECTID + '"></li>' +
					'</ul>'
				);
			}

		})
		pointcoords_temp = [];
		if (transon == type_ped) {
			poly1.on('popupopen', function (e) {
				var feature = e.popup._source.feature;
				var count = countPointsInPolygon(pointcoords_ped, feature);
				document.getElementById('ccount' + feature.properties.OBJECTID).innerHTML = count[0] + " crashes matching these settings";
				if (transon == type_ped) { //need this check in case it was swtiched off
					if (count[0] > 0 & severityActive[0] == 1 & severityActive[1] == 5) {
						document.getElementById('ccount' + feature.properties.OBJECTID).innerHTML += "</br>" + Math.round((count[1] / count[0]) * 100) + "% are severe or fatal";
					}
					document.getElementById('ccount' + feature.properties.OBJECTID).innerHTML += "</br></br>This community has " + formatPercent(count[0], count[2]) + " of all crashes matching these settings";
					doChart(count[3], yearsActive, "Pedestrian Crashes")
					document.getElementById("titleCrashes").innerHTML = "Pedestrian-Involved Crashes in " + feature.properties.AREA_NAME.toUpperCase()
					document.getElementById("countCrashes").innerHTML = "";
				}
				e.propagatedFrom.setStyle(polyCommunityHighlightStyle);
			});
			poly1.on('popupclose', function (e) {
				e.propagatedFrom.setStyle(polyCommunityStyle);
				doChart(countbyyear_ped, yearsActive, "Pedestrian Crashes");
				document.getElementById("titleCrashes").innerHTML = currentCrashesTitle;
				document.getElementById("countCrashes").innerHTML = currentCrashesCount;
			});
		}
		else if (transon == type_bike) {
			poly1.on('popupopen', function (e) {
				var feature = e.popup._source.feature;
				var count = countPointsInPolygon(pointcoords_bike, feature);
				document.getElementById('ccount' + feature.properties.OBJECTID).innerHTML = count[0] + " crashes matching these settings";
				if (transon == type_bike) { //need this check in case it was swtiched off
					if (count[0] > 0 & severityActive[0] == 1 & severityActive[1] == 5) {
						document.getElementById('ccount' + feature.properties.OBJECTID).innerHTML += "</br>" + Math.round((count[1] / count[0]) * 100) + "% are severe or fatal";
					}
					document.getElementById('ccount' + feature.properties.OBJECTID).innerHTML += "</br></br>This community has " + formatPercent(count[0], count[2]) + " of all crashes matching these settings";
					doChart(count[3], yearsActive, "Cyclist Crashes")
					document.getElementById("titleCrashes").innerHTML = "Cyclist-Involved Crashes in " + feature.properties.AREA_NAME.toUpperCase()
					document.getElementById("countCrashes").innerHTML = "";
				}
				e.propagatedFrom.setStyle(polyCommunityHighlightStyle);
			});
			poly1.on('popupclose', function (e) {
				e.propagatedFrom.setStyle(polyCommunityStyle);
				doChart(countbyyear_bike, yearsActive, "Cyclist Crashes")
				document.getElementById("titleCrashes").innerHTML = currentCrashesTitle;
				document.getElementById("countCrashes").innerHTML = currentCrashesCount;
			});
		}
		else {
			poly1.on('popupopen', function (e) {
				var feature = e.popup._source.feature;
				document.getElementById('ccount' + feature.properties.OBJECTID).innerHTML = ("0 crashes matching these settings")
				e.propagatedFrom.setStyle(polyCommunityHighlightStyle);
			});
			poly1.on('popupclose', function (e) {
				e.propagatedFrom.setStyle(polyCommunityStyle);
			});
		}
		poly1.addTo(map)
		lastpolymap = poly1;
		if (lastpointmap) {
			lastpointmap.bringToFront();
		}
	}
	else {
		if (lastpolymap) {
			map.removeLayer(lastpolymap);
			lastpolymap = null;
		}
	}
}

function showBasemap() {
	if (!basemap) {
		//basemap = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=' + mapboxAccessToken, {
		//	id: 'mapbox.light',
		//	attribution: 'Ohio DOT; Smart Columbus OS; US Census; MapBox '
		//	});
		basemap = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
			id: 'mapbox.light',
			attribution: 'Ohio DOT; Smart Columbus OS; US Census; OpenStreetMap '
		});
	}
	if (!basemapon) {
		basemap.addTo(map);
		basemapon = true;
	}
	else {
		map.removeLayer(basemap);
		basemapon = false;
	}
}

function showHeatMap() {
	if (checkedHeat) {
		if (lastheatmap) {
			map.removeLayer(lastheatmap);
		}
		if (transon == type_ped) {
			heat1 = L.heatLayer(pointcoords_ped_heat, {
				minOpacity: 0.03,
				radius: 20,
				blur: 15,
				maxZoom: 14,
			})
			heat1.addTo(map);
			lastheatmap = heat1;
		}
		else if (transon == type_bike) {
			heat2 = L.heatLayer(pointcoords_bike_heat, {
				minOpacity: 0.03,
				max: 1,
				radius: 20,
				blur: 15,
				maxZoom: 14,
			})
			heat2.addTo(map);
			lastheatmap = heat2;
		}
	}
	else {
		if (lastheatmap) {
			map.removeLayer(lastheatmap);
		}
	}
}
//CENSUS FUNCTIONS
function doCensusMap(i, lat, long, bas, val, addval1, addval2, addval3, title, size) {
	var grades = ["0", "10", "20", "30", "40", "50"]; // size==3
	if (size == 1) {
		grades = ["0", "3", "6", "9", "12", "15"];
	}
	else if (size == 2) {
		grades = ["0", "5", "10", "15", "20", "25"];
	}
	else if (size == 4) {
		grades = ["0", "15", "30", "45", "60", "75"];
	}
	function getColor(percent, gradesarray) {
		return percent > gradesarray[5]
			? "#800026"
			: percent > gradesarray[4]
				? "#BD0026"
				: percent > gradesarray[3]
					? "#E31A1C"
					: percent > gradesarray[2]
						? "#FC4E2A"
						: percent > gradesarray[1]
							? "#FD8D3C"
							: percent > gradesarray[0]
								? "#FEB24C"
								: "#FEB24C";
	}
	function calculatePercents(feature) {
		var total_pop = eval("feature.properties." + bas);
		var total_pop_comp = eval("feature.properties." + val);
		if (addval1) {
			total_pop_comp += eval("feature.properties." + addval1);
		}
		if (addval2) {
			total_pop_comp += eval("feature.properties." + addval2);
		}
		if (addval3) {
			total_pop_comp += eval("feature.properties." + addval3);
		}
		//calculate percent
		if (total_pop && total_pop_comp) {
			// check if valid (no 0s or undefined)
			var percent = (total_pop_comp / total_pop) * 100;
			//alert("" + total_pop_comp + "/" + total_pop + "=" + percent);
			return {
				fillColor: getColor(percent, grades),
				fillOpacity: 0.6,
				weight: 0.5,
				color: "rgba(255, 255, 255, 0.8)"
			};
		} else {
			return {
				weight: 2,
				fillOpacity: 0,
				weight: 0.5,
				color: "rgba(255, 255, 255, 0.8)"
			};
		}
	}
	function makegrade(item, i) {
		var div = document.getElementById("legendCensus");
		if (size == 1) {
			div.innerHTML += '<i style="background:' +
				getColor(parseInt(grades[i]) + 1, grades) +
				'; opacity: 0.6; clear:left;"></i> <span style="display: inline-block; margin-top:2px;">' +
				grades[i] +
				"%" +
				(grades[i + 1] ? "&ndash;" + grades[i + 1] + "%" : "+") +
				"</span><br/>";
		}
		else if (size == 2) {
			div.innerHTML += '<i style="background:' +
				getColor(parseInt(grades[i]) + 1, grades) +
				'; opacity: 0.6; clear:left;"></i> <span style="display: inline-block; margin-top:2px;">' +
				grades[i] +
				"%" +
				(grades[i + 1] ? "&ndash;" + grades[i + 1] + "%" : "+") +
				"</span><br/>";
		}
		else {
			div.innerHTML += '<i style="background:' +
				getColor(parseInt(grades[i]) + 1, grades) +
				'; opacity: 0.6; clear:left;"></i> <span style="display: inline-block; margin-top:2px;">' +
				grades[i] +
				"%" +
				(grades[i + 1] ? "&ndash;" + grades[i + 1] + "%" : "+") +
				"</span><br/>";
		}
	}
	document.getElementById("labelCensus").innerHTML = title;
	document.getElementById("labelCensus").style.display = "block";
	if (lastcensusmap) {
		map.removeLayer(lastcensusmap);
	}
	if (i == 1 & choro1 != null) {
		choro1.addTo(map);
		lastcensusmap = choro1;
		loadStop();
		grades.forEach(makegrade)
	}
	else if (i == 2 & choro2 != null) {
		choro2.addTo(map);
		lastcensusmap = choro2;
		loadStop();
		grades.forEach(makegrade)
	}
	else if (i == 3 & choro3 != null) {
		choro3.addTo(map);
		lastcensusmap = choro3;
		loadStop();
		grades.forEach(makegrade)
	}
	else if (i == 4 & choro4 != null) {
		choro4.addTo(map);
		lastcensusmap = choro4;
		loadStop();
		grades.forEach(makegrade)
	}
	else if (i == 5 & choro5 != null) {
		choro5.addTo(map);
		lastcensusmap = choro5;
		loadStop();
		grades.forEach(makegrade)
	}
	else if (i == 6 & choro6 != null) {
		choro6.addTo(map);
		lastcensusmap = choro6;
		loadStop();
		grades.forEach(makegrade)
	}
	else {
		valArray = [bas, val];
		if (addval1) {
			valArray[2] = addval1
		}
		if (addval2) {
			valArray[3] = addval2
		}
		if (addval3) {
			valArray[4] = addval3
		}
		census({
			"vintage": censusAcsYear,
			geoHierarchy: {
				// required
				state: {
					lat: lat,
					lng: long
				},
				"tract": "*" // <- syntax = "<descendant>" : "*"
			},
			sourcePath: ["acs", "acs5"],
			"values": valArray,
			"statsKey": censusAccessToken,
			"geoResolution": "500k"
		},
			function (error, response) {
				if (i == 1) {
					choro1 = L.geoJson(response, {
						style: calculatePercents
					})
					choro1.addTo(map);
					lastcensusmap = choro1;
				}
				else if (i == 2) {
					choro2 = L.geoJson(response, {
						style: calculatePercents
					})
					choro2.addTo(map);
					lastcensusmap = choro2;
				}
				else if (i == 3) {
					choro3 = L.geoJson(response, {
						style: calculatePercents
					})
					choro3.addTo(map);
					lastcensusmap = choro3;
				}
				else if (i == 4) {
					choro4 = L.geoJson(response, {
						style: calculatePercents
					})
					choro4.addTo(map);
					lastcensusmap = choro4;
				}
				else if (i == 5) {
					choro5 = L.geoJson(response, {
						style: calculatePercents
					})
					choro5.addTo(map);
					lastcensusmap = choro5;
				}
				else if (i == 6) {
					choro6 = L.geoJson(response, {
						style: calculatePercents
					})
					choro6.addTo(map);
					lastcensusmap = choro6;
				}
				if (lastcensusmap) {
					lastcensusmap.bringToBack();
				}
				if (lastpointmap) {
					lastpointmap.bringToFront();
				}
				loadStop();
				grades.forEach(makegrade)
			}
		)
	}
	if (lastcensusmap) {
		lastcensusmap.bringToBack();
	}
	if (lastpointmap) {
		lastpointmap.bringToFront();
	}
}

function checkYears(values, handle, unencoded, tap, positions, noUiSlider) {
	yearsActive = values
	map.closePopup();
	if (transon == type_ped) {
		pointcoords_ped = []; pointcoords_ped_heat = []; countbyyear_ped = [];
		switchMap(type_crashes, type_ped);
	}
	else if (transon == type_bike) {
		pointcoords_bike = []; pointcoords_bike_heat = []; countbyyear_bike = [];
		switchMap(type_crashes, type_bike);
	}
}

function invertSeverityValues(x) {
	if (x == 1) { return 5 }
	else if (x == 2) { return 4 }
	else if (x == 3) { return 3 }
	else if (x == 4) { return 2 }
	else if (x == 5) { return 1 }
	else { return x }
}

function checkSeverity(values, handle, unencoded, tap, positions, noUiSlider) {
	newValues = [invertSeverityValues(values[1]), invertSeverityValues(values[0])]
	severityActive = newValues
	map.closePopup();
	if (transon == type_ped) {
		pointcoords_ped = []; pointcoords_ped_heat = []; countbyyear_ped = [];
		switchMap(type_crashes, type_ped);
	}
	else if (transon == type_bike) {
		pointcoords_bike = []; pointcoords_bike_heat = []; countbyyear_bike = [];
		switchMap(type_crashes, type_bike);
	}
}

//CREATE CHARTS
function doChart(countsByYear, whichYears, label) {
	if (lineChart) {
		lineChart.destroy();
	}
	yearsToDisplay = []
	countsToDisplay = []
	for (i = 0; i < years.length; i++) {
		if (years[i] >= whichYears[0] & years[i] <= whichYears[1]) {
			yearsToDisplay.push(years[i])
			countsToDisplay.push(countsByYear[i])
		}
	}
	lineChart = new Chart(document.getElementById("line-chart"), {
		type: 'line',
		data: {
			labels: yearsToDisplay,
			datasets: [{
				data: countsToDisplay,
				label: label,
				borderColor: "#3e95cd",
				fill: false,
				legend: {
					position: "left",
				}
			},
			]
		},
		options: {
			maintainaspectratio: false,
			responsive: false,
			title: {
				display: false,
				text: 'Traffic Crash Trend (Current Settings)'
			},
			legend: {
				display: false
			},
			scales: {
				yAxes: [{
					display: true,
					ticks: {
						maxTicksLimit: 4,
						fontSize: 10,
						fontColor: 'black',
						//	suggestedMin: 0,
					}
				}],
				xAxes: [{
					display: true,
					ticks: {
						fontSize: 10,
						fontColor: 'black',
					}
				}]
			}
		}
	});
}

//ASSIGN EVENTS
document.getElementById("linkPed").addEventListener("click", function () { manageButtonState(type_crashes, type_ped) })
document.getElementById("linkBike").addEventListener("click", function () { manageButtonState(type_crashes, type_bike) })
document.getElementById("linkRace").addEventListener("click", function () { manageButtonState(type_census, type_race) })
document.getElementById("linkEth").addEventListener("click", function () { manageButtonState(type_census, type_eth) })
document.getElementById("linkPov").addEventListener("click", function () { manageButtonState(type_census, type_pov) })
document.getElementById("linkMode").addEventListener("click", function () { manageButtonState(type_census, type_mode) })
document.getElementById("linkChi").addEventListener("click", function () { manageButtonState(type_census, type_chi) })
document.getElementById("linkHou").addEventListener("click", function () { manageButtonState(type_census, type_hou) })
document.getElementById('heatButton').addEventListener("click", function () { checkHeat() })
document.getElementById('markerButton').addEventListener("click", function () { checkMarkers() })
document.getElementById('commButton').addEventListener("click", function () { checkCommunity() })

//INIT THE INTERFACE
function setTitles() {
	document.title = localeLongName + " Crash Data Explorer for Vision Zero"
	document.getElementById('mainTitleName').innerHTML = localeLongName;
	document.getElementById('overlayTitleName').innerHTML = localeLongName;
	document.getElementById('aboutTitleName').innerHTML = localeLongName;
	document.getElementById('statsPanelName').innerHTML = localeLongName;
	document.getElementById('overlayDescription1').innerHTML = aboutDescription;
	document.getElementById('overlayDescription2').innerHTML = aboutDescription;
}

function setSliders() {
	var slider1 = document.getElementById('buttonRowYear');
	noUiSlider.create(slider1, {
		range: {
			'min': years[0],
			'max': years[years.length - 1]
		},
		step: 1,
		pips: {
			mode: 'count',
			values: 5,
			density: 50
		},
		start: [years[0], years[years.length - 1]],
		connect: true,
	});
	slider1.noUiSlider.on('set', checkYears);

	var slider2 = document.getElementById('buttonRowSeverity');
	noUiSlider.create(slider2, {
		range: {
			'min': severity[0],
			'max': severity[severity.length - 1]
		},
		step: 1,
		start: [severity[0], severity[severity.length - 1]],
		connect: true,
	});
	slider2.noUiSlider.on('set', checkSeverity);
}

function setStats() {
	timeString = "";
	listsString = ""
	for (var key in CityStats) {
		if (CityStats.hasOwnProperty(key)) {
			var val = CityStats[key];
			if (key == "timeframe") {
				timeString = val
			}
			if (key == "lists") {
				for (i = 0; i < val.length; i++) {
					listsString += '<div class="statSubcontain">' + val[i]['title'] + '<ul class="statList">';
					for (z = 0; z < val[i]['items'].length; z++) {
						listsString += '<li>' + val[i]['items'][z]['name'] + ': ' + val[i]['items'][z]['count'] + '</li>';
					}
					listsString += '</ul></div>';
				}
			}
		}
	}
	document.getElementById('statContain').innerHTML = listsString;
	document.getElementById('statPanel').style.display = "block"
}

function setAdvocacy() {
	var linkstring = "<ul>";
	for (i = 0; i < advocacyLinks.length; i++) {
		linkstring += "<li>";
		linkstring += advocacyLinks[i];
		linkstring += "</li>";
	}
	linkstring += "</ul>";
	document.getElementById('linkList').innerHTML = linkstring;
	document.getElementById('advocatePanel').style.display = 'block';
}

function setSourceNotes() {
	var linkstring = "<ul>";
	for (i = 0; i < sourcesNotes.length; i++) {
		linkstring += "<li>";
		linkstring += sourcesNotes[i];
		linkstring += "</li>";
	}
	linkstring += "</ul>";
	document.getElementById('sourceNotesList').innerHTML = linkstring;
}

function setDevNotes() {
	var linkstring = "<ul>";
	for (i = 0; i < devNotes.length; i++) {
		linkstring += "<li>";
		linkstring += devNotes[i];
		linkstring += "</li>";
	}
	linkstring += "</ul>";
	document.getElementById('devNotesList').innerHTML = linkstring;
}


//INIT
setTitles();
showBasemap();
if (showStats) {
	setStats();
}
if (showAdvocacy) {
	setAdvocacy();
}
setSourceNotes();
setDevNotes();
setSliders();