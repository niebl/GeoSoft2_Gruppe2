# API specifications `weather`

specification formatting based on [idratherbewriting.com/learnapidoc/docapis_resource_descriptions.html](https://idratherbewriting.com/learnapidoc/docapis_resource_descriptions.html)

The specification of the API that serves the cached data on weather warnings for German districts (Kreise), that are provided by the DWD.

## Resource Descriptions
 ### Available Methods



 * The API to handle status indicator communication `/weather`:

|**method**|**path**|
 |------|-----|
 |  GET | `/weather` |


 ### Endpoints

* #### GET `/weather`
 returns shapes of German districts that have issued warnings of weather against them by the DWD.
 **Parameters**
 * `bbox` the geographical boundaries with which the resulting district borders can overlap. (WGS84)
 * `events` list of types of events to to filter results for. AND-relation.


## Parameters

### __end-point: weather__
#### Request

| **Name** | **Method** | **Description**|
|----------|------------|----------------|
|`/weather`| GET |retrieve the geojson of weather warnings for German districts|

#### General Search Parameters

| **Name** | **Data Type** |**Required / Optional**| **Description**|
|----------|---------------|-----------------------|----------------|
|bbox|number array|optional|bounding box of 2 coordinates in the WGS84 format, represented as an array of four numbers: `bbox={lat northwest corner},{lon northwest corner},{lat southeast corner},{lon southeast corner}`|
|events|string array|optional|The types of events to look for. AND-relation. for types of events, refer to <a href="https://www.dwd.de/DE/leistungen/opendata/help/warnungen/cap_dwd_profile_de_pdf.pdf?__blob=publicationFile&v=2">DWD documentation</a> chapter 3.1.1|

<hr>

## examples

### GET `/weather`
#### request example
`
localhost:3000/weather?events=FROST
`

### response example
response type: JSON
```JS
Status: 200 OK

[
  {
      "properties": {
          "EVENT": [
              "FROST"
          ],
          "AREADESC": "Kreis Unterallgäu",
          "URGENCY": "Immediate",
          "SENT": "2020-01-15Z",
          "ONSET": "2020-01-15T20:00:00Z",
          "HEADLINE": "Amtliche WARNUNG vor FROST",
          "DESCRIPTION": "Es tritt leichter Frost zwischen 0 °C und -4 °C auf.",
          "PARAMETERNAME": "Lufttemperatur",
          "PARAMETERVALUE": "0 bis -4 [°C]"
      },
      "geometry": {
          "coordinates": [
              [
                  [
                      [
                          10.1561,
                          47.9893
                      ],
          [ ... ]
                      [
                          10.2961,
                          48.2225
                      ]
                  ]
              ]
          ],
          "type": "MultiPolygon"
      },
      "bbox": [
          10.077,
          47.8201,
          10.7074,
          48.2296
      ],
      "type": "Feature",
      "id": "Warnungen_Landkreise.fid--1cfd208f_16fa9819749_-484"
  },

  [ ... ]

]
```
