import pandas as pd
import geopandas as gp
import matplotlib.pyplot as plt


# PURPOSE OF THIS SCRIPT
# A script like this may be needed to output GeoJSON for the community layer
# This example joins municipalities and neighborhoods in , Ohio


# CONFIG options
municipalities_input = (
    "util/nocommit/Palm_Municipal_Boundaries/Municipal_Boundaries.shp"
)
comms_file_output = "webapp/data/cde_comms.js"


# LOAD  boundary files
municipalities_gdf = gp.read_file(municipalities_input)
print("Districts file loaded")
print(municipalities_gdf.head())
print(municipalities_gdf.crs)


# RENAME column for displaying area name
municipalities_gdf["AREA_NAME"] = municipalities_gdf["MUNINAME"]


# SET to a local projection
output_gdf = municipalities_gdf.copy()
output_gdf["geometry"] = output_gdf["geometry"].to_crs(epsg=4326)


# DROP extraneous columns
keepArray = ["OBJECTID", "AREA_NAME", "geometry"]
output_gdf.drop(output_gdf.columns.difference(keepArray), 1, inplace=True)


# OUTPUT to JSON
geojson = output_gdf.to_json()
with open(comms_file_output, "w") as output_file:
    output_file.write("var CityComms = ")
    output_file.write(geojson + "\n")

# SHOW a map if needed for debugging
# fig, ax = plt.subplots()  # remove the axis
# output_gdf.plot(
#    ax=ax, linewidth=0, color="grey", edgecolor="w", zorder=5, alpha=1.0
# )
# plt.show()
