FROM trestletech/plumber

#RUN apt-get update -qq && apt-get install -y \
#  git-core \
#  libssl-dev \
#  libcurl4-gnutls-dev \


#the following is somehow needed for some libraries
RUN apt-get install -y libxml2-dev
RUN apt-get install -y libudunits2-dev

#CAN NOT INSTALL LIBGDAL. the following attempts failed
#RUN apt-get update &&\
#    apt-get install -y binutils libproj-dev gdal-bin
#RUN apt-get install -y gdal-bin
#RUN apt-get install libgdal
#RUN apt-get install -y libgdal-dev

## RUN R -e 'install.packages(c("devtools"))'
## RUN R -e 'devtools::install_github("trestletech/plumber")'

# this may take a while

#RUN install2.r plumber
RUN R -e 'install.packages(c("plumber","grid","spatstat","rdwd","stars","utils","base","sf","RCurl","rgdal","sp","raster","geojsonsf","jsonlite","maptools","dwdradar","tm","wordcloud","fasterize","httr","geojsonR","ggplot2"))'
RUN R -e 'install.packages("stars")'
#RUN R -e 'install.packages("sf")'
#RUN R -e 'install.packages("rgdal")'
#RUN R -e 'install.packages("tm")'

COPY . /usr/local/src/myscripts

# WORKDIR /usr/local/src/myscripts


# EXPOSE 8000
# ENTRYPOINT ["R", "-e", "pr <- plumber::plumb(commandArgs()[4]); pr$run(host='0.0.0.0', port=8000)"]

CMD ["/usr/local/src/myscripts/plumberDocker.R"]
