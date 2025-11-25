import { Component, AfterViewInit, ElementRef, ViewChild, OnDestroy, Input, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import XYZ from 'ol/source/XYZ';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point'
import Overlay from 'ol/Overlay';
import LineString from 'ol/geom/LineString';
import { Icon, Style, Text, Fill, Stroke, Circle as CircleStyle } from 'ol/style';
import { fromLonLat } from 'ol/proj';
import { defaults as defaultControls } from 'ol/control';
import { LocationPoint, Store } from '../../models/store.model';
// @ts-ignore - ol-ext may not have TypeScript definitions
import AnimatedCluster from 'ol-ext/layer/AnimatedCluster';
import { MapBrowserEvent } from 'ol';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div id="map" #mapContainer></div>
    <div id="map-popup" class="ol-popup">
      <div class="popup-content"></div>
    </div>
  `,
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements AfterViewInit, OnDestroy, OnChanges {
  @ViewChild('mapContainer') mapContainer!: ElementRef;
  @Input() vendorLocations: Store[] = [];
  @Input() userLocation?: LocationPoint | null;
  @Output() storeSelected = new EventEmitter<Store>();

  map!: Map;
  vendorLayer!: VectorLayer<VectorSource>;
  userLocationLayer!: VectorLayer<VectorSource>;
  routingLayer!: VectorLayer<VectorSource>;
  vendorSource!: VectorSource;
  userLocationSource!: VectorSource;
  routingSource!: VectorSource;

  private readonly MIN_ZOOM_FOR_MARKERS = 12; // Hide markers when zoomed out below this level
  private readonly ICON_BASE_SCALE = 0.08; // Base scale for vendor icons
  private readonly USER_ICON_SCALE = 0.06; // Scale for user location icon

  private popupOverlay!: Overlay;

  // Trackers for pin styles and popup
  private hoveredFeature: any = null;
  private clickedFeature: any = null;

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

    // AnimatedCluster is a LAYER, not a source!
    this.vendorLayer = new AnimatedCluster({
      name: 'Vendor Cluster',
      source: this.vendorSource,
      distance: 40, // Distance in pixels for clustering
      animationDuration: 700,
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

    // Routing layer
    this.routingSource = new VectorSource({
      features: []
    });

    this.routingLayer = new VectorLayer({
      source: this.routingSource,
      style: this.getRouteStyle(),
      zIndex: 100 // Ensure route is above other layers
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
      layers: [rasterLayer, this.routingLayer, this.vendorLayer, this.userLocationLayer],
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

    // Create popup overlay
    const popupElement = document.getElementById('map-popup');
    if (popupElement) {
      this.popupOverlay = new Overlay({
        element: popupElement,
        autoPan: false,
        positioning: 'bottom-center',
        offset: [0, -10]
      });
      this.map.addOverlay(this.popupOverlay);
    }

    // Add click handler for pins - WORKING VERSION
    this.map.on('click', (evt: MapBrowserEvent<any>) => {
      console.log('🗺️ Map clicked');

      const feature = this.map.forEachFeatureAtPixel(evt.pixel, (feat) => feat, {
        layerFilter: (layer) => layer === this.vendorLayer
      });

      if (!feature) {
        console.log('❌ No feature clicked');
        return;
      }

      console.log('✅ Feature clicked');
      this.clickedFeature = feature;

      // Get store object from features
      const store = feature.get('store') as Store;

      if (store) {
        console.log('🏪 Emitting store:', store.name);
        this.storeSelected.emit(store);
      } else {
        console.warn('⚠️ Feature has no store property:', feature.getProperties());
      }
    });

    // Add hover handler for tooltip (desktop only)
    this.map.on('pointermove', (evt: MapBrowserEvent<any>) => {
      // Check if desktop (width >= 769px)
      if (window.innerWidth < 769) return;

      const feature = this.map.forEachFeatureAtPixel(evt.pixel, (feat) => feat, {
        layerFilter: (layer) => layer === this.vendorLayer
      });

      if (feature && feature !== this.hoveredFeature) {
        // New feature hovered
        this.hoveredFeature = feature;
        const store = feature.get('store') as Store;

        if (store) {
          // Update popup content
          const popup = document.getElementById('map-popup');
          const content = popup?.querySelector('.popup-content');

          if (content) {
            content.innerHTML = `
            <h4>${store.name}</h4>
            <div class="rating">⭐ ${store.rating.toFixed(1)}</div>
            <div class="hours">${store.openTime} - ${store.closeTime}</div>
            `;
          }

          // Show popup at feature location
          const geometry = feature.getGeometry();
          const coordinates = geometry ? (geometry as Point).getCoordinates() : null;

          if (coordinates && this.popupOverlay) {
            this.popupOverlay.setPosition(coordinates);
            if (popup) popup.style.display = 'block';
          }
        }

        // Refresh layer to update pin color
        this.vendorSource.changed();

      } else if (!feature && this.hoveredFeature) {
        // Mouse left all features
        this.hoveredFeature = null;

        const popup = document.getElementById('map-popup');
        if (popup) popup.style.display = 'none';

        // Refresh layer to reset pin color
        this.vendorSource.changed();
      }

      // Change cursor on hover
      const target = this.map.getTarget();
      if (target && typeof target !== 'string') {
        (target as HTMLElement).style.cursor = feature ? 'pointer' : '';
      }
    });
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

      const isHovered = this.hoveredFeature === feature;
      const isClicked = this.clickedFeature === feature;

      return new Style({
        image: new Icon({
          anchor: [0.5, 1],
          src: 'assets/gerobak-icon-brown-nobg.png',
          scale: this.getVendorIconScale(),

          // Change color on hover or click
          color: (isHovered || isClicked) ? '#FBBE21' : undefined
        })
      })
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

  private getRouteStyle(): Style {
    return new Style({
      stroke: new Stroke({
        color: '#FFB300', // Orange-yellow color that contrasts with light map
        width: 5,
        lineCap: 'round',
        lineJoin: 'round'
      })
    });
  }

  /**
   * Display a route on the map
   * @param coordinates Array of [lon, lat] coordinates
   */
  displayRoute(coordinates: [number, number][]): void {
    if (!this.routingSource) return;

    // Clear existing route
    this.routingSource.clear();

    // Convert coordinates to map projection and create LineString
    const projectedCoords = coordinates.map(coord => fromLonLat(coord));
    const routeLine = new LineString(projectedCoords);

    const routeFeature = new Feature({
      geometry: routeLine
    });

    this.routingSource.addFeature(routeFeature);

    // Fit map to show entire route
    this.map.getView().fit(routeLine.getExtent(), {
      padding: [50, 50, 50, 50],
      duration: 1000
    });
  }

  /**
   * Clear the current route from the map
   */
  clearRoute(): void {
    if (this.routingSource) {
      this.routingSource.clear();
    }
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.setTarget(undefined);
    }
  }
}
