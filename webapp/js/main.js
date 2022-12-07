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
var countbyyearmonth_ped = [];
var countbyyearmonth_bike = [];
var yearsActive = [yearsDefault[0], yearsDefault[yearsDefault.length - 1]];
var severityActive = [severityDefault[0], severityDefault[severityDefault.length - 1]];
if (invertSeverity) {
	severityActive = [invertSeverityValues(severityDefault[severityDefault.length - 1]), invertSeverityValues(severityDefault[0])];
}
var basemap = null;
var basemapon = false;
var transon = "none";
var demoon = 0;
var hasHeat = 0;
var checkedHeat = true;
var checkedMarker = true;
var checkedCommunity = false;
var checkedAerial = false;
var lineChart = null;
var currentCrashesTitle = "";
var currentCrashesCount = "";
var tileModeAerial = true
var chartModeMonths = monthlyTrends

//OVERLAYS
function openInfoOverlay() {
	document.getElementById("infoOverlay").style.opacity = "0.95";
	document.getElementById("infoOverlay").style.height = "100%";
}

function closeInfoOverlay() {
	document.getElementById("infoOverlay").style.opacity = "0";
	document.getElementById("infoOverlay").style.height = "0%";
}

function openStartOverlay() {
	document.getElementById("launchOverlay").style.opacity = "0.95";
	document.getElementById("launchOverlay").style.height = "100%";
}

function closeStartOverlay() {
	document.getElementById("launchOverlay").style.opacity = "0";
	document.getElementById("launchOverlay").style.height = "0%";
}

const params = new URLSearchParams(window.location.search)
if (params.has('showOverlayOnLaunch')) {
	if (params.get('showOverlayOnLaunch') == "1") {
		openStartOverlay()
	}
}
else if (showOverlayOnLaunch) {
	openStartOverlay()
}


//INITIALIZE MAP
var map = L.map('map', {
	scrollWheelZoom: false, minZoom: 10, maxZoom: 17
});
// set the position and zoom level of the map
map.setView([centerLat, centerLong], 11);

//INTERFACE CONTROLS AND UTILITIES
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

function checkAerial() {
	checkedAerial = document.getElementById('aeriButton').checked
	toggleBasemap()
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
			doCensusMap(1, centerLat, centerLong, "B01003_001E", "B02001_003E", null, null, null, "Percent of Population Who Identify as Black or African American", 3, false)
		}
		else if (num == type_eth) { //ethnicity (changed to immigration)
			//doCensusMap(2, centerLat, centerLong, "B01003_001E", "B03001_003E", null, null, null, "Percent of Population Who Identify as Hispanic or Latino", 3)
			doCensusMap(2, centerLat, centerLong, "B06001_001E", "B06001_049E", null, null, null, "Percent of Population that are Foreign Born", 3, false)
		}
		else if (num == type_pov) { //poverty below 100
			doCensusMap(3, centerLat, centerLong, "B01003_001E", "B06012_002E", null, null, null, "Percent of Population Below Poverty Level", 3, false)
		}
		else if (num == type_mode) { //travel
			doCensusMap(4, centerLat, centerLong, "B01003_001E", "B08301_019E", "B08301_018E", "B08301_011E", null, "Percent of Population Who Walked, Biked or Rode Bus to Work", 1, false)
		}
		else if (num == type_chi) { //children
			doCensusMap(5, centerLat, centerLong, "B01003_001E", "B01001_029E", "B01001_005E", "B01001_028E", "B01001_004E", "Percent of Children Aged 5 to 14 Years", 2, false)
		}
		else if (num == type_hou) { //housing
			//doCensusMap(6, centerLat, centerLong, "B25001_001E", "B25003_003E", null, null, null, "Percent of Renter Occupied Units", 4)
			doCensusMap(6, centerLat, centerLong, "B25024_001E", "B25024_002E", "B25024_003E", null, null, "Percent of Units in Non-Single Family Structures ", 4, true)
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
			if (coords_length == 0) {
				countbyyear_ped = []
				countbyyearmonth_ped = []
				for (i = 0; i < years.length; i++) {
					countbyyear_ped[years[i] + "-"] = 0
					for (k = 1; k < 13; k++) {
						countbyyearmonth_ped[years[i] + "-" + k] = 0
					}

				}
			}
			currentCrashesTitle = "Pedestrian Crashes in " + localeTechnicalName;
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
							tempSeverity = feature.properties.severity
							if (invertSeverity) {
								tempSeverity = invertSeverityValues(feature.properties.severity)
							}
							topush = [feature.geometry.coordinates[1], feature.geometry.coordinates[0], (tempSeverity * 20) / 100, feature.properties.year, feature.properties.month]
							pointcoords_ped.push(topush);
							pointcoords_ped_heat.push(topush.slice(0, 3))
							countbyyear_ped[feature.properties.year + "-"]++;
							yearmonth = ((feature.properties.year) + "-" + feature.properties.month)
							countbyyearmonth_ped[yearmonth]++;
						}
						layer.bindPopup(
							'<span class=popuptitle>Crash Detail</span>' +
							'<ul><li><span class="listlabel">Type</span>: Pedestrian</li>' +
							'<li><span class="listlabel">Year</span>: ' + feature.properties.year + '</li>' +
							'<li><span class="listlabel">Road</span>: ' + new String(feature.properties.road).toUpperCase() + '</li>' +
							'<li><span class="listlabel">Lanes</span>: ' + feature.properties.lanes + '</li>' +
							'<li><span class="listlabel">Injury</span>: ' + injuryLabels[parseInt(tempSeverity) - 1] + '</li>' +
							//'<li><span class="listlabel">Speed Limit</span>: ' + getNumber(feature.properties.drv_posted_nbr) + '</li>' +
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
			if (chartModeMonths) {
				doChart(countbyyearmonth_ped, yearsActive, "Pedestrian Crashes")
			}
			else {
				doChart(countbyyear_ped, yearsActive, "Pedestrian Crashes")
			}

		}
		else if (num == type_bike) {
			coords_length = pointcoords_bike.length
			if (coords_length == 0) {
				countbyyear_bike = []
				countbyyearmonth_bike = []
				for (i = 0; i < years.length; i++) {
					countbyyear_bike[years[i] + "-"] = 0
					for (k = 1; k < 13; k++) {
						countbyyearmonth_bike[years[i] + "-" + k] = 0
					}
				}
			}
			currentCrashesTitle = "Cyclist Crashes in " + localeTechnicalName;
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
							tempSeverity = feature.properties.severity
							if (invertSeverity) {
								tempSeverity = invertSeverityValues(feature.properties.severity)
							}
							topush = [feature.geometry.coordinates[1], feature.geometry.coordinates[0], (tempSeverity * 20) / 100, feature.properties.year, feature.properties.month]
							pointcoords_bike.push(topush);
							pointcoords_bike_heat.push(topush.slice(0, 3))
							countbyyear_bike[feature.properties.year + "-"]++;
							yearmonth = ((feature.properties.year) + "-" + feature.properties.month)
							countbyyearmonth_bike[yearmonth]++;
						}
						layer.bindPopup(
							'<span class=popuptitle>Crash Detail</span>' +
							'<ul><li><span class="listlabel">Type</span>: Cyclist</li>' +
							'<li><span class="listlabel">Year</span>: ' + feature.properties.year + '</li>' +
							'<li><span class="listlabel">Road</span>: ' + new String(feature.properties.road).toUpperCase() + '</li>' +
							'<li><span class="listlabel">Lanes</span>: ' + feature.properties.lanes + '</li>' +
							'<li><span class="listlabel">Injury</span>: ' + injuryLabels[parseInt(tempSeverity) - 1] + '</li>' +
							//'<li><span class="listlabel">Speed Limit: ' + getNumber(feature.properties.drv_posted_nbr) + '</li>' +
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
			if (chartModeMonths) {
				doChart(countbyyearmonth_bike, yearsActive, "Cyclist Crashes")
			}
			else {
				doChart(countbyyear_bike, yearsActive, "Cyclist Crashes")
			}
		}
		document.getElementById("titleCrashes").innerHTML = currentCrashesTitle;
		currentCrashesCount = ' (found ' + countTot + ' crashes matching these settings: <a style="text-decoration:none" href="javascript:exportToCSV()">export csv</a>)';
		document.getElementById("countCrashes").innerHTML = currentCrashesCount
		document.getElementById("legendCrashes").innerHTML = legend;
		document.getElementById("labelCrashes").style.display = "block";
		loadStop();
	}
}

function countPointsInPolygon(pointcoords, polygon) {
	loadStart();
	var totalcount = pointcoords.length
	var thiscount = 0
	var thiscountfs = 0
	var countbyyear_temp = []
	var countbyyearmonth_temp = []
	for (i = 0; i < years.length; i++) {
		countbyyear_temp[years[i] + "-"] = 0
		for (k = 1; k < 13; k++) {
			countbyyearmonth_temp[years[i] + "-" + k] = 0
		}
	}
	if (lastpointmap || lastheatmap) {
		for (i = 1; i < pointcoords.length; i++) {
			var tone = turf.point([pointcoords[i][1], pointcoords[i][0]])
			if (turf.booleanPointInPolygon(tone, polygon)) {
				thiscount++
				if (pointcoords[i][2] >= 0.8) {
					thiscountfs++
				}
				countbyyear_temp[pointcoords[i][3] + "-"]++;
				yearmonth = ((pointcoords[i][3]) + "-" + pointcoords[i][4])
				countbyyearmonth_temp[yearmonth]++;
			}
		}
	}
	var timecount = countbyyear_temp
	if (chartModeMonths) {
		timecount = countbyyearmonth_temp
	}
	var returnArray = [thiscount, thiscountfs, totalcount, timecount]
	loadStop();
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
				if (transon == type_ped) { //need this check in case it was switched off
					if (count[0] > 0 & severityActive[0] == 1 & severityActive[1] == 5) {
						document.getElementById('ccount' + feature.properties.OBJECTID).innerHTML += "</br>" + Math.round((count[1] / count[0]) * 100) + "% are severe or fatal";
					}
					document.getElementById('ccount' + feature.properties.OBJECTID).innerHTML += "</br></br>This community has " + formatPercent(count[0], count[2]) + " of all crashes matching these settings";
					if (chartModeMonths) {
						doChart(count[3], yearsActive, "Pedestrian Crashes")
					}
					else {
						doChart(count[3], yearsActive, "Pedestrian Crashes")
					}
					if (showTrends) {
						document.getElementById("titleCrashes").innerHTML = "Pedestrian Crashes in " + feature.properties.AREA_NAME.toUpperCase()
					}
					else {
						document.getElementById("titleCrashes").innerHTML = ""
					}
					document.getElementById("countCrashes").innerHTML = "";
				}
				e.propagatedFrom.setStyle(polyCommunityHighlightStyle);
			});
			poly1.on('popupclose', function (e) {
				e.propagatedFrom.setStyle(polyCommunityStyle);
				if (chartModeMonths) {
					doChart(countbyyearmonth_ped, yearsActive, "Pedestrian Crashes")
				}
				else {
					doChart(countbyyear_ped, yearsActive, "Pedestrian Crashes")
				}
				document.getElementById("titleCrashes").innerHTML = currentCrashesTitle;
				document.getElementById("countCrashes").innerHTML = currentCrashesCount;
			});
		}
		else if (transon == type_bike) {
			poly1.on('popupopen', function (e) {
				loadStart();
				var feature = e.popup._source.feature;
				var count = countPointsInPolygon(pointcoords_bike, feature);
				document.getElementById('ccount' + feature.properties.OBJECTID).innerHTML = count[0] + " crashes matching these settings";
				if (transon == type_bike) { //need this check in case it was swtiched off
					if (count[0] > 0 & severityActive[0] == 1 & severityActive[1] == 5) {
						document.getElementById('ccount' + feature.properties.OBJECTID).innerHTML += "</br>" + Math.round((count[1] / count[0]) * 100) + "% are severe or fatal";
					}
					document.getElementById('ccount' + feature.properties.OBJECTID).innerHTML += "</br></br>This community has " + formatPercent(count[0], count[2]) + " of all crashes matching these settings";
					if (chartModeMonths) {
						doChart(count[3], yearsActive, "Cyclist Crashes")
					}
					else {
						doChart(count[3], yearsActive, "Cyclist Crashes")
					}
					document.getElementById("titleCrashes").innerHTML = "Cyclist Crashes in " + feature.properties.AREA_NAME.toUpperCase()
					document.getElementById("countCrashes").innerHTML = "";
				}
				e.propagatedFrom.setStyle(polyCommunityHighlightStyle);
			});
			poly1.on('popupclose', function (e) {
				e.propagatedFrom.setStyle(polyCommunityStyle);
				if (chartModeMonths) {
					doChart(countbyyearmonth_bike, yearsActive, "Cyclist Crashes")
				}
				else {
					doChart(countbyyear_bike, yearsActive, "Cyclist Crashes")
				}
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

function toggleBasemap() {
	if (basemap) {
		map.removeLayer(basemap);
		basemapon = false;
	}
	mbAttribution = "OpenStreetMap; " + mapAttribution
	mbUrl = 'https://{s}.tile.osm.org/{z}/{x}/{y}.png'
	if (checkedAerial) {
		mbAttribution = "ESRI; " + mapAttribution
		mbUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
	}
	basemap = L.tileLayer(mbUrl, {
		id: 'mapbox.light',
		attribution: mbAttribution
	});
	basemap.addTo(map);
	basemapon = true;
}

function showHeatMap() {
	if (checkedHeat) {
		if (lastheatmap) {
			map.removeLayer(lastheatmap);
		}
		if (transon == type_ped) {
			heat1 = L.heatLayer(pointcoords_ped_heat, heatConfig)
			heat1.addTo(map);
			lastheatmap = heat1;
		}
		else if (transon == type_bike) {
			heat2 = L.heatLayer(pointcoords_bike_heat, heatConfig)
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
function doCensusMap(i, lat, long, bas, val, addval1, addval2, addval3, title, size, invert) {
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
			if (invert) {
				percent = 100 - percent
			}
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
		document.getElementById("legendCensus").innerHTML = "LOADING...";
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
		if (censusDown) {
			document.getElementById("legendCensus").innerHTML = "ERROR";
			document.getElementById("labelCensus").style.display = "none";
			document.getElementById("navigationDemo").innerHTML = "The Census API is unavailable right now. We apologize for the inconvenience, and are working on bringing this feature back.";
			loadStop();
		}
		else {
			census({
				"vintage": censusAcsYear,
				geoHierarchy: {
					// required
					state: censusStateFips,
					county: censusCountyFips,
					tract: "*"
				},
				sourcePath: ["acs", "acs5"],
				"values": valArray,
				"statsKey": censusAccessToken,
				"geoResolution": "500k"
			},
				function (error, response) {
					if (error) {
						document.getElementById("legendCensus").innerHTML = "ERROR";
						document.getElementById("labelCensus").style.display = "none";
						document.getElementById("navigationDemo").innerHTML = "The Census API is unavailable right now. We apologize for the inconvenience.";
						loadStop();
					}
					else {
						console.log(response)
						document.getElementById("legendCensus").innerHTML = "";
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
				}
			)
		}
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
	if (transon == type_ped | transon == type_bike) {
		pointcoords_ped = []; pointcoords_ped_heat = []; countbyyear_ped = []; countbyyearmonth_ped = [];
		pointcoords_bike = []; pointcoords_bike_heat = []; countbyyear_bike = []; countbyyearmonth_bike = []
	}
	if (transon == type_ped) {
		switchMap(type_crashes, type_ped);
	}
	else if (transon == type_bike) {
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

function getSeverityLabel(x) {
	if (invertSeverity) {
		x = invertSeverityValues(x);
	}
	if (x == 1) { return "Property Damage" }
	else if (x == 2) { return "Possible Injury" }
	else if (x == 3) { return "Non-Incapacitating Injury" }
	else if (x == 4) { return "Incapacitating Injury" }
	else if (x == 5) { return "Fatal" }
	else { return x }
}


function checkSeverity(values, handle, unencoded, tap, positions, noUiSlider) {
	if (invertSeverity) {
		newValues = [invertSeverityValues(values[1]), invertSeverityValues(values[0])]
	}
	else {
		newValues = [values[0], values[1]]
	}
	severityActive = newValues
	map.closePopup();
	if (transon == type_ped) {
		pointcoords_ped = []; pointcoords_ped_heat = []; countbyyear_ped = []; countbyyearmonth_ped = [];
		switchMap(type_crashes, type_ped);
	}
	else if (transon == type_bike) {
		pointcoords_bike = []; pointcoords_bike_heat = []; countbyyear_bike = []; countbyyearmonth_bike = [];
		switchMap(type_crashes, type_bike);
	}
}

function switchChartMode() {
	map.closePopup();
	if (chartModeMonths) {
		chartModeMonths = false
		if (transon == type_ped) {
			doChart(countbyyear_ped, yearsActive, "Pedestrian Crashes")
		}
		else if (transon == type_bike) {
			doChart(countbyyear_bike, yearsActive, "Cyclist Crashes")
		}
		document.getElementById('linkChart').innerHTML = '<a href="javascript:switchChartMode()">switch to month view &#9660; &nbsp;&nbsp;</a>';
	}
	else {
		chartModeMonths = true
		if (transon == type_ped) {
			doChart(countbyyearmonth_ped, yearsActive, "Pedestrian Crashes")
		}
		else if (transon == type_bike) {
			doChart(countbyyearmonth_bike, yearsActive, "Cyclist Crashes")
		}
		document.getElementById('linkChart').innerHTML = '<a href="javascript:switchChartMode()">switch to year view &#9660; &nbsp;&nbsp;</a>';
	}
}


//CREATE CHARTS
function doChart(whichCounts, whichYears, label) {
	if (showTrends) {
		if (lineChart) {
			lineChart.destroy();
		}
		timeToDisplay_all = Object.keys(whichCounts)
		countsToDisplay_all = Object.keys(whichCounts).map(k => whichCounts[k])
		timeToDisplay = []
		countsToDisplay = []
		toSum = 0
		toDiv = 0
		for (i = 0; i < timeToDisplay_all.length; i++) {
			thisyear = parseInt(timeToDisplay_all[i].substring(0, 4))
			if (thisyear >= whichYears[0] & thisyear <= whichYears[1]) {
				if (!chartModeMonths) {
					timeToDisplay.push(thisyear)
				}
				else {
					timeToDisplay.push(timeToDisplay_all[i])
				}
				if (!omitFinalYearFromTrends | (omitFinalYearFromTrends & i < (years.length - 1))) {
					countsToDisplay.push(whichCounts[timeToDisplay_all[i]])
				}
			}
		}
		if (chartModeMonths) {
			xObject = {
				type: 'time',
				time: {
					parser: 'YYYY-M',
					unit: 'month',
					displayFormats: {
						month: 'YYYY-M'
					}
				},
				display: true,
				ticks: {
					major: {
						enabled: true
					},
				}
			}
		}
		else {
			xObject = {
				display: true,
				ticks: {
					major: {
						enabled: true
					},
				}
			}
		}
		lineChart = new Chart(document.getElementById("line-chart"), {
			type: 'line',
			data: {
				labels: timeToDisplay,
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
					text: 'Crash Trend (Current Settings)'
				},
				plugins: {
					legend: {
						display: false
					},
				},
				scales: {
					y: {
						display: true,
						ticks: {
							major: {
								enabled: true
							},
						},
					},
					x: xObject
				}
			}
		});
	}
}

//ASSIGN EVENTS
document.getElementById('closeInfoOverlayLink1').addEventListener("click", function () { closeInfoOverlay() });
document.getElementById('closeStartOverlayLink1').addEventListener("click", function () { closeStartOverlay() });
document.getElementById('closeInfoOverlayLink2').addEventListener("click", function () { closeInfoOverlay() });
document.getElementById('closeStartOverlayLink2').addEventListener("click", function () { closeStartOverlay() });
document.getElementById('openInfoOverlayLink').addEventListener("click", function () { openInfoOverlay() });
document.getElementById("linkPed").addEventListener("click", function () { manageButtonState(type_crashes, type_ped) });
document.getElementById("linkBike").addEventListener("click", function () { manageButtonState(type_crashes, type_bike) });
document.getElementById("linkRace").addEventListener("click", function () { manageButtonState(type_census, type_race) });
document.getElementById("linkEth").addEventListener("click", function () { manageButtonState(type_census, type_eth) });
document.getElementById("linkPov").addEventListener("click", function () { manageButtonState(type_census, type_pov) });
document.getElementById("linkMode").addEventListener("click", function () { manageButtonState(type_census, type_mode) });
document.getElementById("linkChi").addEventListener("click", function () { manageButtonState(type_census, type_chi) });
document.getElementById("linkHou").addEventListener("click", function () { manageButtonState(type_census, type_hou) });
document.getElementById('heatButton').addEventListener("click", function () { checkHeat() });
document.getElementById('markerButton').addEventListener("click", function () { checkMarkers() });
document.getElementById('commButton').addEventListener("click", function () { checkCommunity() });
document.getElementById('aeriButton').addEventListener("click", function () { checkAerial() });
if (chartModeMonths) {
	document.getElementById('linkChart').innerHTML = '<a href="javascript:switchChartMode()">switch to year view &#9660; &nbsp;&nbsp;</a>';
}
else {
	document.getElementById('linkChart').innerHTML = '<a href="javascript:switchChartMode()">switch to month view &#9660; &nbsp;&nbsp;</a>';
}


//INIT THE INTERFACE
function setTitles() {
	document.title = localeLongName + " Crash Data Explorer";
	document.getElementById('mainTitleName').innerHTML = localeLongName.toUpperCase();
	document.getElementById('aboutTitleName').innerHTML = localeShortName.toUpperCase();
	document.getElementById('overlayTitleName').innerHTML = localeShortName.toUpperCase();
	document.getElementById('overlayIntroDescription').innerHTML = introDescription;
	document.getElementById('overlayAboutDescription').innerHTML = aboutDescription;
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
			values: years.length,
			density: 50
		},
		start: [yearsDefault[0], yearsDefault[yearsDefault.length - 1]],
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
		start: [severityDefault[0], severityDefault[severityDefault.length - 1]],
		connect: true,
	});
	slider2.noUiSlider.on('set', checkSeverity);
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
toggleBasemap();
if (showTrends) {
	document.getElementById('showBlockChart').style.display = "block"
}
setSourceNotes();
setDevNotes();
setSliders();

//Show ped crashes on open
manageButtonState(type_crashes, type_ped)

//Set fatal crash rates

whichfatal = 5
if (invertSeverity) { whichfatal = 1 }
pedfatrate = ((((PedCrashes.features.filter(item => { return item.properties.severity == whichfatal })).length) / years.length) / population) * 100000
bikefatrate = ((((BikeCrashes.features.filter(item => { return item.properties.severity == whichfatal })).length) / years.length) / population) * 100000
document.getElementById('PedFatalRate').innerHTML = Math.round(pedfatrate * 10) / 10;
document.getElementById('BikeFatalRate').innerHTML = Math.round(bikefatrate * 10) / 10;
if (invertSeverity) {
	pedksirate = ((((PedCrashes.features.filter(item => { return item.properties.severity < 3 })).length) / years.length) / population) * 100000
	bikeksirate = ((((BikeCrashes.features.filter(item => { return item.properties.severity < 3 })).length) / years.length) / population) * 100000
}
else {
	pedksirate = ((((PedCrashes.features.filter(item => { return item.properties.severity > 3 })).length) / years.length) / population) * 100000
	bikeksirate = ((((BikeCrashes.features.filter(item => { return item.properties.severity > 3 })).length) / years.length) / population) * 100000
}
document.getElementById('PedKSIRate').innerHTML = Math.round(pedksirate * 10) / 10;
document.getElementById('BikeKSIRate').innerHTML = Math.round(bikeksirate * 10) / 10;

document.getElementById('rankName').innerHTML = localeShortName;

function exportToCSV() {
	filename = "cde_export";
	csvString = "TYPE,"
	keyWritten = 0
	whichCrashes = PedCrashes
	whichTypeString = "Pedestrian"
	if (transon == type_bike) {
		whichCrashes = BikeCrashes
		whichTypeString = "Cyclist"
	}
	for (var i = 0; i < whichCrashes.features.length; i++) {
		if (compareAgainstSettings(whichCrashes.features[i])) {
			obj = whichCrashes.features[i].properties
			k = 0
			for (var key in obj) {
				if (keyWritten == 0) {
					csvString += key + ","
					i = -1
				}
				else {
					if (k == 0) {
						csvString += whichTypeString + ","
					}
					csvString += obj[key] + ","
				}
				k++;
			}
			keyWritten = 1
			if (i == -1) {
				csvString += "severityString,"
			}
			else {
				csvString += getSeverityLabel(obj["severity"]) + ","
			}
			csvString += "\r\n";
		}
	}
	var blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
	if (navigator.msSaveBlob) { // IE 10+
		navigator.msSaveBlob(blob, filename);
	} else {
		var link = document.createElement("a");
		if (link.download !== undefined) { // feature detection
			// Browsers that support HTML5 download attribute
			var url = URL.createObjectURL(blob);
			link.setAttribute("href", url);
			link.setAttribute("download", filename);
			link.style.visibility = 'hidden';
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
		}
	}
}