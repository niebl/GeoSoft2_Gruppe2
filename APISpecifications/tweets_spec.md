# API specifications `tweets`

specification formatting based on [idratherbewriting.com/learnapidoc/docapis_resource_descriptions.html](https://idratherbewriting.com/learnapidoc/docapis_resource_descriptions.html)

This Endpoint serves information of the tweets that are cached from the API that is served by twitter.com, as well as the html data of the embedded tweets that is provided by their Oembed-API.


## Resource Descriptions
  ### Available Methods
  * The API to retrieve tweets `/tweets`:

|**method**|**path**|
  |------|-----|
  |  GET | `/tweets` |


 ### Endpoints

* #### GET `/tweets`  
  Search the tweet-database for tweets containing certain strings in their text-field.  

  Allows to search for tweets that INCLUDE certain strings.  
  Allows to EXCLUDE tweets containing certain strings.  

  **Parameters**

  these filters are used on the searched data in the listed order.
  * `bbox` the geographical boundaries in which the tweets are located (WGS84).
  * `older_than` the minimum age of the tweets returned, UNIX-timestamp. *returned tweets will be older than given UNIX-timestamp. defaults to 0*
  * `include` the string to be included. *tweet is returned if it contains substring1 OR substring2*  
  * `exclude` the string to be excluded. *tweet is excluded if it contains substring1 OR substring2*
  * `latest` if TRUE, return only the latest tweet. *defaults to false*
  * `fields` specify which fields to return in the response JSON.  

* #### DELETE `/tweets`  
  Delete tweets with a given ID from the database

  **Parameters**

  * `id_str` the id string of the tweets to delete. if not given, all cached tweets are deleted.


## Parameters
### __end-point: Tweet-Search__
#### Request

| **Name** | **Method** | **Description**|
|----------|------------|----------------|
|`/tweets`| GET |Search for tweets within a location, optionally containing strings

#### General Search Parameters

| **Name** | **Data Type** |**Required / Optional**| **Description**|
|----------|---------------|-----------------------|----------------|
|bbox|number array|required|bounding box of 2 coordinates in the WGS84 format, represented as an array of four numbers: `bbox={lat northwest corner},{lon northwest corner},{lat southeast corner},{lon southeast corner}`|
|older_than|number|optional|UNIX-timestamp (in milliseconds) of the time the tweet's created_at is not allowed to fall below. defaults to 0 if none was given|
|include|string|optional|a string that is to be included in the returned tweets' texts. A tweet is returned if it contains substring1 OR substring2|
|exclude|string|optional|a string that is not to be contained within the returned tweets' texts. A tweet is excluded if it contains substring1 OR substring2|
|latest|Boolean|optional|If true, only the latest tweet that meets all the queries will be returned. defaults to false|
|fields|string array|optional|The fields that are to be included in the returned tweets' JSON. formatted as an array of strings: `fields=field1,field2,...,fieldN`|

#### Request

| **Name** | **Method** | **Description**|
|----------|------------|----------------|
|`/tweets`| DELETE |Delete tweets with a given id_str

#### General Search Parameters

| **Name** | **Data Type** |**Required / Optional**| **Description**|
|----------|---------------|-----------------------|----------------|
|id_str|string array|optional|array of one or more tweet-ids, separated by comma: `id_str={tweet1}` or `id_str={tweet1},{tweet2},...,{tweetN}`. if not given, all tweets are deleted|

<hr>

## examples

### GET `/tweets`
#### request example
`
localhost:3000/tweets?bbox=55.299,3.95,47.076,16.655
`

### response example
response type: JSON
```JS
Status: 200 OK
{
    "tweets": [
        {
            "geojson": {
                "geometry": {
                    "coordinates": [
                        13.1199934,
                        52.381905
                    ],
                    "type": "Point"
                },
                "type": "Feature"
            },
            "id_str": "1213721760446713856",
            "text": "#nowplaying #Dido ~ Dido | Here With Me ||| BB RADIO - In #Wittenberge #Brandenburg #GER auf 104.3— BB RADIO Playlist (@_BB_RADIO_MUSIC) January 5, 2020",
            "created_at": 1578208792000,
            "embeddedTweet": "<blockquote class=\"twitter-tweet\"><p lang=\"en\" dir=\"ltr\"><a href=\"https://twitter.com/hashtag/nowplaying?src=hash&amp;ref_src=twsrc%5Etfw\">#nowplaying</a> <a href=\"https://twitter.com/hashtag/Dido?src=hash&amp;ref_src=twsrc%5Etfw\">#Dido</a> ~ Dido | Here With Me ||| BB RADIO - In <a href=\"https://twitter.com/hashtag/Wittenberge?src=hash&amp;ref_src=twsrc%5Etfw\">#Wittenberge</a> <a href=\"https://twitter.com/hashtag/Brandenburg?src=hash&amp;ref_src=twsrc%5Etfw\">#Brandenburg</a> <a href=\"https://twitter.com/hashtag/GER?src=hash&amp;ref_src=twsrc%5Etfw\">#GER</a> auf 104.3</p>&mdash; BB RADIO Playlist (@_BB_RADIO_MUSIC) <a href=\"https://twitter.com/_BB_RADIO_MUSIC/status/1213721760446713856?ref_src=twsrc%5Etfw\">January 5, 2020</a></blockquote>\n<script async src=\"https://platform.twitter.com/widgets.js\" charset=\"utf-8\"></script>\n"
        }
    ]
}
```

#### request example
`
localhost:3000/tweets?bbox=-180,85,180,-85&fields=text,id,created_at&include=is`

### response example
```JS
Status: 200 OK

{
    "tweets": [
        {
            "text": "where is everybody?",
            "id_str": "1192915062618184700",
            "created_at": "Fri Nov 08 21:21:28 +0000 2019"
        },
        {
            "text": "There is no reason for me to be here",
            "id_str": "1192915062846207200",
            "created_at": "Fri Nov 08 21:21:28 +0000 2019"
        }
    ]
}
```

### DELETE `/tweets`
#### request example
`localhost:3000/tweets?id_str=1222061888596512768`


### response example
```
Status: 200 OK

tweets deleted from cache
```
