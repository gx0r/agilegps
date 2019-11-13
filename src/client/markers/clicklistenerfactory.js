"use strict";
/* Copyright (c) 2016 Grant Miner */
const t = require("../i18n").translate;
const TheMap = require("../map");
const m = require("mithril");
const moment = require("moment");
const Status = require("../../common/status");
const hidenan = require("../../common/hidenan");
const tomiles = require("../tomiles");
const isUserMetric = require("../isUserMetric");
const appState = require("../appState");
const _ = require("lodash");
let lastinfowindow;

function closeInfoWindow() {
  if (lastinfowindow) lastinfowindow.close();
}
module.exports.closeInfoWindow = closeInfoWindow;

module.exports.create = function(marker, item, position) {
  return function() {
    if (!item.last) {
      item.last = _.cloneDeep(item);
    }

    const map = TheMap.getMap();
    map.setCenter(position);
    const el = document.createElement("div");
    let mapel;

    m.render(el, [
      m(
        "div",
        m(
          "a",
          {
            onclick: function(ev) {
              appState.selectVehicleByID(item.id);
              ev.preventDefault();
            }
          },
          item.name
        )
      ),
      m("div", {
        config: function(el) {
          mapel = el;
        },
        style: "height:130px;width:360px"
      }),
      m("div", [
        m(
          "div",
          {
            style: {
              color: Status.getStatusColor(item)
            }
          },
          t(Status.getStatus(item))
        ),
        " " +
          hidenan(tomiles(item.last.s)) +
          " " +
          (isUserMetric() ? t("km/h") : t("mph")),
        m(
          "div",
          {
            style: {
              float: "right"
            }
          },
          moment(item.last.d).format("M/DD/YYYY h:mm:ss A")
        ),
        m(
          "div",
          {
            style: {
              "text-align": "center"
            }
          },
          [
            t("Zoom in:") + " ",
            m(
              "a",
              {
                onclick: function() {
                  const center = new google.maps.LatLng(
                    item.last.la + 0.0003,
                    item.last.lo
                  );
                  map.setCenter(center);
                  map.setZoom(18);
                  map.setMapTypeId(google.maps.MapTypeId.ROADMAP);
                }
              },
              t("Road")
            ),
            " | ",
            m(
              "a",
              {
                onclick: function() {
                  const center = new google.maps.LatLng(
                    item.last.la + 0.0003,
                    item.last.lo
                  );
                  map.setCenter(center);
                  map.setZoom(18);
                  map.setMapTypeId(google.maps.MapTypeId.SATELLITE);
                }
              },
              t("Satellite")
            ),
            " | ",
            m(
              "a",
              {
                onclick: function() {
                  const center = new google.maps.LatLng(
                    item.last.la + 0.0003,
                    item.last.lo
                  );
                  map.setCenter(center);
                  map.setZoom(18);
                  map.setMapTypeId(google.maps.MapTypeId.HYBRID);
                }
              },
              t("Hybrid")
            ),
            " | ",
            m(
              "a",
              {
                onclick: function() {
                  const center = new google.maps.LatLng(
                    item.last.la + 0.0003,
                    item.last.lo
                  );
                  map.setCenter(center);
                  map.setZoom(18);
                  map.setMapTypeId(google.maps.MapTypeId.TERRAIN);
                }
              },
              t("Terrain")
            ),
            " "
          ]
        )
      ])
    ]);

    const streetViewService = new google.maps.StreetViewService();
    const STREETVIEW_MAX_DISTANCE = 100;
    const infowindow = new google.maps.InfoWindow({
      content: el
    });

    streetViewService.getPanoramaByLocation(
      position,
      STREETVIEW_MAX_DISTANCE,
      function(streetViewPanoramaData, status) {
        if (status === google.maps.StreetViewStatus.OK) {
          const pano = new google.maps.StreetViewPanorama(mapel, {
            pov: {
              heading: item.last.a,
              pitch: 0
            }
          });
          // pano.bindTo('position', marker); // this causes the marker to move to the streetview
          // pano.bindTo('position', streetViewPanoramaData.location);
          pano.setPosition(streetViewPanoramaData.location.latLng);
          pano.setVisible(true);

          google.maps.event.addListener(infowindow, "closeclick", function() {
            pano.unbind("position");
            pano.setVisible(false);
          });
        } else {
          mapel.style.display = "none";
        }
      }
    );

    closeInfoWindow();
    infowindow.open(map, this);
    lastinfowindow = infowindow;
  };
};
