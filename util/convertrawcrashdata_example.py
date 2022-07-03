import pandas as pd
import json


# PURPOSE OF THIS SCRIPT
# A script like this needs to be created for each state or county
# This example coverts Ohio formated crash data for use with Crash Data Explorer


# CONFIG options and inputs
# Name of a file downloaded from Ohio GCATS (the online source for Ohio's crash data)
# file_input = "util/nocommit/gcatResult_dataCuyahoga20152019.csv"
file_input = "util/nocommit/GCAT_AllOhioPedBike_2016_2021.csv"
# Name of file to create as output
ped_file_output = "webapp/data/cde_ped.js"
bike_file_output = "webapp/data/cde_bike.js"
# Name of js variable that contains JSON
ped_js_variable = "PedCrashes"
bike_js_variable = "BikeCrashes"


# DFEFINE functions
# 1: Assemble a rough road name from multiple columns
def getRoadName(row):
    roadField1 = row["ODPS_LOC_ROAD_NME"]
    roadField2 = row["ODPS_LOC_ROAD_SUFFIX_CD"]
    roadField3 = row["ODPS_LOC_ROUTE_PREFIX_CD"]
    roadField4 = row["ODPS_LOC_ROUTE_ID"]
    roadField5 = row["ODPS_LOC_ROUTE_SUFFIX_CD"]
    road = (
        str(roadField1).replace("nan", "")
        + " "
        + str(roadField2).replace("nan", "")
        + " "
        + str(roadField3).replace("nan", "")
        + " "
        + str(roadField4).replace("nan", "")
        + " "
        + str(roadField5).replace("nan", "")
    )
    return road.strip()


def pd_to_geojson(df, properties, lat="latitude", lon="longitude"):
    geojson = {"type": "FeatureCollection", "features": []}
    for _, row in df.iterrows():
        feature = {
            "type": "Feature",
            "properties": {},
            "geometry": {"type": "Point", "coordinates": []},
        }
        feature["geometry"]["coordinates"] = [row[lon], row[lat]]
        for prop in properties:
            feature["properties"][prop] = row[prop]
        geojson["features"].append(feature)
    return geojson


# LOAD original crashes file
originals_pd = pd.read_csv(file_input, sep=",")
print("Original data file loaded")
print(originals_pd.head())


# FILTER by county or otherwise if needed
# originals_pd = originals_pd.loc[(originals_pd["NLF_COUNTY_CD"] == "FRA")]


# RENAME the columns that we will use that don't need changes
originals_pd.rename(columns={"CRASH_TYPE_CD": "crashtype"}, inplace=True)
originals_pd.rename(columns={"CRASH_YR": "year"}, inplace=True)
originals_pd.rename(columns={"ODOT_LATITUDE_NBR": "latitude"}, inplace=True)
originals_pd.rename(columns={"ODOT_LONGITUDE_NBR": "longitude"}, inplace=True)
originals_pd.rename(columns={"CRASH_SEVERITY_CD": "severity"}, inplace=True)
originals_pd.rename(columns={"DAY_IN_WEEK_CD": "dayinweek"}, inplace=True)
originals_pd.rename(columns={"HOUR_OF_CRASH": "hour"}, inplace=True)
originals_pd.rename(columns={"MONTH_OF_CRASH": "month"}, inplace=True)
originals_pd["ODOT_LANES_NBR"] = (
    originals_pd["ODOT_LANES_NBR"].fillna(0).astype(int).astype(str)
)
originals_pd.loc[(originals_pd["ODOT_LANES_NBR"] == "0")] = ""
originals_pd.rename(columns={"ODOT_LANES_NBR": "lanes"}, inplace=True)


# PROCESS more complex variables
originals_pd["road"] = originals_pd.apply(getRoadName, axis=1)


# OUTPUT the columns we need as a JSON js file
originals_pd = originals_pd.loc[(originals_pd["OBJECTID"] != "")]
originals_pd["OBJECTID"] = originals_pd["OBJECTID"].astype(int)
originals_pd["year"] = originals_pd["year"].astype(int)
originals_pd["month"] = originals_pd["month"].astype(int)
originals_pd["dayinweek"] = originals_pd["dayinweek"].astype(int)
originals_pd["hour"] = originals_pd["hour"].astype(int)
originals_pd["severity"] = originals_pd["severity"].astype(int)
keepArray = [
    "OBJECTID",
    "year",
    "month",
    "dayinweek",
    "hour",
    "road",
    "lanes",
    "latitude",
    "longitude",
    "severity",
]

originals_pd = originals_pd.dropna(subset=["latitude", "longitude"])


# BIKE OUTPUT TO JSON
geojson = pd_to_geojson(originals_pd[originals_pd["crashtype"] == 11], keepArray)
with open(bike_file_output, "w") as output_file:
    output_file.write("var " + bike_js_variable + " = ")
    json.dump(geojson, output_file, indent=2)
# PED OUTPUT TO JSON
geojson = pd_to_geojson(originals_pd[originals_pd["crashtype"] == 8], keepArray)
with open(ped_file_output, "w") as output_file:
    output_file.write("var " + ped_js_variable + " = ")
    json.dump(geojson, output_file, indent=2)
print("File output successful")