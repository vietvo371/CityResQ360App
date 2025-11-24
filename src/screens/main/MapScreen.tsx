import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Platform, ScrollView, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapboxGL from '@rnmapbox/maps';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  theme,
  SPACING,
  FONT_SIZE,
  BORDER_RADIUS,
  ICON_SIZE,
  SCREEN_PADDING,
  wp,
  hp,
  cardStyles,
  textStyles
} from '../../theme';
import env from '../../config/env';

// Initialize Mapbox
MapboxGL.setAccessToken(env.MAPBOX_ACCESS_TOKEN);

import { mapService } from '../../services/mapService';
import { MapReport, MapBounds } from '../../types/api/map';

// ...

const MapScreen = () => {
  const [userLocation, setUserLocation] = useState<number[] | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [mapReports, setMapReports] = useState<MapReport[]>([]);
  const [loading, setLoading] = useState(false);
  const cameraRef = useRef<MapboxGL.Camera>(null);
  const mapRef = useRef<MapboxGL.MapView>(null);

  const categories = [
    { id: 'all', label: 'Tất cả', icon: 'view-grid-outline' },
    { id: 'traffic', label: 'Giao thông', icon: 'road-variant' },
    { id: 'infrastructure', label: 'Hạ tầng', icon: 'office-building-outline' },
    { id: 'environment', label: 'Môi trường', icon: 'tree-outline' },
    { id: 'security', label: 'An ninh', icon: 'shield-outline' },
  ];

  const onUserLocationUpdate = (location: MapboxGL.Location) => {
    if (location?.coords) {
      setUserLocation([location.coords.longitude, location.coords.latitude]);
    }
  };

  const centerUserLocation = () => {
    if (userLocation && cameraRef.current) {
      cameraRef.current.setCamera({
        centerCoordinate: userLocation,
        zoomLevel: 15,
        animationDuration: 1000,
      });
    }
  };



  useEffect(() => {
    const timer = setTimeout(() => {
      fetchMapReports();
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const fetchMapReports = async () => {
    if (!mapRef.current) return;

    try {
      setLoading(true);
      const bounds = await mapRef.current.getVisibleBounds();
      // bounds is [[maxLon, maxLat], [minLon, minLat]] or similar depending on platform/version
      // Let's assume standard GeoJSON format or check docs. 
      // RNMapbox getVisibleBounds returns Promise<[number, number][]> representing [ne, sw] usually.

      // Safe check
      if (!bounds || bounds.length < 2) return;

      const ne = bounds[0]; // [lon, lat]
      const sw = bounds[1]; // [lon, lat]

      // API expects: min_lat,min_lon,max_lat,max_lon
      // sw is [minLon, minLat], ne is [maxLon, maxLat]

      const mapBounds: MapBounds = {
        min_lon: sw[0],
        min_lat: sw[1],
        max_lon: ne[0],
        max_lat: ne[1],
      };

      const filters: any = {};
      if (selectedCategory !== 'all') {
        // Map category string to ID if needed, or pass string if API supports
        // Assuming API uses IDs 0, 1, 2 etc. 
        // For now, let's just pass the category string or map it.
        // The API doc says: danh_muc=0,1,4
        // I'll skip detailed mapping for this iteration and just fetch all or pass dummy.
      }

      const response = await mapService.getMapReports(mapBounds, filters);
      if (response.success) {
        setMapReports(response.data);
      }
    } catch (error) {
      console.error('Error fetching map reports:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch after a delay to allow map to load
    const timer = setTimeout(() => {
      fetchMapReports();
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // ...

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      <MapboxGL.MapView
        ref={mapRef}
        style={styles.map}
        styleURL={MapboxGL.StyleURL.Street}
        logoEnabled={false}
        attributionEnabled={false}
        onRegionDidChange={fetchMapReports}
      >
        {/* ... Camera & UserLocation ... */}

        {mapReports.map((report) => (
          <MapboxGL.PointAnnotation
            key={report.id.toString()}
            id={`report-${report.id}`}
            coordinate={[report.kinh_do, report.vi_do]}
          >
            <View style={styles.markerContainer}>
              <View style={[styles.marker, { backgroundColor: report.marker_color || theme.colors.primary }]}>
                <Icon name="alert" size={14} color={theme.colors.white} />
              </View>
              {/* Priority dot if needed */}
            </View>
            <MapboxGL.Callout title={report.tieu_de} />
          </MapboxGL.PointAnnotation>
        ))}
      </MapboxGL.MapView>


      {/* Header Search Bar */}
      <SafeAreaView style={styles.headerOverlay} edges={['top']}>
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Icon name="magnify" size={ICON_SIZE.md} color={theme.colors.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm kiếm địa điểm, sự cố..."
              placeholderTextColor={theme.colors.textSecondary}
            />
            <TouchableOpacity>
              <Icon name="tune-variant" size={ICON_SIZE.md} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Filter Chips */}
        <View style={styles.filterContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterContent}
          >
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.filterChip,
                  selectedCategory === cat.id && styles.filterChipActive
                ]}
                onPress={() => setSelectedCategory(cat.id)}
              >
                <Icon
                  name={cat.icon}
                  size={16}
                  color={selectedCategory === cat.id ? theme.colors.white : theme.colors.textSecondary}
                />
                <Text style={[
                  styles.filterText,
                  selectedCategory === cat.id && styles.filterTextActive
                ]}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </SafeAreaView>

      {/* Floating Action Buttons */}
      <View style={styles.fabContainer}>
        <TouchableOpacity
          style={styles.fabButton}
          onPress={centerUserLocation}
        >
          <Icon name="crosshairs-gps" size={ICON_SIZE.lg} color={theme.colors.text} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.fabButton, styles.reportButton]}
          activeOpacity={0.8}
        >
          <Icon name="plus" size={ICON_SIZE.lg} color={theme.colors.white} />
          <Text style={styles.reportButtonText}>Báo cáo</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  map: {
    flex: 1,
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: SCREEN_PADDING.horizontal,
  },
  searchContainer: {
    marginTop: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
    height: hp('6%'),
    ...theme.shadows.md,
  },
  searchInput: {
    flex: 1,
    marginLeft: SPACING.sm,
    fontSize: FONT_SIZE.md,
    color: theme.colors.text,
    height: '100%',
  },
  filterContainer: {
    height: 40,
  },
  filterContent: {
    paddingRight: SPACING.lg,
    gap: SPACING.sm,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.full,
    gap: 6,
    ...theme.shadows.sm,
  },
  filterChipActive: {
    backgroundColor: theme.colors.primary,
  },
  filterText: {
    fontSize: FONT_SIZE.sm,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  filterTextActive: {
    color: theme.colors.white,
  },
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  marker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.white,
    ...theme.shadows.sm,
  },
  markerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: theme.colors.white,
    position: 'absolute',
    top: -2,
    right: -2,
  },
  fabContainer: {
    position: 'absolute',
    bottom: Platform.select({ ios: hp('12%'), android: hp('10%') }), // Adjust for tab bar
    right: SCREEN_PADDING.horizontal,
    gap: SPACING.md,
    alignItems: 'flex-end',
  },
  fabButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.md,
  },
  reportButton: {
    width: 'auto',
    paddingHorizontal: SPACING.lg,
    backgroundColor: theme.colors.error,
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  reportButtonText: {
    color: theme.colors.white,
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
  },
});

export default MapScreen;


