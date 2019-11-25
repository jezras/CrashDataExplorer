//CONFIG VARIABLES
var mapboxAccessToken = 'pk.eyJ1IjoiamV6cmFzIiwiYSI6ImNrMGlnMWxnZjA4aHMzYnRhd2V3YTg3aGIifQ.0SNO4qhvtMfgxdq5AhveRw'; 
var censusAccessToken = 'ab863b6fc96a6443ccc41bd1dfda2694ace723ff'; 
var monthArray = ["January", "Febuary", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
var severityArray = ["No injury", "Possible injury", "Non-incapacitating injury", "Incapacitating Injury", "Fatality"]
var lightingArray = ["Daylight", "Dawn", "Dusk", "Dark - Lighted", "Dark - Unlighted", "Dark - Unknown Lighting", "Glare", "Other", "Unknown"]
var weatherArray = ["Clear", "Cloudy", "Fog/Smog/Smoke", "Rain", "Sleet", "Snow", "Crosswinds", "Blowing Dust/Snow", "Unknown/Other"]
var locationArray = ["Not an Intersection", "Four-way intersection", "T Intersection", "Y Intersection", "Circle", "Five point or more", "On ramp", "Off ramp", "Crossover", "Driveway/Alley", "Railway", "Shared Use", "Unknown"]
var centerLat = 39.96
var centerLong = -83.00
var lineStyle = {
	"color": "#000000",
	"weight": 1,
	"opacity": 1,
	"fillColor": "#fff",
	"fillOpacity": "0.0"
};
var circlePed = {
    radius: 4,
    fillColor: "#800080",
    color: "#000",
    weight: 1,
	opacity: 1,
	fillOpacity: 0.8
};
var circleBike = {
    radius: 4,
    fillColor: "#b7410e",
    color: "#000",
    weight: 1,
	opacity: 1,
	fillOpacity: 0.8
};

//HARDCODED DATA SOURCE GEOJSON VARIABLE NAMES
pedgeo = "FCPCrashes";
bikegeo =  "FCCCrashes";

//TRACKING STATE VARIABLES
var isLoading=false;
var lastcensusmap=null;
var lastpointmap=null;
var lastheatmap=null;
var choro1=null;
var choro2=null;
var choro3=null;
var choro4=null;
var choro5=null;
var point1=null;
var point2=null;
var point3=null;
var heat1=null;
var heat2=null;
var point1coords = []
var point2coords = []
var basemap=null;
var basemapon=false;
var transon=0;
var demoon=0;
var hasHeat = 0;
var checkedHeat = true
var checkedMarker = true

//INITIALIZE MAP
// initialize the map
var map = L.map('map', {
  scrollWheelZoom: false
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
	if (transon==1) {
		switchMap(2,1);
	}
	else if (transon==2) {
		switchMap(2,2);
	}
}

function loadStart() {
	document.getElementById("loading").style.display = "block";
	isLoading=true;
}

function loadStop() {
	document.getElementById("loading").style.display = "none";
	isLoading=false;
}

function getStreetViewURL(lat,long) {
	var svurl = "http://maps.google.com/maps?q=&layer=c&cbll="+lat+","+long+"&cbp=11,0,0,0,0";
	return svurl;
}

function getNumber(object) {
	if (object==null || object=="null" || object=="0" || object==0) {
		return "";
	}
	else { 
		return object;
	}
}

//MAP CONTROLS
function switchMap(type,num) {
	//some sort of reset here
	loadStart();
	if (type==1) {
		document.getElementById("legend").innerHTML="";
		document.getElementById("title1").style.display = "hidden";
		document.getElementById("source1").style.display = "hidden";
		if (num==1) { //black
			doCensusMap(1, 39.970351, -82.998482, "B01003_001E", "B02001_003E", null, null, null, "Percent of Population Who Identify as Black or African American", 3)
		}
		else if (num==2) { //ethnicity
			doCensusMap(2, 39.970351, -82.998482, "B01003_001E", "B03001_003E", null, null, null, "Percent of Population Who Identify as Hispanic or Latino", 3)
		}
		else if (num==3) { //poverty below 100
			doCensusMap(3, 39.970351, -82.998482, "B01003_001E", "B06012_002E", null, null, null, "Percent of Population Below Poverty Level", 3)
		}
		else if (num==4) { //travel
			doCensusMap(4, 39.970351, -82.998482, "B01003_001E", "B08301_019E", "B08301_018E", "B08301_011E", null, "Percent of Population Who Walked, Biked or Rode Bus to Work", 1)
		}
		else if (num==5) { //kids
			doCensusMap(5, 39.970351, -82.998482, "B01003_001E", "B01001_029E", "B01001_005E", "B01001_028E", "B01001_004E", "Percent of Children Aged 5 to 14 Years", 2)
		}
		document.getElementById("source1").style.display = "block";
	}
	if (type==2) {
		if (checkedMarker) {
			document.getElementById("title2").style.display = "hidden";
			document.getElementById("source2").style.display = "hidden";
			title="";
			legend="";
			if (lastpointmap) {
				map.removeLayer(lastpointmap);
				lastpointmap=null;
			}
			if (lastheatmap) {
				map.removeLayer(lastheatmap);
				lastheatmap=null;
			}
			if (num==1) {
				title="Pedestrian-Involved Crashes in Franklin County";
				legend='<div class="dot1"></div> Pedestrian Crash';
				doCoords = point1coords.length
				point1 = L.geoJson(eval(pedgeo),{
					pointToLayer: function (feature, latlng) {
						return L.circleMarker(latlng, circlePed);
					},
					onEachFeature: function (feature, layer) {
						if (doCoords==0) { point1coords.push([feature.geometry.coordinates[1],feature.geometry.coordinates[0]]); }
						layer.bindPopup(
							'<ul><li>Type: Pedestrian-Involved</li>' +
							'<ul><li>Crash Year: '+feature.properties.crash_yr+'</li>' +
							'<li>Severity: '+severityArray[parseInt(feature.properties.severity_by_type_cd)-1]+'</li>' +
							'<li>Road Speed: '+getNumber(feature.properties.drv_posted_nbr)+'</li>' +
							//'<li>Reported Travel Speed: '+getNumber(feature.properties.drv_speed_nbr)+'</li>' +
							'<li>Lighting: '+lightingArray[parseInt(feature.properties.light_cond_primary_cd)-1]+'</li>' +
							'<li><a target="_blank" href="'+getStreetViewURL(feature.geometry.coordinates[1],feature.geometry.coordinates[0])+'">Launch Street View in New Tab</a></li></ul>'
						);
					}
				})
				point1.addTo(map);
				lastpointmap=point1
				if (checkedHeat) {
					showHeatMap();
				}
			}
			else if (num==2) {
				title="Cyclist-Involved Crashes in Franklin County";
				legend='<div class="dot2"></div> Cyclist Crash';
				doCoords = point2coords.length
				point2 = L.geoJson(eval(bikegeo),{
					pointToLayer: function (feature, latlng) {
						return L.circleMarker(latlng, circleBike);
					},
					onEachFeature: function (feature, layer) {
						if (doCoords==0) { point2coords.push([feature.geometry.coordinates[1],feature.geometry.coordinates[0]]); }
						layer.bindPopup(
							'<ul><li>Type: Cyclist-Involved</li>' +
							'<li>Crash Year: '+feature.properties.crash_yr+'</li>' +
							'<li>Severity: '+severityArray[parseInt(feature.properties.severity_by_type_cd)-1]+'</li>' +
							'<li>Road Speed: '+getNumber(feature.properties.drv_posted_nbr)+'</li>' +
							//'<li>Reported Travel Speed: '+getNumber(feature.properties.drv_speed_nbr)+'</li>' +
							'<li>Lighting: '+lightingArray[parseInt(feature.properties.light_cond_primary_cd)-1]+'</li>' +
							'<li><a target="_blank" href="'+getStreetViewURL(feature.geometry.coordinates[1],feature.geometry.coordinates[0])+'">Launch Street View in New Tab</a></li></ul>'
						);
					}
				})
				point2.addTo(map);
				lastpointmap=point2
				if (checkedHeat) {
					showHeatMap();
				}
			}
			document.getElementById("title2").innerHTML = title;
			document.getElementById("legend2").innerHTML = legend;
			document.getElementById("title2").style.display = "block";
			document.getElementById("source2").style.display = "block";
			
		}
		else { //checkedMarker=false
			if (lastpointmap) {
				document.getElementById("title2").style.display = "hidden";
				document.getElementById("source2").style.display = "hidden";
				title="";
				legend="";
				map.removeLayer(lastpointmap);
				lastpointmap=null;
			}
			showHeatMap();
		}
		loadStop();	
	}
}

function manageButtonState(which,setto) {
	if (!isLoading) {
		if (which==2) {
			document.getElementById("link1").style.borderColor="#124d77"
			document.getElementById("link2").style.borderColor="#124d77"
			if (transon!=setto) {
				transon=setto;
				if (setto==1) {
					document.getElementById("link1").style.borderColor="#CC0000"
					switchMap(2,1);
				}
				else if (setto==2) {
					document.getElementById("link2").style.borderColor="#CC0000"
					switchMap(2,2);
				}
			}
			else {
				if (lastpointmap) {
					map.removeLayer(lastpointmap);
					lastpointmap==null;
				}
				if (lastheatmap) {
					map.removeLayer(lastheatmap);
					lastheatmap=null;
				}
				transon=0
				document.getElementById("legend2").innerHTML="";
				document.getElementById("title2").style.display = "none";
				document.getElementById("source2").style.display = "none";
			}
		}
		else if (which==1) {
			document.getElementById("link2").style.borderColor="#124d77"
			document.getElementById("link3").style.borderColor="#124d77"
			document.getElementById("link4").style.borderColor="#124d77"
			document.getElementById("link5").style.borderColor="#124d77"
			document.getElementById("link6").style.borderColor="#124d77"
			document.getElementById("link7").style.borderColor="#124d77"
			if (demoon!=setto) {			
				if (setto==3) {
					document.getElementById("link3").style.borderColor="#CC0000"
					switchMap(1,1);
				}
				else if (setto==4) {
					document.getElementById("link4").style.borderColor="#CC0000"
					switchMap(1,2);
				}
				else if (setto==5) {
					document.getElementById("link5").style.borderColor="#CC0000"
					switchMap(1,3);
				}
				else if (setto==6) {
					document.getElementById("link6").style.borderColor="#CC0000"
					switchMap(1,4);
				}
				else if (setto==7) {
					document.getElementById("link7").style.borderColor="#CC0000"
					switchMap(1,5);
				}
				demoon=setto;
			}
			else {
				map.removeLayer(lastcensusmap);
				lastcensusmap=null
				demoon=0
				document.getElementById("legend").innerHTML="";
				document.getElementById("title1").style.display = "none";
				document.getElementById("source1").style.display = "none";
			}
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
		basemapon=true;
	} 
	else {
		map.removeLayer(basemap);
		basemapon=false;
	}
}

function showHeatMap() {
	if (checkedHeat) {
		if (lastheatmap) {
			map.removeLayer(lastheatmap);
		}
		if (transon==1) {
			heat1 = L.heatLayer(point1coords,{
				minOpacity: 0.03,
				max: 1,
				radius: 20,
				blur: 15, 
				maxZoom: 16,
			})
			heat1.addTo(map);
			lastheatmap=heat1;
		}
		else if (transon==2) {
			heat2 = L.heatLayer(point2coords,{
				minOpacity: 0.03,
				max: 1,
				radius: 20,
				blur: 15, 
				maxZoom: 16,
			})
			heat2.addTo(map);
			lastheatmap=heat2;	
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
	var grades = ["0", "10", "20", "30", "40", "50"];
	if (size==1) {
		grades = ["0", "3", "6", "9", "12", "15"];
	}
	else if (size==2) {
		grades = ["0", "5", "10", "15", "20", "25"];
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
		var total_pop = eval("feature.properties."+bas);
		var total_pop_comp = eval("feature.properties."+val);
		if (addval1) {
			total_pop_comp+=eval("feature.properties."+addval1);
		}
		if (addval2) {
			total_pop_comp+=eval("feature.properties."+addval2);
		}
		if (addval3) {
			total_pop_comp+=eval("feature.properties."+addval3);
		}
		//calculate percent
		if (total_pop && total_pop_comp) {
		// check if valid (no 0s or undefined)
		var percent = (total_pop_comp / total_pop) * 100;
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
		var div = document.getElementById("legend");
		if (size==1) {
			div.innerHTML +='<i style="background:' +
			getColor(parseInt(grades[i]) + 1, grades) +
			'; opacity: 0.6; clear:left;"></i> <span style="display: inline-block; margin-top:2px;">' +
			grades[i] +
			"%" +
			(grades[i + 1] ? "&ndash;" + grades[i + 1] + "%" : "+") +
			"</span><br/>";
		}
		else if (size==2) {
			div.innerHTML +='<i style="background:' +
			getColor(parseInt(grades[i]) + 1, grades) +
			'; opacity: 0.6; clear:left;"></i> <span style="display: inline-block; margin-top:2px;">' +
			grades[i] +
			"%" +
			(grades[i + 1] ? "&ndash;" + grades[i + 1] + "%" : "+") +
			"</span><br/>";
		}
		else {
			div.innerHTML +='<i style="background:' +
			getColor(parseInt(grades[i]) + 1, grades) +
			'; opacity: 0.6; clear:left;"></i> <span style="display: inline-block; margin-top:2px;">' +
			grades[i] +
			"%" +
			(grades[i + 1] ? "&ndash;" + grades[i + 1] + "%" : "+") +
			"</span><br/>";
		}
	}
	document.getElementById("title1").innerHTML = title;
	document.getElementById("title1").style.display = "block";
	if (lastcensusmap) {
		map.removeLayer(lastcensusmap);
	}
	if (i==1 & choro1!=null) {
		choro1.addTo(map);
		lastcensusmap=choro1;	
		loadStop();
		grades.forEach(makegrade)
	}
	else if (i==2 & choro2!=null) { 
		choro2.addTo(map);
		lastcensusmap=choro2;	
		loadStop();
		grades.forEach(makegrade)
	}
	else if (i==3 & choro3!=null) { 
		choro3.addTo(map);
		lastcensusmap=choro3;	
		loadStop();
		grades.forEach(makegrade)
	}
	else if (i==4 & choro4!=null) { 
		choro4.addTo(map);
		lastcensusmap=choro4;	
		loadStop();
		grades.forEach(makegrade)
	}
	else if (i==5 & choro5!=null) { 
		choro5.addTo(map);
		lastcensusmap=choro5;	
		loadStop();
		grades.forEach(makegrade)
	}	
	else {
		valArray = [bas,val];
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
				"vintage" : "2017",
				geoHierarchy: {
					// required
					state: {
					lat: lat,
					lng: long
					},
					"tract": "*" // <- syntax = "<descendant>" : "*"
				},
				sourcePath: ["acs", "acs5"],  
				"values" : valArray,           
				"statsKey" : censusAccessToken,
				"geoResolution" : "500k"
			},
			function(error, response) {
				if (i==1) {
					choro1= L.geoJson(response,{
						style: calculatePercents
					})
					choro1.addTo(map);
					lastcensusmap=choro1;	
				}
				else if (i==2) {
					choro2= L.geoJson(response,{
						style: calculatePercents
					})
					choro2.addTo(map);
					lastcensusmap=choro2;				
				}
				else if (i==3) {
					choro3= L.geoJson(response,{
						style: calculatePercents
					})
					choro3.addTo(map);
					lastcensusmap=choro3;		
				}
				else if (i==4) {
					choro4= L.geoJson(response,{
						style: calculatePercents
					})
					choro4.addTo(map);
					lastcensusmap=choro4;		
				}
				else if (i==5) {
					choro5= L.geoJson(response,{
						style: calculatePercents
					})
					choro5.addTo(map);
					lastcensusmap=choro5;		
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

//ASSIGN EVENTS
document.getElementById("link1").addEventListener("click", function(){manageButtonState(2,1)})
document.getElementById("link2").addEventListener("click", function(){manageButtonState(2,2)})
document.getElementById("link3").addEventListener("click", function(){manageButtonState(1,3)})
document.getElementById("link4").addEventListener("click", function(){manageButtonState(1,4)})
document.getElementById("link5").addEventListener("click", function(){manageButtonState(1,5)})
document.getElementById("link6").addEventListener("click", function(){manageButtonState(1,6)})
document.getElementById("link7").addEventListener("click", function(){manageButtonState(1,7)})
document.getElementById('heatButton').addEventListener("click", function(){checkHeat()})
document.getElementById('markerButton').addEventListener("click", function(){checkMarkers()})

showBasemap();


