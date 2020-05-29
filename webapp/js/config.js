//CONFIGURATION

//CONTENT
//Note: for SEO purposes you may want to also have this text hardcoded in the HTML as in the Columbus example
var localeShortName = "CBUS"
var localeLongName = "Columbus Ohio"
var localeTechnicalName = "Franklin County"
var aboutDescription = "Pedestrians and cyclists are the most vulnerable road users. The motor vehicle crashes that put them at risk are not accidental, but are related to weaknesses in our transportation system, including street design, road speed, and enforcement. Use this interactive map to explore the pattern of pedestrian and cyclist-involved crashes in our area and its connection to communities and underlying demographics to see who is most at risk. Click on markers where crashes occurred for details and street views to consider the role of the built environment."
//Show an advocacy box with up to four links
var showAdvocacy = 1
var advocacyLinks = [] //required if above==1
advocacyLinks.push('<a href = "https://vision-zero-columbus.hub.arcgis.com/">Vision Zero Columbus</a>');
advocacyLinks.push('<a href="https://visionzeronetwork.org/">Vision Zero Network</a>');
advocacyLinks.push('<a href = "https://smartgrowthamerica.org/program/national-complete-streets-coalition/publications/what-are-complete-streets/">Complete Streets(Smart Growth America)</a>');
//Sources and notes on the about overlay
var sourcesNotes = []
sourcesNotes.push('Crash data is collected by the Ohio Department of Transportation and is available through the <a href="https://www.smartcolumbusos.com/">Smart Columbus Operating System</a>');
sourcesNotes.push('Demographic data is from the American Community Survey and is accessed through APIs provided by the <a href="https://www.census.gov/developers/">US Census</a> Bureau');
sourcesNotes.push('Google street views may not reflect street design at the time of crashes');
var devNotes = []
devNotes.push('Created with <a href="http://www.crashdataexplorer.org/">Crash Data Explorer for Vision Zero</a>, an open source <a href="https://leafletjs.com/">Leaflet</a> map application.');

//MAP CONFIGURATION
//You can get a Census access token here: https://api.census.gov/data/key_signup.html
var censusAccessToken = 'YOUR_TOKEN_HERE';
var censusAcsYear = "2018"
//Display tabular data (requires running python script to generate)
//Set where to center the map
var centerLat = 39.970351
var centerLong = -82.998482
//Possible range of values for the year and severity variables (depends on your data)
var years = [2015, 2016, 2017, 2018, 2019]
var severity = [1, 2, 3, 4, 5]

//DATA CONFIGURATION
//YOU WILL LIKELY NEED TO CONFIGURE SOME OF THESE DATA LABELS TO SUIT YOUR DATA AS STANDARDS DIFFER BETWEEN STATES 
//For example the following line indicates that the variable named "month" has value "1" which is labeled "January", and value "2" which is labeled February. etc.
//Many of these are presently not implemented but could be depending on the quality of each locale's data
var monthLabels = ["January", "Febuary", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
var dayinweekLabels = ["January", "Febuary", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
var severityLabels = ["Fatality", "Incapacitating Injury", "Non-incapacitating injury", "Possible injury", "No injury"]
var injuryLabels = ["Fatal", "Serious", "Injured", "Possible", "None"] //rephrasing of above
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
//Show a stats box (requires manually preparing a stats data file called cde_stats.js as in Columbus example)
var showStats = 1

//MAP STYLE 
var circlePedStyle = {
    radius: 4,
    fillColor: "#800080",
    color: "#000",
    weight: 1,
    opacity: 1,
    fillOpacity: 0.8
};
var circleBikeStyle = {
    radius: 4,
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
}
var polyCommunityHighlightStyle = {
    color: "#0000EE",
    fillOpacity: 0.2,
    weight: 4,
    opacity: 1,
}
