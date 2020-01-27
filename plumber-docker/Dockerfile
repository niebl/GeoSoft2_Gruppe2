FROM trestletech/plumber

#RUN apt-get update -qq && apt-get install -y \
#  git-core \
#  libssl-dev \
#  libcurl4-gnutls-dev

## RUN R -e 'install.packages(c("devtools"))'
## RUN R -e 'devtools::install_github("trestletech/plumber")'

# this may take a while

#RUN install2.r plumber
RUN R -e 'install.packages(c("plumber","grid","spatstat","rdwd","stars","utils","base","sf","RCurl","rgdal","sp","raster","geojsonsf","jsonlite","maptools","dwdradar","tm","wordcloud","fasterize","httr","geojsonR","ggplot2"))'

COPY . /usr/local/src/myscripts

# WORKDIR /usr/local/src/myscripts


# EXPOSE 8000
# ENTRYPOINT ["R", "-e", "pr <- plumber::plumb(commandArgs()[4]); pr$run(host='0.0.0.0', port=8000)"]

CMD ["/usr/local/src/myscripts/plumberDocker.R"]
