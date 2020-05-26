//CONFIG VARIABLES
//Locale Information
//Note: for SEO purposes you may want to also have these hardcoded in the HTML
var localeShortName = "CBUS"
var localeLongName = "Columbus Ohio"
//Census API Key 
var censusAccessToken = 'ab863b6fc96a6443ccc41bd1dfda2694ace723ff';
var censusAcsYear = "2018"
//Display tabular data (requires running python script to generate)
//Set where to center the map - Default is Columbus, Ohio
var centerLat = 39.970351
var centerLong = -82.998482
//Possible range of values for the year and severity variables (depends on your data)
var years = [2015, 2019]
var severity = [1, 5]
//Show a stats box (requires manually preparing a stats data file called cde_stats.js)
var showStats = 1
//YOU WILL LIKELY NEED TO CONFIGURE SOME OF THESE DATA LABELS TO SUIT YOUR DATA AS STANDARDS DIFFER BETWEEN STATES 
//For example the following line indicates that the variable named "month" has value "1" which is labeled "January", and value "2" which is labeled February. etc.
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

//YOU MAY WISH TO CONFIGURE THESE MAP FEATURE STYLES 
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
