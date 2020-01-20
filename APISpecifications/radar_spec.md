# API specifications `radar`

[Based on](https://idratherbewriting.com/learnapidoc/docapis_resource_descriptions.html)

## Resource Descriptions
 ### Available Methods

 * The API to handle status indicator communication `/radar`:

|**method**|**path**|
 |------|-----|
 |  GET | `/radar/getCapabilities` |
 |  GET | `/radar/rainShapes` |

<hr>

## Endpoints and Methods

* #### GET `/radar/getCapabilities`
   returns the capabilities of Radar API

* #### GET `/weather/warnings`
 returns shapes of German districts that have issued warnings of weather against them by the DWD.
 **Parameters**
 * `bbox` the geographical boundaries with which the resulting district borders can overlap. (WGS84)
 * `events` list of types of events to include in the results.

<hr>

## Parameters

### __end-point: radar__
#### Request
| **Name** | **Method** | **Description**|
|----------|------------|----------------|
|`radar/getCapabilities`| GET |get the capabilities of the Radar API|

#### General Search Parameters

| **Name** | **Data Type** |**Required / Optional**| **Description**|
|----------|---------------|-----------------------|----------------|
|||||

#### Request

| **Name** | **Method** | **Description**|
|----------|------------|----------------|
|TODO|TODO|TODO|

#### General Search Parameters

| **Name** | **Data Type** |**Required / Optional**| **Description**|
|----------|---------------|-----------------------|----------------|
|||||

<hr>
