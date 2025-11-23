import { Component, AfterViewInit, ElementRef, ViewChild, OnDestroy, Input, OnChanges, SimpleChanges } from '@angular/core';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import XYZ from 'ol/source/XYZ';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import { Icon, Style, Text, Fill, Stroke, Circle as CircleStyle } from 'ol/style';
import { fromLonLat } from 'ol/proj';
import { defaults as defaultControls } from 'ol/control';
import { LocationPoint, Store } from '../../models/store.model';
// @ts-ignore - ol-ext may not have TypeScript definitions
import AnimatedCluster from 'ol-ext/layer/AnimatedCluster';

@Component({
  selector: 'app-map',
  standalone: true,
  template: `<div id="map" #mapContainer></div>`,
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements AfterViewInit, OnDestroy, OnChanges {
  @ViewChild('mapContainer') mapContainer!: ElementRef;
  @Input() vendorLocations: Store[] = [];
  @Input() userLocation?: LocationPoint | null;

  map!: Map;
  vendorLayer!: VectorLayer<VectorSource>;
  userLocationLayer!: VectorLayer<VectorSource>;
  vendorSource!: VectorSource;
  userLocationSource!: VectorSource;

  private readonly MIN_ZOOM_FOR_MARKERS = 12; // Hide markers when zoomed out below this level
  private readonly ICON_BASE_SCALE = 0.08; // Base scale for vendor icons
  private readonly USER_ICON_SCALE = 0.06; // Scale for user location icon

  ngAfterViewInit(): void {
    this.initializeMap();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['vendorLocations'] && this.map) {
      this.updateVendorMarkers();
    }
    if (changes['userLocation'] && this.map) {
      this.updateUserLocationMarker();
    }
  }

  private initializeMap(): void {
    // Default center: Jakarta
    const center = fromLonLat([106.816, -6.200]);

    // Vector source for vendor markers
    this.vendorSource = new VectorSource({
      features: []
    });

    // Animated cluster layer for vendors
    const clusterSource = new AnimatedCluster({
      distance: 40, // Distance in pixels for clustering
      source: this.vendorSource,
      animationDuration: 700
    });

    this.vendorLayer = new VectorLayer({
      source: clusterSource,
      style: (feature: any) => this.getClusterStyle(feature)
    });

    // User location layer (no clustering)
    this.userLocationSource = new VectorSource({
      features: []
    });

    this.userLocationLayer = new VectorLayer({
      source: this.userLocationSource,
      style: this.getUserLocationStyle()
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
      layers: [rasterLayer, this.vendorLayer, this.userLocationLayer],
      view: new View({
        center: center,
        zoom: 15,
      }),
      // Remove all default controls
      controls: defaultControls({
        zoom: false,
        rotate: false,
        attribution: true // Keep attribution but we'll style it
      })
    });

    // Add zoom change listener to hide/show markers
    this.map.getView().on('change:resolution', () => {
      this.updateLayerVisibility();
    });

    // Update markers if we already have data
    if (this.vendorLocations.length > 0) {
      this.updateVendorMarkers();
    }
    if (this.userLocation) {
      this.updateUserLocationMarker();
    }
  }

  private updateLayerVisibility(): void {
    const zoom = this.map.getView().getZoom();
    if (zoom !== undefined) {
      // Hide vendor markers when zoomed out too far
      this.vendorLayer.setVisible(zoom >= this.MIN_ZOOM_FOR_MARKERS);
    }
  }

  private getVendorIconScale(): number {
    const zoom = this.map.getView().getZoom() || 15;
    // Scale icon based on zoom level - larger when zoomed in
    const scaleFactor = Math.pow(1.15, zoom - 15); // Grows/shrinks exponentially with zoom
    return this.ICON_BASE_SCALE * scaleFactor;
  }

  private getClusterStyle(feature: any): Style | Style[] {
    const features = feature.get('features');
    const size = features ? features.length : 0;

    if (size > 1) {
      // Cluster style - show count
      return new Style({
        image: new CircleStyle({
          radius: 20 + Math.min(size * 2, 20), // Scale circle with cluster size
          fill: new Fill({
            color: '#8B4513' // Brown color for gerobak
          }),
          stroke: new Stroke({
            color: '#FFF',
            width: 3
          })
        }),
        text: new Text({
          text: size.toString(),
          fill: new Fill({
            color: '#FFF'
          }),
          font: 'bold 14px sans-serif'
        })
      });
    } else {
      // Single vendor marker
      return new Style({
        image: new Icon({
          anchor: [0.5, 1], // Anchor at bottom center
          src: 'assets/gerobak-icon-brown-nobg.png',
          scale: this.getVendorIconScale()
        })
      });
    }
  }

  private getUserLocationStyle(): Style {
    return new Style({
      image: new Icon({
        anchor: [0.5, 0.5], // Center anchor for location pin
        src: 'assets/location-pin.png',
        scale: this.USER_ICON_SCALE
      })
    });
  }

  private updateVendorMarkers(): void {
    if (!this.vendorSource) return;

    // Clear existing markers
    this.vendorSource.clear();

    // Add new markers
    this.vendorLocations.forEach(store => {
      if (store.currentLocation) {
        const feature = new Feature({
          geometry: new Point(fromLonLat([
            store.currentLocation.lon,
            store.currentLocation.lat
          ])),
          store: store // Attach store data to feature for future use (e.g., click events)
        });

        this.vendorSource.addFeature(feature);
      }
    });

    // Update visibility based on current zoom
    this.updateLayerVisibility();
  }

  private updateUserLocationMarker(): void {
    if (!this.userLocationSource) return;

    // Clear existing user marker
    this.userLocationSource.clear();

    if (this.userLocation) {
      const feature = new Feature({
        geometry: new Point(fromLonLat([
          this.userLocation.lon,
          this.userLocation.lat
        ]))
      });

      this.userLocationSource.addFeature(feature);

      // Center map on user location
      this.map.getView().animate({
        center: fromLonLat([this.userLocation.lon, this.userLocation.lat]),
        zoom: 15,
        duration: 1000
      });
    }
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.setTarget(undefined);
    }
  }
}
