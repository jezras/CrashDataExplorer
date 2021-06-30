import pandas as pd
import geopandas as gp
import requests
import json
from shapely.geometry import Point
from geopandas import GeoDataFrame
import matplotlib.pyplot as plt

# PURPOSE OF THIS SCRIPT
# A script like this needs to be created for each state or county
# This example coverts Ohio formated crash data for use with Crash Data Explorer

# CONFIG options and inputs
# Name of a file downloaded from Ohio GCATS (the online source for Ohio's crash data)
file_input = "util/nocommit/gcatResult_dataFranklin.csv"
# Name of file to create as output
ped_file_output = "webapp/data/cde_ped_data.js"
bike_file_output = "webapp/data/cde_bike_data.js"
# Name of js variable that contains JSON
ped_js_variable = "PedCrashes"
bike_js_variable = "BikeCrashes"

# DFEFINE functions
# 1: Assemble a rough road name from multiple columns


def getRoadName(row):
    roadField1 = row['ODPS_LOC_ROAD_NME']
    roadField2 = row['ODPS_LOC_ROAD_SUFFIX_CD']
    roadField3 = row['ODPS_LOC_ROUTE_PREFIX_CD']
    roadField4 = row['ODPS_LOC_ROUTE_ID']
    roadField5 = row['ODPS_LOC_ROUTE_SUFFIX_CD']
    # road = replaceNan(str(roadField1)) + ' ' + replaceNan(str(roadField2)) + ' ' + \
    #    replaceNan(str(roadField3)) + ' ' + replaceNan(str(roadField4)) + ' ' + \
    #    replaceNan(str(roadField5))
    road = str(roadField1).replace('nan', '') + ' ' + str(roadField2).replace('nan', '') + ' ' + \
        str(roadField3).replace('nan', '') + ' ' + str(roadField4).replace('nan',
                                                                           '') + ' ' + str(roadField5).replace('nan', '')
    return road.strip()


def isInfluenced(row):
    infField1 = row['U1_IS_ALCOHOL_SUSPECTED']
    infField2 = row['U1_IS_MARIJUANA_SUSPECTED']
    infField3 = row['U1_IS_OTHER_DRUG_SUSPECTED']
    if str(infField1) == 'Y' or str(infField2) == 'Y' or str(infField3) == 'Y':
        return 1
    else:
        return 0


def isPedBlame(row):
    blameField1 = row['unit1blamed']
    blameField2 = row['unit1ispedbike']
    if int(blameField1) == 1 and int(blameField2) == 1:
        return 1
    else:
        return 0


def isBlamed(row):
    blameField1 = row['U1_AT_FAULT_IND']
    if str(blameField1) == 'Y':
        return 1
    else:
        return 0


def isUPedBike(row, which):
    pbField1 = row['unit'+which+'type']
    try:
        pbField1_int = int(pbField1)
        if pbField1_int == 23 or pbField1_int == 24 or pbField1_int == 25 or pbField1_int == 26:
            return 1
        else:
            return 0
    except ValueError:
        return 0


def makeBinary(row, which):
    bnField1 = row[which]
    try:
        bnField1_str = str(bnField1)
        if bnField1_str == 'Y':
            return 1
        else:
            return 0
    except ValueError:
        return 0


def pd_to_geojson(df, properties, lat='latitude', lon='longitude'):
    geojson = {'type': 'FeatureCollection', 'features': []}
    for _, row in df.iterrows():
        feature = {'type': 'Feature',
                   'properties': {},
                   'geometry': {'type': 'Point',
                                'coordinates': []}}
        feature['geometry']['coordinates'] = [row[lon], row[lat]]
        for prop in properties:
            feature['properties'][prop] = row[prop]
        geojson['features'].append(feature)
    return geojson


# LOAD original crashes file
originals_pd = pd.read_csv(file_input, sep=",")
print("Original data file loaded")
print(originals_pd.head())

# RENAME the columns that we will use that don't need changes
originals_pd.rename(columns={'CRASH_YR': 'year'}, inplace=True)
originals_pd.rename(columns={'ODOT_LATITUDE_NBR': 'latitude'}, inplace=True)
originals_pd.rename(columns={'ODOT_LONGITUDE_NBR': 'longitude'}, inplace=True)
originals_pd.rename(columns={'CRASH_SEVERITY_CD': 'severity'}, inplace=True)
originals_pd.rename(columns={'CRASH_TYPE_CD': 'crashtype'}, inplace=True)
originals_pd.rename(columns={'DAY_IN_WEEK_CD': 'dayinweek'}, inplace=True)
originals_pd.rename(columns={'FACILITY_TYPE_CD': 'facility'}, inplace=True)
originals_pd.rename(columns={'HOUR_OF_CRASH': 'hour'}, inplace=True)
originals_pd.rename(
    columns={'INCAPAC_INJURIES_NBR': 'injuredyes'}, inplace=True)
originals_pd.rename(
    columns={'LIGHT_COND_PRIMARY_CD': 'lightingcondition'}, inplace=True)
originals_pd.rename(columns={'MONTH_OF_CRASH': 'month'}, inplace=True)
originals_pd.rename(
    columns={'NO_INJURY_REPORTED_NBR': 'notinjured'}, inplace=True)
originals_pd.rename(columns={'NUMBER_OF_UNITS_NBR': 'units'}, inplace=True)
originals_pd.rename(
    columns={'ODOT_CITY_VILLAGE_TWP_NME': 'municipality'}, inplace=True)
originals_pd.rename(
    columns={'ODOT_CRASH_LOCATION_CD': 'location'}, inplace=True)
originals_pd.rename(columns={'ODOT_LANES_NBR': 'lanes'}, inplace=True)
originals_pd.rename(
    columns={'ODPS_TOTAL_FATALITIES_NBR': 'fatalities'}, inplace=True)
originals_pd.rename(
    columns={'POSSIBLE_INJURIES_NBR': 'injuredmaybe'}, inplace=True)
originals_pd.rename(
    columns={'ROAD_COND_PRIMARY_CD': 'roadcondition'}, inplace=True)
originals_pd.rename(
    columns={'WEATHER_COND_CD': 'weathercondition'}, inplace=True)
originals_pd.rename(columns={'U1_TYPE_OF_UNIT_CD': 'unit1type'}, inplace=True)
originals_pd.rename(columns={'U2_TYPE_OF_UNIT_CD': 'unit2type'}, inplace=True)
originals_pd.rename(columns={'U3_TYPE_OF_UNIT_CD': 'unit3type'}, inplace=True)
originals_pd.rename(columns={'U1_AGE_NBR': 'unit1age'}, inplace=True)
originals_pd.rename(columns={'U2_AGE_NBR': 'unit2age'}, inplace=True)
originals_pd.rename(columns={'U1_GENDER_CD': 'unit1gender'}, inplace=True)
originals_pd.rename(columns={'U2_GENDER_CD': 'unit2gender'}, inplace=True)
originals_pd.rename(
    columns={'U1_UNIT_SPEED_NBR': 'unit1speedreported'}, inplace=True)
originals_pd.rename(
    columns={'U1_POSTED_SPEED_NBR': 'unit1speedposted'}, inplace=True)
originals_pd.rename(
    columns={'U2_UNIT_SPEED_NBR': 'unit2speedreported'}, inplace=True)
originals_pd.rename(
    columns={'U2_POSTED_SPEED_NBR': 'unit2speedposted'}, inplace=True)
originals_pd.rename(
    columns={'U1_TRAFFIC_CONTROL_CD': 'unit1trafficcontrol'}, inplace=True)
originals_pd.rename(
    columns={'U2_TRAFFIC_CONTROL_CD': 'unit2trafficcontrol'}, inplace=True)

# PROCESS more complex variables
originals_pd['youngdriver'] = originals_pd.apply(
    makeBinary, which='ODOT_YOUNG_DRIVER_IND', axis=1)
originals_pd['alchohol'] = originals_pd.apply(
    makeBinary, which='ODPS_ALCOHOL_IND', axis=1)
originals_pd['drugs'] = originals_pd.apply(
    makeBinary, which='ODPS_DRUG_IND', axis=1)
originals_pd['distracted'] = originals_pd.apply(
    makeBinary, which='DISTRACTED_DRIVER_IND', axis=1)
originals_pd['schoolzone'] = originals_pd.apply(
    makeBinary, which='ODPS_SCHOOL_ZONE_IND', axis=1)
originals_pd['senior'] = originals_pd.apply(
    makeBinary, which='ODPS_SENIOR_DRIVER_IND', axis=1)
originals_pd['speeding'] = originals_pd.apply(
    makeBinary, which='ODPS_SPEED_IND', axis=1)
originals_pd['road'] = originals_pd.apply(getRoadName, axis=1)
originals_pd['unit1influenced'] = originals_pd.apply(isInfluenced, axis=1)
originals_pd['unit1blamed'] = originals_pd.apply(isBlamed, axis=1)
originals_pd['unit1ispedbike'] = originals_pd.apply(
    isUPedBike, which='1', axis=1)
originals_pd['unit2ispedbike'] = originals_pd.apply(
    isUPedBike, which='2', axis=1)
originals_pd['unit3ispedbike'] = originals_pd.apply(
    isUPedBike, which='3', axis=1)

# OUTPUT the columns we need as a JSON js file
keepArray = ['OBJECTID', 'year', 'month', 'dayinweek', 'hour', 'latitude', 'longitude', 'severity', 'notinjured', 'injuredmaybe', 'injuredyes', 'fatalities', 'crashtype', 'units', 'lightingcondition', 'road', 'municipality', 'lanes', 'youngdriver', 'alchohol', 'drugs', 'distracted', 'schoolzone', 'senior', 'speeding', 'roadcondition',
             'weathercondition', 'unit1type', 'unit1ispedbike', 'unit1age', 'unit1gender', 'unit1speedreported', 'unit1speedposted', 'unit1trafficcontrol', 'unit1influenced', 'unit1blamed', 'unit2type', 'unit2ispedbike', 'unit2age', 'unit2gender', 'unit2speedreported', 'unit2speedposted', 'unit2trafficcontrol', 'unit3type', 'unit3ispedbike']


# BIKE OUTPUT
geojson = pd_to_geojson(
    originals_pd[originals_pd["crashtype"] == 11], keepArray)
with open(bike_file_output, 'w') as output_file:
    output_file.write('var '+bike_js_variable+' = ')
    json.dump(geojson, output_file, indent=2)
# PED OUTPUT
geojson = pd_to_geojson(
    originals_pd[originals_pd["crashtype"] == 8], keepArray)
with open(ped_file_output, 'w') as output_file:
    output_file.write('var '+ped_js_variable+' = ')
    json.dump(geojson, output_file, indent=2)
print("File output successful")

# OUTPUT csv file if needed for checking
# count.to_csv("util/output.csv", index=False)