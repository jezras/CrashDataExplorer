# Crash Data Explorer

The goal of reducing or eliminating traffic fatalities and severe injuries in cities requires new and openly accessible tools that can be used and shared by community groups, agencies, and activists alike. Crash Data Explorer is an open source analysis and engagement tool for urban pedestrian and bike safety. It is a fast client-side javascript web application leveraging Leaflet, Chart.js, and CitySDK. Its main setup requirement is for traffic crash and boundary data to be converted into specified GeoJSON formats. Sample Python scripts which do this for Columbus Ohio’s crash data and geographies are provided with the source code.

## Data Requirements

To run an instance of Crash Data Explore you need to have access to crash data and the geographic boundaries of communities for your locality. For each of these, there are several variables that are required in order for Crash Data Explorer to be functional.

For your locality's crash dataset, the following variables are required for each crash:
* Year
* Severity
* Latitude
* Longitude

For your locality's communities dataset, the following variables are required for each community:
* Unique ID
* Area Name
* Polygon coordinates

If you don't have access to these sorts of datasets about your community, you may need to seek partnerships such as with a local university, and/or advocate for open data before you can create an instance of Crash Data Explorer. 

## Environment Requirements

### Web Application

As a client-side javascript application, the Crash Data Explorer web application located in *webapp/* has no requirements beyond basic web server funtionality.

### Utility Python Scripts

The Python scripts that are provided in *util/* as an example of how to convert data into a GeoJSON format, require a Python environment with GeoPandas installed. However, these Python scripts do not need to be loaded onto a server and can simply be run in a local Python enviroment such as through an IDE. 

## Installing the Columbus Ohio Example

The Columbus Ohio example simply needs to be provided with a Census API Key and uploaded to a webserver to complete setup. You should first edit *webapp/js/config.js* to add a valid US Census API key. Information on where to acquire the key is provided in the code comments. Then just upload all items in the *webapp/* folder to a webserver and you will see the fully-functional example when you load index.html in a webbrowser. 

## Creating a version for another locaity

The "heavy lift" of creating a Crash Data Explorer for a different locality is converting crash and community boundary data for your locality into the GeoJSON formats required by Crash Data Explorer. Because data differs between states or localities it is not possible to provide a universal script for converting data, however example scripts are provided for Columbus Ohio. Yet as such, some ability with Python and Geopandas is required. Ultimately, your data must be converted into the following three *.js* files to be located in *webapp/data/*, which each defining a GeoJSON object that is used by Crash Data Explorer.

* *cde_ped.js*: Contains GeoJSON points and properties for pedestrian crashes
* *cde_bike.js*: Contains GeoJSON points and properties for bike crashes
* *cde_comms.js*: Contains GeoJSON polygons of communities for comparisons
 
Your raw crash data is likely to be in a CSV format. The example script which is used for Columbus Ohio crash data is  *util/convertrawcrashdata_example.py*. The basic purpose of this file is to rename variables to those expected by Crash Data Explorer, and then to export the required two GeoJSON object files.

Your raw boundaries data is likely to be in shapefile format. The example script which is used for Columbus Ohio boundaries data is *util/mergecommunityboundaries_example.py*. It is expected that you will need to merge multiple shapefiles to allow for  inner-city neighborhoods and suburban municipalities to be compared, however this of course depends greatly on the political geography of your locality. The basic purpose of this file is  to merge two shapefiles, and then to export the required GeoJSON object.

After the three required data files are in place. The final step is to edit the *js/config.js* according to the comments in that code.

## Built With

* [Leaflet](https://github.com/Leaflet/Leaflet)
* [Leaflet Heat](https://github.com/Leaflet/Leaflet.heat)
* [Chart.js](https://www.chartjs.org/)
* [CitySDK](https://github.com/uscensusbureau/citysdk/)
* [GeoPandas](https://geopandas.org/)

## Authors

* **Jonathan Stiles** - *Initial work* - [Jezras](https://github.com/jezras/)

## License

This project is licensed under the GNU General Public License v3.0 - see the [LICENSE.md](LICENSE.md) file for details

## Acknowledgments

Crash Data Explorer is made possible in part thanks to the support and/or encouragement of the following:

* The Ohio State University
* The STEAM Factory
* The Center for Urban and Regional Analysis
* Smart Columbus
* The Ohio Department of Transportation
* The City of Columbus
* The Mid-Ohio Regional Planning Commision
