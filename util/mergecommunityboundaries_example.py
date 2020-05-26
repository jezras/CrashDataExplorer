import pandas as pd
import geopandas as gp
import requests
import json
from shapely.geometry import Point
from geopandas import GeoDataFrame

# PURPOSE OF THIS SCRIPT
# A script like this may be needed to join shapefiles and output GeoJSON for the community layer
# This example joins municipalities and neighborhoods in Cleveland, Ohio

# CONFIG options
municipalities_input = "util/shapefiles/Municipalities_WGS84_-_Tiled.shp"
neighborhoods_input = "util/shapefiles/City_of_Cleveland_Neighborhoods_2012_no_lake.shp"
comms_file_output = "webapp/data/cde_comms.json"

# LOAD  boundary files
municipalities_gdf = gp.read_file(municipalities_input)
print("Municipalities file loaded")
print(municipalities_gdf.head())
print(municipalities_gdf.crs)

neighborhoods_gdf = gp.read_file(neighborhoods_input)
print("Neighborhoods file loaded")
print(neighborhoods_gdf.head())
print(neighborhoods_gdf.crs)

# REMOVE the municipality for which we have neighborhoods
indexNames = municipalities_gdf[municipalities_gdf['MUNI_NAME']
                                == 'Cleveland'].index
municipalities_gdf.drop(indexNames, inplace=True)

# RENAME columns so that we have an "AREA_NAME" and unique "OBJECTID" for each
municipalities_gdf.rename(
    columns={'MUNI_NAME': 'AREA_NAME'}, inplace=True)
neighborhoods_gdf.rename(
    columns={'SPA_NAME': 'AREA_NAME'}, inplace=True)
neighborhoods_gdf['OBJECTID'] = neighborhoods_gdf.index + 101

# SET to a common projection
municipalities_gdf_proj = municipalities_gdf.copy()
neighborhoods_gdf_proj = neighborhoods_gdf.copy()
municipalities_gdf_proj['geometry'] = municipalities_gdf['geometry'].to_crs(
    epsg=4326)
neighborhoods_gdf_proj['geometry'] = neighborhoods_gdf['geometry'].to_crs(
    epsg=4326)

# JOIN
joined_gdf_proj = municipalities_gdf_proj.merge(
    neighborhoods_gdf_proj, on=['OBJECTID', "AREA_NAME", "geometry"], how="outer")

# DROP extraneous columns
keepArray = ['OBJECTID', 'AREA_NAME', 'geometry']
joined_gdf_proj.drop(
    joined_gdf_proj.columns.difference(keepArray), 1, inplace=True)

# EXPORT
# IMPORTANT NOTE: After processing you MUST manually change this file extension to ".js"
# and add  "var CityComms = " as the first characters for the file to work with Crash Data Explorer
joined_gdf_proj.to_file(comms_file_output, driver="GeoJSON")

# OUTPUT csv file if needed for checking
#joined_gdf_proj.to_csv("util/output.csv", index=False)
