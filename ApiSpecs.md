# API specifications

[Based on](https://idratherbewriting.com/learnapidoc/docapis_resource_descriptions.html)

## Resource Descriptions
 ### Available Methods
 * The API to retreive tweets `/TweetAPI`:

|**method**|**path**|
  |------|-----|
  |  GET | `/TweetAPI/search` |

 * The endpoint to retreive radar data `/Radar`:

|**method**|**path**|
  |------|-----|
  |  GET | `/Radar/getCapabilities` |
  |  GET | `/Radar/raster` |
  |  GET | `/Radar/vector` |

* The API to handle status indicator communication `/status`:

|**method**|**path**|
  |------|-----|
  |  GET | `/status/currentprocesses` |
  |  POST| `/status/newprocess` |

## Endpoints and Methods


* #### GET `/TweetAPI/search`  
  Search the tweet-database for tweets containing certain strings in their text-field.  

  Allows to search for tweets that INCLUDE certain strings.  
  Allows to EXCLUDE tweets containing certain strings.  

  **Parameters**
  * `bbox` the geographical boundaries in which the tweets are located (WGS84)
  * `older_than` the minimum age of the tweets
  * `include` the string to be included  
  * `exclude` the string to be excluded  
  * `fields` specify which fields to return in the response JSON  
  * `latest` if TRUE, return only the latest tweet

* #### GET `/status/currentprocesses`
  Retreive information about current running processes on the server side  
  **Parameters**
  * `older_than` string, UNIX-timestamp indicating the maximum age of the processes
  * `remove` boolean, if false indicated processes won't be cleared after call

* #### POST `/status/newprocess`
  Allows a server component to tell the API what it is currently doing
  **Parameters**


<hr>

## Parameters
### Tweet-Search
#### Request

| **Name** | **Method** | **Description**|
|----------|------------|----------------|
|`tweetAPI/search`| GET |Search for tweets within a location, optionally containing strings

#### General Search Parameters

| **Name** | **Data Type** |**Required / Optional**| **Description**|
|----------|---------------|-----------------------|----------------|
|bbox|number array|required|bounding box of 2 coordinates in the WGS84 format, represented as an array of four numbers: `bbox={lat northwest corner},{lon northwest corner},{lat southeast corner},{lon southeast corner}`|
|older_than|number|optional|timestamp (in milliseconds) of the time the tweet's created_at is not allowed to fall below|
|include|string|optional|a string that is to be included in the returned tweets' texts.|
|exclude|string|optional|a string that is not to be contained within the returned tweets' texts.|
|fields|string array|optional|The fields that are to be included in the returned tweets' JSON. formatted as an array of strings: `fields=field1,field2,...,fieldN`|
|latest|Boolean|optional|If true, only the latest tweet that meets all the queries will be returned|

### status
#### Request
| **Name** | **Method** | **Description**|
|----------|------------|----------------|
|`statuses/currentprocesses`| GET |Get the list of processes that are currently in progress, according to the status-API|

#### General Search Parameters

| **Name** | **Data Type** |**Required / Optional**| **Description**|
|----------|---------------|-----------------------|----------------|
|older_than|number|optional|UNIX-timestamp (in milliseconds) minimum allowed age of the messages|
|remove|Boolean|optional|Whether or not to remove all statuses from the API after they were called. Defaults to TRUE if not used. |

#### Request
| **Name** | **Method** | **Description**|
|----------|------------|----------------|
|`statuses/newprocess`| POST |Post a status indicator message to the Status API|  

Requires the body to be composed in x-www-form-urlencoded!

| **Name** | **Data Type** |**Required / Optional**| **Description**|
|----------|---------------|-----------------------|----------------|
|created_at|number|required|UNIX-timestamp (in milliseconds) of the time the message was posted|
|message|String|required|The String containing the message part of the message. this will be displayed on site in the progress-indicator|  

<hr>

## examples

### GET `/tweetAPI/search`
#### request example
`
localhost:3000/tweetAPI/search?bbox=55.299,3.95,47.076,16.655
`

### response example
```JS
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
            "_id": "5e118e1eb99f07385c341b6d",
            "id_str": "1213721760446713856",
            "text": "#nowplaying #Dido ~ Dido | Here With Me ||| BB RADIO - In #Wittenberge #Brandenburg #GER auf 104.3— BB RADIO Playlist (@_BB_RADIO_MUSIC) January 5, 2020",
            "created_at": 1578208792000,
            "embeddedTweet": "<blockquote class=\"twitter-tweet\"><p lang=\"en\" dir=\"ltr\"><a href=\"https://twitter.com/hashtag/nowplaying?src=hash&amp;ref_src=twsrc%5Etfw\">#nowplaying</a> <a href=\"https://twitter.com/hashtag/Dido?src=hash&amp;ref_src=twsrc%5Etfw\">#Dido</a> ~ Dido | Here With Me ||| BB RADIO - In <a href=\"https://twitter.com/hashtag/Wittenberge?src=hash&amp;ref_src=twsrc%5Etfw\">#Wittenberge</a> <a href=\"https://twitter.com/hashtag/Brandenburg?src=hash&amp;ref_src=twsrc%5Etfw\">#Brandenburg</a> <a href=\"https://twitter.com/hashtag/GER?src=hash&amp;ref_src=twsrc%5Etfw\">#GER</a> auf 104.3</p>&mdash; BB RADIO Playlist (@_BB_RADIO_MUSIC) <a href=\"https://twitter.com/_BB_RADIO_MUSIC/status/1213721760446713856?ref_src=twsrc%5Etfw\">January 5, 2020</a></blockquote>\n<script async src=\"https://platform.twitter.com/widgets.js\" charset=\"utf-8\"></script>\n",
            "__v": 0
        }
    ]
}
```

#### request example
`
localhost:3000/tweetAPI/search?bbox=-180,85,180,-85&fields=text,id,created_at&include=is`

### response example
```JS
{
    "tweets": [
        {
            "text": "where is everybody?",
            "id": 1192915062618184700,
            "created_at": "Fri Nov 08 21:21:28 +0000 2019"
        },
        {
            "text": "There is no reason for me to be here",
            "id": 1192915062846207200,
            "created_at": "Fri Nov 08 21:21:28 +0000 2019"
        }
    ]
}
```

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
