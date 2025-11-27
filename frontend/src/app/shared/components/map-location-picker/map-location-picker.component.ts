import { Component, Output, EventEmitter, AfterViewInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import { fromLonLat, toLonLat } from 'ol/proj';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { Style, Icon } from 'ol/style';
import { XYZ } from 'ol/source';
@Component({
    selector: 'app-map-location-picker',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './map-location-picker.component.html',
    styleUrl: './map-location-picker.component.scss'
})
export class MapLocationPickerComponent implements AfterViewInit {
    @Input() initialLat = -6.2088;
    @Input() initialLon = 106.8456;
    @Output() locationSelected = new EventEmitter<{ lat: number; lon: number }>();

    private map!: Map;
    private marker!: VectorLayer<VectorSource>;
    latitude = -6.2088;
    longitude = 106.8456;

    ngAfterViewInit(): void {
        this.latitude = this.initialLat;
        this.longitude = this.initialLon;
        this.initMap();
    }

    initMap(): void {
        // Create marker
        const markerFeature = new Feature({
            geometry: new Point(fromLonLat([this.longitude, this.latitude]))
        });
        this.marker = new VectorLayer({
            source: new VectorSource({
                features: [markerFeature]
            }),
            style: new Style({
                image: new Icon({
                    src: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="48" viewBox="0 0 32 48"><path fill="%238B4513" d="M16 0C7.2 0 0 7.2 0 16c0 12 16 32 16 32s16-20 16-32C32 7.2 24.8 0 16 0zm0 24c-4.4 0-8-3.6-8-8s3.6-8 8-8 8 3.6 8 8-3.6 8-8 8z"/></svg>',
                    scale: 1,
                    anchor: [0.5, 1]
                })
            })
        });

        // Create map
        this.map = new Map({
            target: 'location-picker-map',
            layers: [
                new TileLayer({
                    source: new XYZ({
                        url: 'https://{1-4}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png'
                    })
                }),
                this.marker
            ],
            view: new View({
                center: fromLonLat([this.longitude, this.latitude]),
                zoom: 15
            })
        });

        // Click to set location
        this.map.on('click', (event) => {
            const coords = toLonLat(event.coordinate);
            this.updateLocation(coords[1], coords[0]);
        });
    }

    updateLocation(lat: number, lon: number): void {
        this.latitude = lat;
        this.longitude = lon;

        // Update marker
        const markerFeature = new Feature({
            geometry: new Point(fromLonLat([lon, lat]))
        });
        this.marker.getSource()?.clear();
        this.marker.getSource()?.addFeature(markerFeature);

        // Center map
        this.map.getView().setCenter(fromLonLat([lon, lat]));

        // Emit event
        this.locationSelected.emit({ lat, lon });
    }

    useCurrentLocation(): void {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    this.updateLocation(position.coords.latitude, position.coords.longitude);
                },
                (error) => {
                    console.error('Geolocation error:', error);
                    alert('Unable to get your location. Please click on the map to set location manually.');
                }
            );
        } else {
            alert('Geolocation is not supported by your browser');
        }
    }
}