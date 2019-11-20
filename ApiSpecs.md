# API specifications

[Based on](https://idratherbewriting.com/learnapidoc/docapis_resource_descriptions.html)

## Resource Descriptions
 ### Available Methods
 * The API to retreive tweets `/TweetAPI`  
    accesses the tweetdb resource  

|**method**|**path**|
  |------|-----|
  |  GET | `/TweetAPI/search` |

 * The endpoint to retreive radar data `/Radar`  
    accesses the geoserver resource   

|**method**|**path**|
  |------|-----|
  |  GET | `/Radar/getCapabilities` |
  |  GET | `/Radar/raster` |
  |  GET | `/Radar/vector` |

 * The database containing the tweets `/tweetDB`  
 * The WMS and WFS source `/Geoserver`

## Endpoints and Methods


* #### GET `/TweetAPI/search`  
  Search the tweet-database for tweets containing certain strings in their text-field.  

  Allows to search for tweets that INCLUDE certain strings.  
  Allows to EXCLUDE tweets containing certain strings.  

  **Parameters**
  * `bbox` the geographical boundaries in which the tweets are located (WGS84)  
  * `include` the string to be included  
  * `exclude` the string to be excluded  
  * `fields` specify which fields to return in the response JSON  
  * `latest` if TRUE, return only the latest tweet


  <hr>

* #### GET `/TweetAPI/search`  
  Search the tweet-database for tweets containing certain strings in their text-field.  

  Allows to search for tweets that INCLUDE certain strings.  
  Allows to EXCLUDE tweets containing certain strings.  

  **Parameters**  
  * `include` the string to be included  
  * `exclude` the string to be excluded  


  <hr>

* #### POST `/TweetAPI`
  Add a Tweet to the database  
  To be used by the server to add tweet data it downloaded


  <hr>

* #### DELETE `/TweetAPI`  
  Add a Tweet to the database  
  To be used by the server to add tweet data it downloaded  

  **Parameters**  
  * `TweetID` the ID of the tweet to be deleted  



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
|include|string|optional|a string that is to be included in the returned tweets' texts.|
|exclude|string|optional|a string that is not to be contained within the returned tweets' texts.|
|fields|string array|optional|The fields that are to be included in the returned tweets' JSON. formatted as an array of strings: `fields=field1,field2,...,fieldN`|
|latest|Boolean|optional|If true, only the latest tweet that meets all the queries will be returned|

<hr>

## examples

### GET `/tweetAPI/search`
#### request example
```
localhost:3000/tweetAPI/search?bbox=-180,85,180,-85```

### response example
```JS
{
    "tweets": [
        {
            "created_at": "Fri Nov 08 21:21:28 +0000 2019",
            "id": 1192915062618542000,
            "id_str": "1192915062618542082",
            "text": "Wallahiii daga Facebook yakeee https://t.co/hEU596jxnJ",
            "truncated": false,
            "entities": {
                "hashtags": [],
                "symbols": [],
                "user_mentions": [],
                "urls": [
                    {
                        "url": "https://t.co/hEU596jxnJ",
                        "expanded_url": "https://twitter.com/Ahmadmilo1/status/1192914432738897920",
                        "display_url": "twitter.com/Ahmadmilo1/staxe2x80xa6",
                        "indices": [
                            31,
                            54
                        ]
                    }
                ]
            },
            "metadata": {
                "iso_language_code": "tl",
                "result_type": "recent"
            },
            "source": "<a href='http://twitter.com/download/android' rel='nofollow'>Twitter for Android</a>",
            "in_reply_to_status_id": null,
            "in_reply_to_status_id_str": null,
            "in_reply_to_user_id": null,
            "in_reply_to_user_id_str": null,
            "in_reply_to_screen_name": null,
            "user": {
                "id": 1338381398,
                "id_str": "1338381398",
                "name": "VARxf0x9fx91xa8xf0x9fx8fxbbu200dxf0x9fx8fxabxf0x9fx93xa1xf0x9fx93xb7xf0x9fx93xb8",
                "screen_name": "Auwerl",
                "location": "Yobe state",
                "description": "",
                "url": "https://t.co/DVA3uWUeHA",
                "entities": {
                    "url": {
                        "urls": [
                            {
                                "url": "https://t.co/DVA3uWUeHA",
                                "expanded_url": "http://www.anayimunajindadi.com",
                                "display_url": "anayimunajindadi.com",
                                "indices": [
                                    0,
                                    23
                                ]
                            }
                        ]
                    },
                    "description": {
                        "urls": []
                    }
                },
                "protected": false,
                "followers_count": 418,
                "friends_count": 686,
                "listed_count": 0,
                "created_at": "Tue Apr 09 05:35:30 +0000 2013",
                "favourites_count": 4946,
                "utc_offset": null,
                "time_zone": null,
                "geo_enabled": true,
                "verified": false,
                "statuses_count": 5566,
                "lang": null,
                "contributors_enabled": false,
                "is_translator": false,
                "is_translation_enabled": false,
                "profile_background_color": "C0DEED",
                "profile_background_image_url": "http://abs.twimg.com/images/themes/theme1/bg.png",
                "profile_background_image_url_https": "https://abs.twimg.com/images/themes/theme1/bg.png",
                "profile_background_tile": false,
                "profile_image_url": "http://pbs.twimg.com/profile_images/1190548148487442432/gctlavYH_normal.jpg",
                "profile_image_url_https": "https://pbs.twimg.com/profile_images/1190548148487442432/gctlavYH_normal.jpg",
                "profile_link_color": "1DA1F2",
                "profile_sidebar_border_color": "C0DEED",
                "profile_sidebar_fill_color": "DDEEF6",
                "profile_text_color": "333333",
                "profile_use_background_image": true,
                "has_extended_profile": true,
                "default_profile": true,
                "default_profile_image": false,
                "following": false,
                "follow_request_sent": false,
                "notifications": false,
                "translator_type": "null"
            },
            "geo": null,
            "coordinates": null,
            "place": {
                "id": "01cbb7f86211fef3",
                "url": "https://api.twitter.com/1.1/geo/id/01cbb7f86211fef3.json",
                "place_type": "city",
                "name": "Damaturu",
                "full_name": "Damaturu,  Nigeria",
                "country_code": "NG",
                "country": "Nigeria",
                "contained_within": [],
                "bounding_box": {
                    "type": "Polygon",
                    "coordinates": [
                        [
                            [
                                11.930547,
                                11.7201586
                            ],
                            [
                                12.0167097,
                                11.7201586
                            ],
                            [
                                12.0167097,
                                11.7820384
                            ],
                            [
                                11.930547,
                                11.7820384
                            ]
                        ]
                    ]
                },
                "attributes": {}
            },
            "contributors": null,
            "is_quote_status": true,
            "retweet_count": 0,
            "favorite_count": 0,
            "favorited": false,
            "retweeted": false,
            "possibly_sensitive": false,
            "lang": "tl"
        },
        {
            "created_at": "Fri Nov 08 21:21:28 +0000 2019",
            "id": 1192915062618184700,
            "id_str": "1192915062618184624",
            "text": "where is everybody?",
            "truncated": false,
            "entities": {
                "hashtags": [],
                "symbols": [],
                "user_mentions": [],
                "urls": []
            },
            "metadata": {
                "iso_language_code": "en",
                "result_type": "recent"
            },
            "source": "<a href='http://twitter.com/download/android' rel='nofollow'>Twitter for Android</a>",
            "in_reply_to_status_id": null,
            "in_reply_to_status_id_str": null,
            "in_reply_to_user_id": null,
            "in_reply_to_user_id_str": null,
            "in_reply_to_screen_name": null,
            "user": {
                "id": 1333389876,
                "id_str": "1333389876",
                "name": "VARxf0x9fx91xa8xf0x9fx8fxbbu200dxf0x9fx8fxabxf0x9fx93xa1xf0x9fx93xb7xf0x9fx93xb8",
                "screen_name": "Michael Collins",
                "location": "behind the moon",
                "description": "",
                "url": "https://t.co/nonexistant",
                "entities": null,
                "protected": false,
                "followers_count": 420,
                "friends_count": 69,
                "listed_count": 0,
                "created_at": "Sun Jul 20 05:35:30 +0000 1969",
                "favourites_count": 4946,
                "utc_offset": null,
                "time_zone": null,
                "geo_enabled": true,
                "verified": false,
                "statuses_count": 5566,
                "lang": null,
                "contributors_enabled": false,
                "is_translator": false,
                "is_translation_enabled": false
            },
            "geo": null,
            "coordinates": {
                "coordinates": [
                    51.808615,
                    8.833008
                ],
                "type": "Point"
            },
            "place": {
                "id": "01cbb7f86211fef3",
                "url": "https://api.twitter.com/1.1/geo/id/01cbb7f86211fef3.json",
                "place_type": "city",
                "name": "Damaturu",
                "full_name": "Damaturu,  Nigeria",
                "country_code": "NG",
                "country": "Nigeria",
                "contained_within": [],
                "bounding_box": {
                    "type": "Polygon",
                    "coordinates": [
                        [
                            [
                                11.930547,
                                11.7201586
                            ],
                            [
                                12.0167097,
                                11.7201586
                            ],
                            [
                                12.0167097,
                                11.7820384
                            ],
                            [
                                11.930547,
                                11.7820384
                            ]
                        ]
                    ]
                },
                "attributes": {}
            },
            "contributors": null,
            "is_quote_status": true,
            "retweet_count": 69,
            "favorite_count": 420,
            "favorited": false,
            "retweeted": false,
            "possibly_sensitive": false,
            "lang": "en"
        },
        {
            "created_at": "Fri Nov 08 21:21:28 +0000 2019",
            "id": 1192915062846207200,
            "id_str": "1192915062846207263",
            "text": "There is no reason for me to be here",
            "truncated": false,
            "entities": {
                "hashtags": [],
                "symbols": [],
                "user_mentions": [],
                "urls": []
            },
            "metadata": {
                "iso_language_code": "en",
                "result_type": "recent"
            },
            "source": "<a href='http://twitter.com/download/android' rel='nofollow'>Twitter for Android</a>",
            "in_reply_to_status_id": null,
            "in_reply_to_status_id_str": null,
            "in_reply_to_user_id": null,
            "in_reply_to_user_id_str": null,
            "in_reply_to_screen_name": null,
            "user": {
                "id": 1333389876,
                "id_str": "1333389876",
                "name": "VARxf0x9fx91xa8xf0x9fx8fxbbu200dxf0x9fx8fxabxf0x9fx93xa1xf0x9fx93xb7xf0x9fx93xb8",
                "screen_name": "null meridian",
                "location": "greenwich",
                "description": "",
                "url": "https://t.co/nonexistant",
                "entities": null,
                "protected": false,
                "followers_count": 420,
                "friends_count": 69,
                "listed_count": 0,
                "created_at": "Mon Nov 11 15:27:30 +0000 2019",
                "favourites_count": 4946,
                "utc_offset": null,
                "time_zone": null,
                "geo_enabled": true,
                "verified": false,
                "statuses_count": 5566,
                "lang": null,
                "contributors_enabled": false,
                "is_translator": false,
                "is_translation_enabled": false
            },
            "geo": null,
            "coordinates": {
                "coordinates": [
                    51.4934,
                    0
                ],
                "type": "Point"
            },
            "place": {
                "id": "3eb2c704fe8a50cb",
                "url": "https://api.twitter.com/1.1/geo/id/3eb2c704fe8a50cb.json",
                "place_type": "city",
                "name": "City of London",
                "full_name": "City of London, London",
                "country_code": "GB",
                "country": "United Kingdom",
                "contained_within": [],
                "bounding_box=BoundingBox": {
                    "type": "Polygon",
                    "coordinates": [
                        [
                            [
                                -0.112442,
                                51.5068
                            ],
                            [
                                -0.0733794,
                                51.5068
                            ],
                            [
                                -0.0733794,
                                51.522161
                            ],
                            [
                                -0.112442,
                                51.522161
                            ]
                        ]
                    ]
                },
                "attributes": {}
            },
            "contributors": null,
            "is_quote_status": true,
            "retweet_count": 69,
            "favorite_count": 420,
            "favorited": false,
            "retweeted": false,
            "possibly_sensitive": false,
            "lang": "en"
        }
    ]
}```

### GET `/tweetAPI/search`
#### request example
```
localhost:3000/tweetAPI/search?bbox=-180,85,180,-85&fields=text,id,created_at&include=is```

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
}```
