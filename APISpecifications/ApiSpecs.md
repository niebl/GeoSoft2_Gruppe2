# API specifications

[Based on](https://idratherbewriting.com/learnapidoc/docapis_resource_descriptions.html)

## Resource Descriptions
 ### Available Methods


## Endpoints and Methods

* #### GET `/radar/getCapabilities`
  returns the capabilities of Radar API


<hr>

## Parameters

### __end-point: weather__
#### Request

| **Name** | **Method** | **Description**|
|----------|------------|----------------|
|`weather/warnings`| GET |Search for|

#### General Search Parameters

| **Name** | **Data Type** |**Required / Optional**| **Description**|
|----------|---------------|-----------------------|----------------|
|bbox|number array|optional|bounding box of 2 coordinates in the WGS84 format, represented as an array of four numbers: `bbox={lat northwest corner},{lon northwest corner},{lat southeast corner},{lon southeast corner}`|
|events|string array|optional|The types of events to look for. for types of events, refer to <a href="https://www.dwd.de/DE/leistungen/opendata/help/warnungen/cap_dwd_profile_de_pdf.pdf?__blob=publicationFile&v=2">DWD documentation</a> chapter 3.1.1|

<hr>

## examples

### GET `/status/currentprocesses`
#### request example
`
localhost:3000/status/currentprocesses?remove=true&older_than=0
`

### response example
```JS
[
    {
        "_id": "5e11adf3af423d42300e8519",
        "created_at": 1578215915,
        "message": "this is a message",
        "__v": 0
    }
]
```
