# plumber.R
library(plumber)


# Nicht sicher ob alle n???tig
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

#* Echo back the input
#* @param msg The message to echo
#* @get /echo
function(msg=""){
  list(msg = paste0("The message is: '", msg, "'"))
}

#* Plot a histogram
#* @JSON
#* @get /plot
function(){
  rand <- rnorm(100)
  rand1 <- rnorm(100)
  pattern <- ppp(rand, rand1)
  par(mar = c(0,0,0,0))
  plot(pixellate.ppp(pattern))
  #plot(pattern, frame.plot=axis, xgap.axis=NULL, main=NULL, sub=NULL,ylim=NULL, xlim = NULL, xlab = NULL, ylab=NULL)
}


#* Plot a histogram
#* @param list1
#* @get /list
function(list1){
  list1[1]
}


#* Return the sum of two numbers
#* @get /sum/<a:int>/<b:int>
function(a, b){
  a + b
}

#* Return the sum of two numbers
#* @param a The first number to add
#* @param b The second number to add
#* @get /div
function(a, b){
  as.numeric(a) * as.numeric(b)
}

#* @post /user
function(req, list1, list2){
    id = list1
    name = list2
    plot(id,name)
}


#* Testing json
#* @png (width = 100, height = 100)
#* @get /data
function(req, a, b){
  point <- ppp(a,b)
  plot(quadratcount(point, nx=4, ny=4))
}


#* Radar data Output
#* @png (width = 400, height = 400)
#* @get /radar
function(req){
  print("hey im alive")
  fn = 'https://opendata.dwd.de/weather/radar/composit/fx/FX_LATEST.tar.bz2'


  download.file(fn,destfile="radar.tar.bz2")
  library(R.oo)
  library(R.utils)
  #bunzip2("radar.tar.bz2", "radar.tar", remove = FALSE, skip = TRUE)
  untar("radar.tar.bz2", files='FX1911302030_120_MF002', exdir = "radar", compressed="bzip2")

  crs = "+proj=stere +lat_0=90 +lat_ts=90 +lon_0=10 +k=0.93301270189 +x_0=0 +y_0=0 +a=6370040 +b=6370040 +no_defs"

  library(stars)

  r = read_stars("FX1911302030_120_MF002")

  st_crs(r) = crs

  data(air, package = "spacetime")

  plot(r, reset = FALSE)

  plot(st_transform(st_as_sf(DE), crs), add = TRUE, border = 'yellow')
}




#* Radar data Output
#* @json
#* @get /radio
function(){

  #gridbase <- "https://opendata.dwd.de/weather/radar/radolan/rw/raa01-rw_10000-latest-dwd---bin"
  # Link zum ftp-server
  rasterbase <- paste0(gridbase,"/hourly/radolan/recent")

  # Alle Dateien aus dem asc-Ordner ausw???hlbar machen
  ftp.files <- indexFTP("/asc", base=rasterbase, dir=tempdir())
  # Speicherziel definieren
  ddir <- localtestdir()
  tdir <- tempdir()

  # Eine Datei aus dem asc-Ordner bestimmen
  link <- paste0("hourly/radolan/recent/", ftp.files[length(ftp.files)-1])
  # Gew???hlte Datei herunterladen
  file <- dataDWD(link, base=gridbase, joinbf=TRUE, dir=ddir, quiet=TRUE,
                  dbin=TRUE, read=FALSE)
  # Entpacken
  untar(file, exdir=ddir)

  # Entpackte Dateien ausw???hlbar machen
  y <-list.files(ddir)
  # Link zu Dateien
  r <- paste0(ddir, "/")
  # Datei ausw???hlen und an Link hinzuf???gen
  r <- paste0(r, y[length(y)])
  # Raster-/Array-Daten lesen
  star <- read_stars(r)

  # Projektion definieren
  crs = "+proj=stere +lat_0=90 +lat_ts=90 +lon_0=10 +k=0.93301270189 +x_0=0 +y_0=0 +a=6370040 +b=6370040 +no_defs"


  # Projektion ???ndern
  st_crs(star)= crs

  x <- st_as_stars(star)
  sf_data <- st_as_sf(x, crs =EPSG:3857,as_points=FALSE, merge=TRUE, na.rm = FALSE)
  geo <- sf_geojson(sf_data)
  geo
}
