//CONFIGURATION

//CONTENT
//Note: for SEO purposes you may want to also have this text hardcoded in the HTML as in the Columbus example
var localeShortName = "COLUMBUS"
var localeLongName = "COLUMBUS"
var localeTechnicalName = "Franklin County"
var introDescription = 'Through this interface you can explore patterns of pedestrian and cyclist crashes in the Columbus Metro area and understand their connection to different communities and built environments.'
var aboutDescription = 'The Columbus Crash Data Explorer allows users to explore patterns of pedestrian and cyclist crashes in the Columbus Metro area and understand their connection to different communities and built environments. It\'s underlying software was developed at The Ohio State University through a <a href="https://steamfactory.osu.edu/">STEAM Factory</a> postdoctoral research fellowship, with the support of <a href="https://cura.osu.edu/">The Center for Urban and Regional Analysis (CURA)</a>.'
var mapAttribution = 'Ohio DOT; Smart Columbus OS; US Census; MapBox'
//Sources and notes on the about overlay
var sourcesNotes = []
sourcesNotes.push('Crash data is collected by the Ohio Department of Public Safety and Ohio Department of Transportation');
sourcesNotes.push('Demographic data is from the 2018 American Community Survey and is accessed through APIs provided by the <a href="https://www.census.gov/developers/">US Census</a> Bureau');
sourcesNotes.push('Google street views may not reflect street design at the time of crashes');
var devNotes = []
devNotes.push('Open source code is available in the <a href="https://github.com/jezras/CrashDataExplorer">Crash Data Explorer GitHub repository</a> and assistance is available through the <a href="http://www.crashdataexplorer.org/">project website</a>');
devNotes.push('Crash Data Explorer is built with <a href="https://github.com/Leaflet/Leaflet">Leaflet</a>, <a href="https://github.com/Leaflet/Leaflet.heat">Leaflet Heat</a>, <a href="https://www.chartjs.org/">Chart.js</a>, <a href="https://github.com/uscensusbureau/citysdk/">CitySDK</a>, and <a href="https://geopandas.org/">GeoPandas</a>');
var showOverlayOnLaunch = true;

//MAP CONFIGURATION
//You can get a Census access token here: https://api.census.gov/data/key_signup.html
var censusAccessToken = 'ab863b6fc96a6443ccc41bd1dfda2694ace723ff';
var censusAcsYear = "2018"
var censusStateFips = "39"
var censusCountyFips = "041,045,049,089,097,159,129"
//Set where to center the map
var centerLat = 39.993683
var centerLong = -82.981293
//Possible range of values for the year and severity variables (depends on your data)
var years = [2016, 2017, 2018, 2019, 2020, 2021]
var showTrends = true //false if annual data for the above years is not complete
var omitFinalYearFromTrends = false //true if just the last year of data is incomplete
var severity = [1, 2, 3, 4, 5]
var invertSeverity = true //true if 1 is fatal, false if 5 is fatal

//ADVANCED DATA CONFIGURATION
//YOU WILL NEED TO CONFIGURE SOME OF THESE DATA LABELS TO SUIT YOUR DATA AS STANDARDS DIFFER BETWEEN STATES 
//For example the following line indicates that the variable named "month" has value "1" which is labeled "January", and value "2" which is labeled February. etc.
//Many of these are presently not implemented but could be depending on the quality of each locale's data
var monthLabels = ["January", "Febuary", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
var dayinweekLabels = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
var severityLabels = ["No injury", "Possible injury", "Non-incapacitating injury", "Incapacitating Injury", "Fatality"]
var injuryLabels = ["None", "Possible", "Injured", "Serious", "Fatal"] //rephrasing of above
var lightingconditionLabels = ["Daylight", "Dawn", "Dusk", "Dark - Lighted", "Dark - Unlighted", "Dark - Unknown Lighting", "Glare", "Other", "Unknown"]
var weatherconditionLabels = ["Clear", "Cloudy", "Fog/Smog/Smoke", "Rain", "Sleet", "Snow", "Crosswinds", "Blowing Dust/Snow", "Unknown/Other"]
var locationLabels = ["Not an Intersection", "Four-way intersection", "T Intersection", "Y Intersection", "Circle", "Five point or more", "On ramp", "Off ramp", "Crossover", "Driveway/Alley", "Railway", "Shared Use", "Unknown"]
var facilitytypeLabels = ["One way", "Two way", "Ramp", "Non Mainline", "Non Inventory", "Unbuilt"]
//The following lables apply to user entities, not the overall crash
var distractedLabels = ["Using device", "Talking hands-free", "Talking device", "Y Intersection", "Circle", "Five point or more", "On ramp", "Off ramp", "Crossover", "Driveway/Alley", "Railway", "Shared Use", "Unknown"]
var pedlocationLabels = ["Intersection Marked", "Intersection Unmarked", "Intersection Other", "Midblock", "Travel Lane", "Bike Lane", "Shoulder", "Sidewalk", "Medial", "Driveway", "Shared Use", "Non-Traffic"]
var distractedLabels = ["Not an Intersection", "Four-way intersection", "T Intersection", "Y Intersection", "Circle", "Five point or more", "On ramp", "Off ramp", "Crossover", "Driveway/Alley", "Railway", "Shared Use", "Unknown"]
var unittypeLabels = ["Passenger Car", "Minivan", "SUV", "Pick Up", "Cargo Van", "Large Van", "Motorcycle", "Motorcycle (3 Wheels)", "Autocycle", "Moped", "ATV", "Golf Cart", "Snowmobile", "Truck (Box)", "Truck (Semi)", "Farm", "Motorhome", "Limo", "Bus", "Other", "Equipment", "Animal Powered", "Pedestrian", "Wheelchair", "Other NM", "Bicycle", "Train", "Unknown"]
var trafficcontrolLabels = ["Roundabout", "Signal", "Flasher", "Stop Sign", "Yield Sign", "No Control"]

//HEAT SETTINGS
var heatConfig = {
    minOpacity: 0.03,
    radius: 20,
    blur: 15,
    maxZoom: 14,
}
//MAP STYLE 
var circlePedStyle = {
    radius: 2,
    fillColor: "#800080",
    color: "#000",
    weight: 1,
    opacity: 1,
    fillOpacity: 0.8
};
var circleBikeStyle = {
    radius: 2,
    fillColor: "#b7410e",
    color: "#000",
    weight: 1,
    opacity: 1,
    fillOpacity: 0.8
};
var polyCommunityStyle = {
    color: "#333",
    fillOpacity: 0.0,
    weight: 2,
    opacity: 1,
    zIndex: 99
}
var polyCommunityHighlightStyle = {
    color: "#0000EE",
    fillOpacity: 0.2,
    weight: 4,
    opacity: 1,
    zIndex: 99
}