# plumber.R
library(plumber)

#libraries which are necessary
# Nicht sicher ob alle n???tig
library(grid)
library(spatstat)
library(rdwd)
library(stars)
library(utils)
library(base)
library(sf)
library(RCurl)
library(rgdal)
library(sp)
library(raster)
library(geojsonsf)
library(jsonlite)
library(maptools)
library(dwdradar)
library(tm)
library(wordcloud)
library(fasterize)
library(httr)
library(geojsonR)
library(ggplot2)


# testing httr
#* note
#* @json
#* @get /api
function(req){
  #link for dwd wetterdaten
  resp <- GET("http://localhost:3000/tweetAPI/search?bbox=55.299,3.95,47.076,16.655")
  jsonRespText <- httr::content(resp, as= "text")
  tweetframe <- as.data.frame(fromJSON(jsonRespText))
  View(tweetframe)
  tweettxt <- tweetframe$tweets.text
  tweettxt = substr(tweettxt,1,nchar(tweettxt)- 17)
  #print(jsonRespText)
}

# testing httr
#* note
#* @json
#* @get /data22
function(req){
  #link for dwd wetterdaten
  json = req$postBody
  json_data <- fromJSON(json)
  View(json_data)
  print(json_data$url)
  json_data
  #frameurl <- as.data.frame(fromJSON(json))
  #View(frameurl$url[[1]])
  #print(frameurl$url[[1]]$Levels)
  #frameurl$url[[1]]
  #print(jsonRespText)
}
# Not ready yet
#* Getting a Word map by json
#* @png (width = 500, height = 500)
#* @param min Minimun Frequency of words
#* @get /data

function(req, min=1){
  min <- as.numeric(min)
  json = req$postBody
  json_data <- fromJSON(json)

  print(json_data$url)
  resp <- GET(json_data$url)
  jsonRespText <- httr::content(resp, as= "text")
  tweetframe <- as.data.frame(fromJSON(jsonRespText))
  tweettxt <- tweetframe$tweets.text
  tweettxt = substr(tweettxt,1,nchar(tweettxt)- 17)
  ## Text as corpus somehow needed for somethings espacially from tm
  body <- Corpus(VectorSource(tweettxt))
  ### Text as Matrix for plotting ???
  dtm <- DocumentTermMatrix(body,control = list(removePunctuation = TRUE,
                                                removeNumbers = TRUE,
                                                stopwords = TRUE))
  DoMa <- as.matrix(dtm)
  DoMa <- t(DoMa)
  ## All words to lower case 
  reuters <- tm_map(body, content_transformer(tolower))
  ## 
  reuters <- tm_map(reuters, stripWhitespace)
  ## remove punctuation
  reuters <- tm_map(reuters, removePunctuation)
  result <- wordcloud(reuters, scale=c(6, .4), min.freq = min, max.words = 27)
  #findFreqTerms(dtm, 1)
}

# Not ready yet
#* Getting a Word map by json
#* @png (width = 500, height = 500)
#* @param minfreq Minimun Frequency of words
#* @get /wordcloud
function(req, minfreq=1){
  min <- as.numeric(minfreq)

  resp <- GET("http://localhost:3000/tweetAPI/search?bbox=55.299,3.95,47.076,16.655")
  jsonRespText <- httr::content(resp, as= "text")
  tweetframe <- as.data.frame(fromJSON(jsonRespText))
  tweettxt <- tweetframe$tweets.text
  tweettxt = substr(tweettxt,1,nchar(tweettxt)- 17)
  ## Text as corpus somehow needed for somethings espacially from tm
  body <- Corpus(VectorSource(tweettxt))
  ### Text as Matrix for plotting ???
  dtm <- DocumentTermMatrix(body,control = list(removePunctuation = TRUE,
                                                 removeNumbers = TRUE,
                                                 stopwords = TRUE))
  DoMa <- as.matrix(dtm)
  DoMa <- t(DoMa)
  ## All words to lower case 
  reuters <- tm_map(body, content_transformer(tolower))
  ## 
  reuters <- tm_map(reuters, stripWhitespace)
  ## remove punctuation
  reuters <- tm_map(reuters, removePunctuation)
  result <- wordcloud(reuters, scale=c(6, .4), min.freq = min, max.words = 30)
  #findFreqTerms(dtm, 1)
}

# help
#* getting most frequent words in tweets
#* json
#* @param minfreq The minimum frequency of words in tweets
#* @get /freq
function(req, min=5){
 min <- as.numeric(min)
 # todo!
 #getting the text of all tweets together
 resp <- GET("https://cat-fact.herokuapp.com/facts")
 jsonRespText <- httr::content(resp, as= "text")
 winners <- as.data.frame(fromJSON(jsonRespText))
 
 # Text as corpus somehow needed for somethings espacially from tm
 body <- Corpus(VectorSource(winners$all.text))
 # Text as Matrix for plotting ???
 dtm <- DocumentTermMatrix(body,control = list(removePunctuation = TRUE,
                                               removeNumbers = TRUE,
                                               stopwords = TRUE))
 findFreqTerms(dtm, min)
}


# in editation
#* getting most frequent words in tweets
# @json
#* @png (width = 500, height = 500)
#* @param word The word who correlates
#* @param correlation correlation coefficent
#* @get /association
function(req, correlation=0.5, word=""){
  correlation <- as.numeric(correlation)
  word <- as.character(word)
  ## todo!
  ##getting the text of all tweets together
  resp <- GET("https://cat-fact.herokuapp.com/facts")
  jsonRespText <- httr::content(resp, as= "text")
  winners <- as.data.frame(fromJSON(jsonRespText))
  
  ## Text as corpus somehow needed for somethings espacially from tm
  body <- Corpus(VectorSource(winners$all.text))
  ## Text as Matrix for plotting ???
  dtm <- DocumentTermMatrix(body,control = list(removePunctuation = TRUE,
                                                removeNumbers = TRUE,
                                                stopwords = TRUE))
  assoc <- findAssocs(dtm, word, correlation)
  unlAsc <- (unlist(assoc[[1]]))
  print(unlAsc)
  df <- data.frame(unlAsc)
  print(df)
  
  plot(df[,1], df[,2])
  
}

# !Important Twitter API daten: Das T muss aus den Timestring entfernt werden
# From "2014-01-01T23:28:56.782Z"
# To   "2014-01-01 12:28:56.782Z"
# Here            
# Not ready yet
#* Getting a plot as Timeline
#* @png (width = 500, height = 500)
#* @get /timeline
function(req){
  json = req$postBody
  vect <- fromJSON(json)
  dates <- vect$dates
  show(as.POSIXct(dates))
  #data$x3 <- as.integer(data$x3) 
  hist(as.POSIXct(dates), breaks="hours", freq=TRUE, xlab="Time", main="Frequency of Tweets")
}

#In Editation
#* Display Tweets in of a Region as Quadratic Count
#* @png (width = 500, height = 500)
#* @param xbreak Breaks on x axis
#* @param ybreak Breaks on y axis
#* @get /quadrat
function(req, xbreak=2, ybreak=2){
  xbreak <- as.numeric(xbreak)
  ybreak <- as.numeric(ybreak)
  json = req$postBody
  mydf <- fromJSON(json)
  mydf$coords$lng
  x <- mydf$coords$lng
  y <- mydf$coords$lat
  #r2d2 <- ppp(x, y)
  #c3po <- pixellate(r2d2)
  df <- data.frame(x, y, 1)
  dm <- data.matrix(df)
  wino <- owin(xrange = c(0, 60), yrange = c(0, 60))
  point <- ppp(dm[,1], dm[,2], wino)
  
  quad2 <- quadratcount(point, nx=xbreak, ny=ybreak)
  #density of each
  quad1d <- intensity(quad2, image=TRUE)
  
  xy1 <-raster(quad1d)
  plot(xy1)
  
}

# From Json coordinates to Raster values (submitted as Feature Geojson)
#* Testing coordinates as JSON
# @png (width = 500, height = 500)
#* json
#* @param sigma sigma value for density
#* @param west The WestBound
#* @param east The EastBound
#* @param south The SouthBound
#* @param north The NorthBound
#* @get /density
function(req, sigma=0.1, west = 2.00348, east= 15.79388, south = 46.88463, north= 54.97383){
  sigma <- as.numeric(sigma)
  #Parameters from string to numeric type
  west <- as.numeric(west)
  east <- as.numeric(east)
  south <- as.numeric(south)
  north <- as.numeric(north)
  
  #getting twitter data
  #resp <- GET("http://localhost:3000/tweetAPI/search?bbox=55.299,3.95,47.076,16.655")
  #jsonRespText <- httr::content(resp, as= "text")
  #tweetframe <- as.data.frame(fromJSON(jsonRespText))
  
  # Get Data from URL
  json = req$postBody
  json_data <- fromJSON(json)
  
  print(json_data$url)
  resp <- GET(json_data$url)
  jsonRespText <- httr::content(resp, as= "text")
  tweetframe <- as.data.frame(fromJSON(jsonRespText))
  #tweetcoords <- tweetframe[,1][,1][,1]
  tweetcoords <- tweetframe$tweets.geojson$geometry$coordinates
  tweetcoords <- (data.frame(t(sapply(tweetcoords,c))))

    #tweetframe$tweets.geojson.geometry.coordinates
 
  x <-  tweetcoords$X1
  y <-  tweetcoords$X2
  df <- data.frame(x, y)
  dm <- data.matrix(df)
  obswindow <- owin(xrange = c(west, east), yrange = c(south, north))
  point <- ppp(dm[,1], dm[,2], obswindow)
  ds <- density(point, sigma=sigma)
  xy <-raster(ds)
  crs(xy) <- "+proj=longlat +datum=WGS84 +no_defs"
  #cc <- aggregate(xy, 2)
  # Delete Values<0
  xy[xy < 0] <- NA
  
  # Reclassify
  highestValue <- maxValue(xy)
  xy <- reclassify(xy, c(-Inf, highestValue*0.03, 0,
                         highestValue*0.03, highestValue*0.2, 1,
                         highestValue*0.2, highestValue*0.4, 2,
                         highestValue*0.4, highestValue*0.6, 3,
                         highestValue*0.6, highestValue*0.8, 4,
                         highestValue*0.8, Inf, 5))
  cstars <- st_as_stars(xy)
  # transfer raster to feature class
  sf_data <- st_as_sf(cstars,as_points=FALSE, merge=TRUE, na.rm = FALSE)
  # set reference system
  new = st_crs(4326)
  
  # transform to reference system
  sf_data2 <- st_transform(sf_data, new)
  
  # change Feature format to geojson
  geo <- sf_geojson(sf_data2)
  result <- geo
  result
}



# Kest Nearest Neighbour
#* Testing coordinates as JSON
#* @param west The WestBound
#* @param east The EastBound
#* @param south The SouthBound
#* @param north The NorthBound
#* @png (width = 500, height = 500)
#* @get /kest
function(req, west = 2.00348, east= 15.79388, south = 46.88463, north= 54.97383){
  #Parameters from string to numeric type
  west <- as.numeric(west)
  east <- as.numeric(east)
  south <- as.numeric(south)
  north <- as.numeric(north)
  
  
  # Get Data from URL
  json = req$postBody
  json_data <- fromJSON(json)
  
  resp <- GET(json_data$url)
  jsonRespText <- httr::content(resp, as= "text")
  tweetframe <- as.data.frame(fromJSON(jsonRespText))
  #tweetcoords <- tweetframe[,1][,1][,1]
  tweetcoords <- tweetframe$tweets.geojson$geometry$coordinates
  tweetcoords <- (data.frame(t(sapply(tweetcoords,c))))
  
  #tweetframe$tweets.geojson.geometry.coordinates
  View(tweetcoords)
  lng <-  tweetcoords$X1
  lat <-  tweetcoords$X2
  
  
  
  #From Coordinates to Meters of observation Point
  # from reference coordinate system to projected coordinate system
  xy = data.frame(lng, lat)
  coordinates(xy) <- c("lng", "lat")
  proj4string(xy) <- CRS("+proj=longlat +datum=WGS84 +no_defs")
  # +init=epsg:4839
  # NE <- spTransform(xy, CRS("+proj=utm +zone=32 ellps=WGS84"))
  #projxy <- spTransform(xy, CRS("+init=epsg:3857"))
  projxy <- spTransform(xy, CRS("+init=epsg:4839"))
  projxy <- as.data.frame(projxy)
  
  # From Coordinates to Meters
  
  # observation window based on entries 
  obswindow <- owin(xrange = c(min(projxy[,1]), max(projxy[,1])), yrange = c(min(projxy[,2]), max(projxy[,2])))
  
  # to point pattern
  points <- ppp( projxy[,1], projxy[,2], obswindow)
  # appoint unit to the point
  unitname(points) <- "m"
  # convert values from m to km
  pointskm <- rescale(points, 1000, "km")
  
  Kfunc <- Kest(pointskm)
  plot(Kfunc, main=NULL, las=1)

}


# lest Nearest Neighbour
#* Testing coordinates as JSON
#* @param west The WestBound
#* @param east The EastBound
#* @param south The SouthBound
#* @param north The NorthBound
#* @png (width = 500, height = 500)
#* @get /lest
function(req, west = 2.00348, east= 15.79388, south = 46.88463, north= 54.97383){
  #Parameters from string to numeric type
  west <- as.numeric(west)
  east <- as.numeric(east)
  south <- as.numeric(south)
  north <- as.numeric(north)
  
  
  # Get Data from URL
  json = req$postBody
  json_data <- fromJSON(json)
  
  resp <- GET(json_data$url)
  jsonRespText <- httr::content(resp, as= "text")
  tweetframe <- as.data.frame(fromJSON(jsonRespText))
  #tweetcoords <- tweetframe[,1][,1][,1]
  tweetcoords <- tweetframe$tweets.geojson$geometry$coordinates
  tweetcoords <- (data.frame(t(sapply(tweetcoords,c))))
  
  #tweetframe$tweets.geojson.geometry.coordinates
  View(tweetcoords)
  lng <-  tweetcoords$X1
  lat <-  tweetcoords$X2
  
  
  
  #From Coordinates to Meters of observation Point
  # from reference coordinate system to projected coordinate system
  xy = data.frame(lng, lat)
  coordinates(xy) <- c("lng", "lat")
  proj4string(xy) <- CRS("+proj=longlat +datum=WGS84 +no_defs")
  # +init=epsg:4839
  # NE <- spTransform(xy, CRS("+proj=utm +zone=32 ellps=WGS84"))
  #projxy <- spTransform(xy, CRS("+init=epsg:3857"))
  projxy <- spTransform(xy, CRS("+init=epsg:4839"))
  projxy <- as.data.frame(projxy)
  
  # From Coordinates to Meters
  
  # observation window based on entries 
  obswindow <- owin(xrange = c(min(projxy[,1]), max(projxy[,1])), yrange = c(min(projxy[,2]), max(projxy[,2])))
  
  # to point pattern
  points <- ppp( projxy[,1], projxy[,2], obswindow)
  # appoint unit to the point
  unitname(points) <- "m"
  # convert values from m to km
  pointskm <- rescale(points, 1000, "km")
  
  Lfunc <- Lest(pointskm)
  plot(Lfunc, main=NULL, las=1)
  
}

# fest Nearest Neighbour
#* Testing coordinates as JSON
#* @param west The WestBound
#* @param east The EastBound
#* @param south The SouthBound
#* @param north The NorthBound
#* @png (width = 500, height = 500)
#* @get /fest
function(req, west = 2.00348, east= 15.79388, south = 46.88463, north= 54.97383){
  #Parameters from string to numeric type
  west <- as.numeric(west)
  east <- as.numeric(east)
  south <- as.numeric(south)
  north <- as.numeric(north)
  
  
  # Get Data from URL
  json = req$postBody
  json_data <- fromJSON(json)
  
  resp <- GET(json_data$url)
  jsonRespText <- httr::content(resp, as= "text")
  tweetframe <- as.data.frame(fromJSON(jsonRespText))
  #tweetcoords <- tweetframe[,1][,1][,1]
  tweetcoords <- tweetframe$tweets.geojson$geometry$coordinates
  tweetcoords <- (data.frame(t(sapply(tweetcoords,c))))
  
  #tweetframe$tweets.geojson.geometry.coordinates
  View(tweetcoords)
  lng <-  tweetcoords$X1
  lat <-  tweetcoords$X2
  
  
  
  #From Coordinates to Meters of observation Point
  # from reference coordinate system to projected coordinate system
  xy = data.frame(lng, lat)
  coordinates(xy) <- c("lng", "lat")
  proj4string(xy) <- CRS("+proj=longlat +datum=WGS84 +no_defs")
  # +init=epsg:4839
  # NE <- spTransform(xy, CRS("+proj=utm +zone=32 ellps=WGS84"))
  #projxy <- spTransform(xy, CRS("+init=epsg:3857"))
  projxy <- spTransform(xy, CRS("+init=epsg:4839"))
  projxy <- as.data.frame(projxy)
  
  # From Coordinates to Meters
  
  # observation window based on entries 
  obswindow <- owin(xrange = c(min(projxy[,1]), max(projxy[,1])), yrange = c(min(projxy[,2]), max(projxy[,2])))
  
  # to point pattern
  points <- ppp( projxy[,1], projxy[,2], obswindow)
  # appoint unit to the point
  unitname(points) <- "m"
  # convert values from m to km
  pointskm <- rescale(points, 1000, "km")
  
  Ffunc <- Fest(pointskm)
  plot(Ffunc, main=NULL, las=1)
  
}

# Gest Nearest Neighbour
#* Testing coordinates as JSON
#* @param west The WestBound
#* @param east The EastBound
#* @param south The SouthBound
#* @param north The NorthBound
#* @png (width = 500, height = 500)
#* @get /gest
function(req, west = 2.00348, east= 15.79388, south = 46.88463, north= 54.97383){
  #Parameters from string to numeric type
  west <- as.numeric(west)
  east <- as.numeric(east)
  south <- as.numeric(south)
  north <- as.numeric(north)
  
  
  # Get Data from URL
  json = req$postBody
  json_data <- fromJSON(json)
  
  resp <- GET(json_data$url)
  jsonRespText <- httr::content(resp, as= "text")
  tweetframe <- as.data.frame(fromJSON(jsonRespText))
  #tweetcoords <- tweetframe[,1][,1][,1]
  tweetcoords <- tweetframe$tweets.geojson$geometry$coordinates
  tweetcoords <- (data.frame(t(sapply(tweetcoords,c))))
  
  #tweetframe$tweets.geojson.geometry.coordinates
  View(tweetcoords)
  lng <-  tweetcoords$X1
  lat <-  tweetcoords$X2
  
  
  
  #From Coordinates to Meters of observation Point
  # from reference coordinate system to projected coordinate system
  xy = data.frame(lng, lat)
  coordinates(xy) <- c("lng", "lat")
  proj4string(xy) <- CRS("+proj=longlat +datum=WGS84 +no_defs")
  # +init=epsg:4839
  # NE <- spTransform(xy, CRS("+proj=utm +zone=32 ellps=WGS84"))
  #projxy <- spTransform(xy, CRS("+init=epsg:3857"))
  projxy <- spTransform(xy, CRS("+init=epsg:4839"))
  projxy <- as.data.frame(projxy)
  
  # From Coordinates to Meters
  
  # observation window based on entries 
  obswindow <- owin(xrange = c(min(projxy[,1]), max(projxy[,1])), yrange = c(min(projxy[,2]), max(projxy[,2])))
  
  # to point pattern
  points <- ppp( projxy[,1], projxy[,2], obswindow)
  # appoint unit to the point
  unitname(points) <- "m"
  # convert values from m to km
  pointskm <- rescale(points, 1000, "km")
  
  Gfunc <- Gest(pointskm)
  plot(Gfunc, main=NULL, las=1)
  
}

# average Nearest Neighbour
#* Testing coordinates as JSON
#* @param neighbours
#* @png (width = 500, height = 500)
#* @get /ann
function(req, neighbours = 50){

  
  
  # Get Data from URL
  json = req$postBody
  json_data <- fromJSON(json)
  
  resp <- GET(json_data$url)
  jsonRespText <- httr::content(resp, as= "text")
  tweetframe <- as.data.frame(fromJSON(jsonRespText))
  #tweetcoords <- tweetframe[,1][,1][,1]
  tweetcoords <- tweetframe$tweets.geojson$geometry$coordinates
  tweetcoords <- (data.frame(t(sapply(tweetcoords,c))))
  
  #tweetframe$tweets.geojson.geometry.coordinates
  View(tweetcoords)
  lng <-  tweetcoords$X1
  lat <-  tweetcoords$X2
  
  
  
  #From Coordinates to Meters of observation Point
  # from reference coordinate system to projected coordinate system
  xy = data.frame(lng, lat)
  coordinates(xy) <- c("lng", "lat")
  proj4string(xy) <- CRS("+proj=longlat +datum=WGS84 +no_defs")
  # +init=epsg:4839
  # NE <- spTransform(xy, CRS("+proj=utm +zone=32 ellps=WGS84"))
  #projxy <- spTransform(xy, CRS("+init=epsg:3857"))
  projxy <- spTransform(xy, CRS("+init=epsg:4839"))
  projxy <- as.data.frame(projxy)
  
  # From Coordinates to Meters
  
  # observation window based on entries 
  obswindow <- owin(xrange = c(min(projxy[,1]), max(projxy[,1])), yrange = c(min(projxy[,2]), max(projxy[,2])))
  
  # to point pattern
  points <- ppp( projxy[,1], projxy[,2], obswindow)
  # appoint unit to the point
  unitname(points) <- "m"
  # convert values from m to km
  pointskm <- rescale(points, 1000, "km")
  
  # calculate ann in km
  ANN <- apply(nndist(pointskm, k=1:neighbours),2,FUN=mean)
  View(ANN)
  plot(ANN, type="b", main=NULL, las=1, yaxs="r")
}

# Ueberpruefen nach Koordinaten System
# url call url?west=Number&east=Number&south=Number&north=Number
# example url: http://localhost:8000/radar?west=9&east=10&south=50&north=51
#* Radar data Output
# BBox of preciption data
#* @param west The WestBound
#* @param east The EastBound
#* @param south The SouthBound
#* @param north The NorthBound
#* @param minPrec The minimum value for Preciption
#* @json
#* @get /radar
function(req, west = 2.00348, east= 15.79388, south = 46.88463, north= 54.97383, minPrec=0, operation="feature"){
  
  # values in query are strings so we need them as.numerics
  west <- as.numeric(west)
  east <- as.numeric(east)
  south <- as.numeric(south)
  north <- as.numeric(north)
  minPrec <- as.numeric(minPrec)
  
  # link to file
  rw_base <- "ftp://ftp-cdc.dwd.de/weather/radar/radolan/ry"
  #getFile from the last 5 min preciption data
  rw_urls <- indexFTP(base=rw_base, dir=tempdir(), folder="", quiet=TRUE)
  rw_file <- dataDWD(rw_urls[length(rw_urls)], base=rw_base, joinbf=TRUE, dir=tempdir(), read=FALSE, quiet=TRUE, dbin=TRUE, dfargs=list(mode="wb"))
  View(rw_urls)
  # data & reproject
  rw_orig <- dwdradar::readRadarFile(rw_file)
  rw_proj <- projectRasterDWD(raster::raster(rw_orig$dat), extent="radolan", quiet=TRUE)
  rw_proj <- flip(rw_proj, direction="y")
  
  #crs(rw_proj) <- "EPSG:3857"
  
  
  # replace < 0 and 0 with NA, so they're no part of the final product
  rw_proj[rw_proj == 0] <- NA
  rw_proj[rw_proj < minPrec] <- NA
  
  
  # unit: 1/100 mm/5min#, thus *100 *2 for mm/10min (breaks /100 *2)
  reclass = c(-Inf, 0, 0, 0,0.01,1, 0.01,0.034,2, 0.034,0.166,3, 0.166,Inf,4)
  
  # reclassify
  rw_proj_class = reclassify(rw_proj, reclass)
  
  # testing raster::crop :
  # -->
  ## extent format (xmin,xmax,ymin,ymax)
  e <- as(extent(west, east, south, north), 'SpatialPolygons')
  crs(e) <- "+proj=longlat +datum=WGS84 +no_defs"
  rw_proj_class <- crop(rw_proj_class, e)
  # <--
  
  result <- "invalid Operation"
  
  if(operation == "meanraster"){
    result <- cellStats(rw_proj, mean)
  }
  if(operation == "minraster"){
    result <- cellStats(rw_proj, min)
  }
  if(operation == "maxraster"){
    result <- cellStats(rw_proj, max)
  }
  if(operation == "sumraster"){
    result <- cellStats(rw_proj, sum)
  }
  
  if(operation == "countcells"){
    result <- freq(rw_proj_class)
  }
  
  if(operation == "feature"){
    cstars <- st_as_stars(rw_proj_class)
    # transfer raster to feature class
    sf_data <- st_as_sf(cstars,as_points=FALSE, merge=TRUE, na.rm = FALSE)
    # set reference system
    new = st_crs(3857)
    
    # transform to reference system
    sf_data2 <- st_transform(sf_data, new)
    
    # change Feature format to geojson
    geo <- sf_geojson(sf_data)
    result <- geo
  }
  result
}


# Hourly Preciption data Uptodate
# url call url?west=Number&east=Number&south=Number&north=Number
# example url: http://localhost:8000/radar?west=9&east=10&south=50&north=51
#* Radar data Output
# BBox of preciption data
#* @param west The WestBound
#* @param east The EastBound
#* @param south The SouthBound
#* @param north The NorthBound
#* @param minPrec The minimum value for Preciption
#* @param operation Defines the Operation to do like statistics etc
# available stats are: features(Geojson) countcells(in km²), meanraster(average value)
# @png (width = 500, height = 500)
#* @get /radarhourly
function(req, west = 2.00348, east= 15.79388, south = 46.88463, north= 54.97383, minPrec=0, operation="feature"){
  
  # values in query are strings so we need them as.numerics
  west <- as.numeric(west)
  east <- as.numeric(east)
  south <- as.numeric(south)
  north <- as.numeric(north)
  minPrec <- as.numeric(minPrec)
  
  # link to file
  rw_base <- "ftp://ftp-cdc.dwd.de/weather/radar/radolan/rw"
  #getFile from the last 5 min preciption data
  rw_urls <- indexFTP(base=rw_base, dir=tempdir(), folder="", quiet=TRUE)
  rw_file <- dataDWD(rw_urls[length(rw_urls)], base=rw_base, joinbf=TRUE, dir=tempdir(), read=FALSE, quiet=TRUE, dbin=TRUE, dfargs=list(mode="wb"))
  
  # data & reproject
  rw_orig <- dwdradar::readRadarFile(rw_file)
  rw_proj <- projectRasterDWD(raster::raster(rw_orig$dat), extent="radolan", quiet=TRUE)
  
  # replace < 0 and minimum with NA, so they're no part of the final product
  rw_proj[rw_proj == 0] <- NA
  rw_proj[rw_proj < minPrec] <- NA
  
  # unit: 1/100 mm/5min#, thus *100 *2 for mm/10min (breaks /100 *2)
  reclass = c(-Inf, 0, 0, 0,0.01,1, 0.01,0.034,2, 0.034,0.166,3, 0.166,Inf,4)
  
  # reclassify
  rw_proj_class = reclassify(rw_proj, reclass)
  
  # testing raster::crop :
  # -->
  ## extent format (xmin,xmax,ymin,ymax)
  e <- as(extent(west, east, south, north), 'SpatialPolygons')
  crs(e) <- "+proj=longlat +datum=WGS84 +no_defs"
  rw_proj_class <- crop(rw_proj_class, e)
  # <--
  
  result <- "invalid Operation"
  
  if(operation == "meanraster"){
    result <- cellStats(rw_proj, mean)
  }
  if(operation == "minraster"){
    result <- cellStats(rw_proj, min)
  }
  if(operation == "maxraster"){
    result <- cellStats(rw_proj, max)
  }
  if(operation == "sumraster"){
    result <- cellStats(rw_proj, sum)
  }
  
  if(operation == "countcells"){
    result <- freq(rw_proj_class)
  }
  
  if(operation == "feature"){
    cstars <- st_as_stars(rw_proj_class)
    # transfer raster to feature class
    sf_data <- st_as_sf(cstars,as_points=FALSE, merge=TRUE, na.rm = FALSE)
    # set reference system
    new = st_crs(4326)
    
    # transform to reference system
    sf_data2 <- st_transform(sf_data, new)
    
    # change Feature format to geojson
    geo <- sf_geojson(sf_data2)
    result <- geo
  }
  result
}



# show plots of hourly preciption over time
# url call url?west=Number&east=Number&south=Number&north=Number
# example url: http://localhost:8000/radar?west=9&east=10&south=50&north=51
#* Radar data Output
# BBox of preciption data
#* @param west The WestBound
#* @param east The EastBound
#* @param south The SouthBound
#* @param north The NorthBound
#* @param minPrec The minimum value for Preciption
#* @param operation Defines the Operation to do like statistics etc
# available stats are: features(Geojson) countcells(in km²), meanraster(average value)
#* @png (width = 500, height = 500)
#* @get /precplots
function(req, west = 2.00348, east= 15.79388, south = 46.88463, north= 54.97383, minPrec=0, operation="feature"){
  
  # values in query are strings so we need them as.numerics
  west <- as.numeric(west)
  east <- as.numeric(east)
  south <- as.numeric(south)
  north <- as.numeric(north)
  minPrec <- as.numeric(minPrec)
  
  # link to file
  rw_base <- "ftp://ftp-cdc.dwd.de/weather/radar/radolan/rw"
  #getFile from the last 5 min preciption data
  rw_urls <- indexFTP(base=rw_base, dir=tempdir(), folder="", quiet=TRUE)
  length <- length((rw_urls))
  hourvec <- c()
  precvec <- c()
  while(length > 0){
    rw_file <- dataDWD(rw_urls[length], base=rw_base, joinbf=TRUE, dir=tempdir(), read=FALSE, quiet=TRUE, dbin=TRUE, dfargs=list(mode="wb"))
    hourvec <- append(hourvec, 48 - length)
    # data & reproject
    rw_orig <- dwdradar::readRadarFile(rw_file)
    rw_proj <- projectRasterDWD(raster::raster(rw_orig$dat), extent="radolan", quiet=TRUE)
    
    # replace < 0 and minimum with NA, so they're no part of the final product
    rw_proj[rw_proj == 0] <- NA
    rw_proj[rw_proj < minPrec] <- NA
    
    # unit: 1/100 mm/5min#, thus *100 *2 for mm/10min (breaks /100 *2)
    reclass = c(-Inf, 0, 0, 0,0.0,1, 0.01,0.034,2, 0.034,0.166,3, 0.166,10000,4)
    
    # reclassify
    rw_proj_class = reclassify(rw_proj, reclass)
    
    # testing raster::crop :
    # -->
    ## extent format (xmin,xmax,ymin,ymax)
    e <- as(extent(west, east, south, north), 'SpatialPolygons')
    crs(e) <- "+proj=longlat +datum=WGS84 +no_defs"
    rw_proj_class <- crop(rw_proj_class, e)
    # <--
    
    result <- "invalid Operation"
    
    if(operation == "meanraster"){
       precvec <- append(precvec, cellStats(rw_proj, mean))
    }
    if(operation == "minraster"){
      precvec <- append(precvec, cellStats(rw_proj, min))
    }
    if(operation == "maxraster"){
      precvec <- append(precvec,cellStats(rw_proj, max))
    }
    if(operation == "sumraster"){
      precvec <- append(precvec,cellStats(rw_proj, sum))
    }
    
    if(operation == "countcells"){
      result <- freq(rw_proj_class)
    }
    length <- length - 1
  }
  plot(hourvec, precvec)
}


# show  historgram of hourly preciption over the last 48h
# url call url?west=Number&east=Number&south=Number&north=Number
# example url: http://localhost:8000/radar?west=9&east=10&south=50&north=51
#* Radar data Output
# BBox of preciption data
#* @param west The WestBound
#* @param east The EastBound
#* @param south The SouthBound
#* @param north The NorthBound
#* @param minPrec The minimum value for Preciption
#* @param operation Defines the Operation to do like statistics etc
# available stats are: mean, max, min and sum
#* @png (width = 500, height = 500)
#* @get /prechist
function(req, west = 2.00348, east= 15.79388, south = 46.88463, north= 54.97383, minPrec=0, operation="mean"){
  
  # values in query are strings so we need them as.numerics
  west <- as.numeric(west)
  east <- as.numeric(east)
  south <- as.numeric(south)
  north <- as.numeric(north)
  minPrec <- as.numeric(minPrec)
  
  # link to file
  rw_base <- "ftp://ftp-cdc.dwd.de/weather/radar/radolan/rw"
  #getFile from the last 5 min preciption data
  rw_urls <- indexFTP(base=rw_base, dir=tempdir(), folder="", quiet=TRUE)
  length <- length((rw_urls))
  precvec <- c()
  while(length > 0){
    rw_file <- dataDWD(rw_urls[length], base=rw_base, joinbf=TRUE, dir=tempdir(), read=FALSE, quiet=TRUE, dbin=TRUE, dfargs=list(mode="wb"))
    # data & reproject
    rw_orig <- dwdradar::readRadarFile(rw_file)
    rw_proj <- projectRasterDWD(raster::raster(rw_orig$dat), extent="radolan", quiet=TRUE)
    
    # replace < 0 and minimum with NA, so they're no part of the final product
    rw_proj[rw_proj == 0] <- NA
    rw_proj[rw_proj < minPrec] <- NA
    
    # unit: 1/100 mm/5min#, thus *100 *2 for mm/10min (breaks /100 *2)
    reclass = c(-Inf, 0, 0, 0,0.0,1, 0.01,0.034,2, 0.034,0.166,3, 0.166,10000,4)
    
    # reclassify
    rw_proj_class = reclassify(rw_proj, reclass)
    
    # testing raster::crop :
    # -->
    ## extent format (xmin,xmax,ymin,ymax)
    e <- as(extent(west, east, south, north), 'SpatialPolygons')
    crs(e) <- "+proj=longlat +datum=WGS84 +no_defs"
    rw_proj_class <- crop(rw_proj_class, e)
    # <--
    
    result <- "invalid Operation"
    
    if(operation == "mean"){
      precvec <- append(precvec, cellStats(rw_proj_class, mean))
    }
    if(operation == "min"){
      precvec <- append(precvec, cellStats(rw_proj_class, min))
    }
    if(operation == "max"){
      precvec <- append(precvec,cellStats(rw_proj_class, max))
    }
    if(operation == "sum"){
      precvec <- append(precvec,cellStats(rw_proj_class, sum))
    }
    length <- length - 1
  }
  hist(precvec)
}