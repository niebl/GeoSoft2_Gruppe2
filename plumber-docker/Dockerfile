FROM trestletech/plumber

#RUN apt-get update -qq && apt-get install -y \
#  git-core \
#  libssl-dev \
#  libcurl4-gnutls-dev \


#the following is somehow needed for some libraries

#fix as found here: https://github.com/rstudio/plumber/issues/459#issuecomment-509969315
RUN echo 'deb http://deb.debian.org/debian bullseye main' > /etc/apt/sources.list
RUN apt-get update

RUN apt-get install software-properties-common -y
RUN apt-get install -y libxml2-dev
RUN apt-get install -y libudunits2-dev


# RUN add-apt-repository -y ppa:ubuntugis/ppa && apt-get update &&\
RUN    apt-get install -y libgdal-dev

# this may take up to 20 minutes

#RUN install2.r plumber
RUN R -e 'install.packages(c("plumber","grid","spatstat","rdwd","stars","utils","base","sf","RCurl","rgdal","sp","raster","geojsonsf","jsonlite","maptools","dwdradar","tm","wordcloud","fasterize","httr","geojsonR","ggplot2"))'
RUN R -e 'install.packages("stars")'
RUN R -e 'install.packages("sf")'
RUN R -e 'install.packages("rgdal")'
RUN R -e 'install.packages("tm")'
RUN R -e 'install.packages("lubridate")'
RUN R -e 'install.packages("anytime")'

COPY . /usr/local/src/myscripts

# WORKDIR /usr/local/src/myscripts


# EXPOSE 8000
# ENTRYPOINT ["R", "-e", "pr <- plumber::plumb(commandArgs()[4]); pr$run(host='0.0.0.0', port=8000)"]

CMD ["/usr/local/src/myscripts/plumber.R"]
