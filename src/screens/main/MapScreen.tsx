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
  const [selectedCategory, setSelectedCategory] = useState<number>(-1);
  const [mapReports, setMapReports] = useState<MapReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [selectedReport, setSelectedReport] = useState<MapReport | null>(null);
  const cameraRef = useRef<MapboxGL.Camera>(null);
  const mapRef = useRef<MapboxGL.MapView>(null);

  const categories = [
    { id: -1, label: 'Tất cả', icon: 'view-grid-outline' },
    { id: 0, label: 'Giao thông', icon: 'road-variant' },
    { id: 1, label: 'Môi trường', icon: 'tree-outline' },
    { id: 2, label: 'Cháy nổ', icon: 'fire' },
    { id: 3, label: 'Rác thải', icon: 'trash-can-outline' },
    { id: 4, label: 'Ngập lụt', icon: 'weather-pouring' },
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

  const getCategoryName = (category: number): string => {
    const categories: { [key: number]: string } = {
      0: 'Giao thông',
      1: 'Môi trường',
      2: 'Cháy nổ',
      3: 'Rác thải',
      4: 'Ngập lụt',
      5: 'Khác',
    };
    return categories[category] || 'Khác';
  };

  const getStatusColor = (status: number): string => {
    switch (status) {
      case 0: return theme.colors.warning;
      case 1: return theme.colors.info;
      case 2: return theme.colors.info;
      case 3: return theme.colors.success;
      case 4: return theme.colors.error;
      default: return theme.colors.textSecondary;
    }
  };

  const getStatusLabel = (status: number): string => {
    switch (status) {
      case 0: return 'Tiếp nhận';
      case 1: return 'Đã xác minh';
      case 2: return 'Đang xử lý';
      case 3: return 'Hoàn thành';
      case 4: return 'Từ chối';
      default: return 'Khác';
    }
  };

  const fetchMapReports = async () => {
    if (!mapRef.current) return;

    try {
      setLoading(true);
      const bounds = await mapRef.current.getVisibleBounds();

      console.log('Raw bounds from Mapbox:', bounds);

      if (!bounds || bounds.length < 2) return;

      const ne = bounds[0]; // [lon, lat]
      const sw = bounds[1]; // [lon, lat]

      console.log('NE:', ne, 'SW:', sw);

      const mapBounds: MapBounds = {
        min_lon: sw[0],
        min_lat: sw[1],
        max_lon: ne[0],
        max_lat: ne[1],
      };

      console.log('MapBounds object:', mapBounds);

      const filters: any = {};
      if (selectedCategory !== -1) {
        filters.danh_muc = selectedCategory;
      }

      console.log('Calling API with filters:', filters);

      const response = await mapService.getMapReports(mapBounds, filters);
      console.log('Response:', response);

      if (response.success) {
        console.log('Setting map reports, count:', response.data?.length);
        setMapReports(response.data);
      } else {
        console.log('Response not successful:', response.message);
      }
    } catch (error) {
      console.error('Error fetching map reports:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch after map has loaded
    if (mapLoaded) {
      const timer = setTimeout(() => {
        fetchMapReports();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [mapLoaded]);

  // Re-fetch when category changes
  useEffect(() => {
    if (mapRef.current && mapLoaded) {
      fetchMapReports();
    }
  }, [selectedCategory]);

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
        onDidFinishLoadingMap={() => {
          console.log('Map finished loading');
          setMapLoaded(true);
        }}
      >
        <MapboxGL.Camera
          ref={cameraRef}
          zoomLevel={13}
          centerCoordinate={[106.7009, 10.7769]} // TP.HCM
          animationMode="flyTo"
          animationDuration={1000}
        />

        <MapboxGL.UserLocation
          visible={true}
          onUpdate={onUserLocationUpdate}
          showsUserHeadingIndicator
          minDisplacement={10}
        />

        {mapReports.map((report) => (
          <MapboxGL.PointAnnotation
            key={report.id.toString()}
            id={`report-${report.id}`}
            coordinate={[report.kinh_do, report.vi_do]}
            onSelected={() => setSelectedReport(report)}
          >
            <View style={styles.markerContainer}>
              <View style={[styles.marker, { backgroundColor: report.marker_color || theme.colors.primary }]}>
                <Icon name="alert" size={14} color={theme.colors.white} />
              </View>
              {/* Priority indicator */}
              {report.uu_tien >= 2 && (
                <View style={[styles.markerDot, { backgroundColor: report.uu_tien === 3 ? theme.colors.error : theme.colors.warning }]} />
              )}
            </View>
          </MapboxGL.PointAnnotation>
        ))}
      </MapboxGL.MapView>

      {/* Loading Indicator */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingBox}>
            <Text style={styles.loadingText}>Đang tải...</Text>
          </View>
        </View>
      )}


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

      {/* Report Detail Bottom Sheet */}
      {selectedReport && (
        <View style={styles.bottomSheet}>
          <View style={styles.sheetHandle} />

          <View style={styles.sheetHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.sheetTitle} numberOfLines={2}>
                {selectedReport.tieu_de}
              </Text>
              <Text style={styles.sheetId}>#{selectedReport.id}</Text>
            </View>
            <TouchableOpacity onPress={() => setSelectedReport(null)}>
              <Icon name="close" size={ICON_SIZE.md} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.sheetContent}>
            <View style={styles.sheetRow}>
              <View style={styles.sheetBadge}>
                <Icon name="tag-outline" size={16} color={theme.colors.primary} />
                <Text style={styles.sheetBadgeText}>
                  {selectedReport.danh_muc_text || getCategoryName(selectedReport.danh_muc)}
                </Text>
              </View>

              <View style={[styles.sheetBadge, {
                backgroundColor: getStatusColor(selectedReport.trang_thai) + '15'
              }]}>
                <Text style={[styles.sheetBadgeText, {
                  color: getStatusColor(selectedReport.trang_thai)
                }]}>
                  {getStatusLabel(selectedReport.trang_thai)}
                </Text>
              </View>
            </View>

            <View style={styles.sheetActions}>
              <TouchableOpacity
                style={styles.sheetButton}
                onPress={() => {
                  // Navigate to detail screen
                  setSelectedReport(null);
                }}
              >
                <Icon name="information-outline" size={ICON_SIZE.md} color={theme.colors.primary} />
                <Text style={styles.sheetButtonText}>Chi tiết</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.sheetButton}>
                <Icon name="directions" size={ICON_SIZE.md} color={theme.colors.primary} />
                <Text style={styles.sheetButtonText}>Chỉ đường</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.sheetButton}>
                <Icon name="share-variant-outline" size={ICON_SIZE.md} color={theme.colors.primary} />
                <Text style={styles.sheetButtonText}>Chia sẻ</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
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
  loadingOverlay: {
    position: 'absolute',
    top: Platform.select({ ios: hp('15%'), android: hp('13%') }),
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  loadingBox: {
    backgroundColor: theme.colors.white,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    ...theme.shadows.md,
  },
  loadingText: {
    fontSize: FONT_SIZE.sm,
    color: theme.colors.textSecondary,
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
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.white,
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    paddingTop: SPACING.sm,
    paddingHorizontal: SCREEN_PADDING.horizontal,
    paddingBottom: Platform.select({ ios: SPACING['2xl'], android: SPACING.xl }),
    ...theme.shadows.xl,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: theme.colors.borderLight,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: SPACING.md,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  sheetTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 4,
  },
  sheetId: {
    fontSize: FONT_SIZE.xs,
    color: theme.colors.textSecondary,
  },
  sheetContent: {
    gap: SPACING.md,
  },
  sheetRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  sheetBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primaryLight,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.md,
    gap: 4,
  },
  sheetBadgeText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  sheetActions: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  sheetButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SPACING.md,
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: BORDER_RADIUS.md,
    gap: 4,
  },
  sheetButtonText: {
    fontSize: FONT_SIZE.xs,
    color: theme.colors.primary,
    fontWeight: '600',
  },
});

export default MapScreen;


