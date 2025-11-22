import { Component, AfterViewInit, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import XYZ from 'ol/source/XYZ';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import { Icon, Style } from 'ol/style';
import { fromLonLat } from 'ol/proj';
import { defaults as defaultControls, Zoom } from 'ol/control';

@Component({
  selector: 'app-map',
  template: `<div id="map" #mapContainer></div>`,
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements AfterViewInit, OnDestroy {
  @ViewChild('mapContainer') mapContainer!: ElementRef;
  map!: Map;

  ngAfterViewInit(): void {
    // Coordinates for Jakarta (approximate based on previous code: -6.200, 106.816)
    const center = fromLonLat([106.816, -6.200]);

    // Marker Feature
    const markerFeature = new Feature({
      geometry: new Point(center),
    });

    const markerStyle = new Style({
      image: new Icon({
        anchor: [0.5, 1], // Anchor at bottom center
        src: 'assets/location-pin.png',
        scale: 0.5, // Adjust scale if the image is too large
      }),
    });

    markerFeature.setStyle(markerStyle);

    const vectorSource = new VectorSource({
      features: [markerFeature],
    });

    const vectorLayer = new VectorLayer({
      source: vectorSource,
    });

    // CartoDB Light Basemap
    const rasterLayer = new TileLayer({
      source: new XYZ({
        url: 'https://{a-d}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
        attributions: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      }),
    });

    this.map = new Map({
      target: this.mapContainer.nativeElement,
      layers: [rasterLayer, vectorLayer],
      view: new View({
        center: center,
        zoom: 15,
      }),
      controls: defaultControls({ zoom: false }).extend([
        new Zoom({
          className: 'custom-zoom-control', // We can style this if needed, or just use default
        })
      ]),
    });
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.setTarget(undefined);
    }
  }
}
