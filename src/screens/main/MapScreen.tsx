import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Platform, ScrollView, TextInput, Animated } from 'react-native';
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
import { useNavigation } from '@react-navigation/native';
// Initialize MapTiler (Open Source Map Provider)
// MapTiler is API-compatible with Mapbox but supports open source projects
MapboxGL.setAccessToken(env.MAPTILER_API_KEY);

import { mapService } from '../../services/mapService';
import { reportService } from '../../services/reportService';
import { MapReport, MapBounds } from '../../types/api/map';
import { ReportDetail } from '../../types/api/report';

// ...

const MapScreen = () => {
  const [userLocation, setUserLocation] = useState<number[] | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<number>(-1);
  const [mapReports, setMapReports] = useState<MapReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [selectedReport, setSelectedReport] = useState<MapReport | null>(null);
  const [reportDetail, setReportDetail] = useState<ReportDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const cameraRef = useRef<MapboxGL.Camera>(null);
  const mapRef = useRef<MapboxGL.MapView>(null);
  const navigation = useNavigation();

  // Animation values
  const slideAnim = useRef(new Animated.Value(500)).current; // Start off-screen
  const backdropAnim = useRef(new Animated.Value(0)).current; // Start transparent

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

  const getCategoryIcon = (category: number): string => {
    const iconMap: { [key: number]: string } = {
      0: 'road-variant',        // Giao thông
      1: 'tree-outline',        // Môi trường
      2: 'fire',                // Cháy nổ
      3: 'trash-can-outline',   // Rác thải
      4: 'weather-pouring',     // Ngập lụt
      5: 'alert-circle',        // Khác
    };
    return iconMap[category] || 'alert-circle';
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

  // Fetch report detail when a marker is selected
  const fetchReportDetail = async (reportId: number) => {
    try {
      setLoadingDetail(true);
      const response = await reportService.getReportDetail(reportId);
      if (response.success) {
        setReportDetail(response.data);
      }
    } catch (error) {
      console.error('Error fetching report detail:', error);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleMarkerSelect = (report: MapReport) => {
    setSelectedReport(report);
    setReportDetail(null); // Reset detail
    fetchReportDetail(report.id);
  };

  const handleCloseSheet = () => {
    // Animate out
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 500,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(backdropAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setSelectedReport(null);
      setReportDetail(null);
    });
  };

  // Animate in when bottom sheet appears
  useEffect(() => {
    if (selectedReport) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 65,
          friction: 11,
          useNativeDriver: true,
        }),
        Animated.timing(backdropAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [selectedReport]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      <MapboxGL.MapView
        ref={mapRef}
        style={styles.map}
        styleURL={`https://api.maptiler.com/maps/019addc6-a6f6-7cd5-9fe2-83ad43280ca0/style.json?key=${env.MAPTILER_API_KEY}`}
        logoEnabled={false}
        attributionEnabled={false}
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

        <MapboxGL.Images
          images={{
            'traffic': require('../../assets/images/map_icons/traffic.png'),
            'environment': require('../../assets/images/map_icons/environment.png'),
            'fire': require('../../assets/images/map_icons/fire.png'),
            'trash': require('../../assets/images/map_icons/trash.png'),
            'flood': require('../../assets/images/map_icons/flood.png'),
            'default': require('../../assets/images/map_icons/default.png'),
          }}
        />
        <MapboxGL.ShapeSource
          id="reportsSource"
          cluster={true}
          clusterRadius={50}
          clusterMaxZoomLevel={14}
          shape={{
            type: 'FeatureCollection',
            features: mapReports.map(report => ({
              type: 'Feature',
              id: report.id.toString(),
              geometry: {
                type: 'Point',
                coordinates: [report.kinh_do, report.vi_do],
              },
              properties: report,
            })),
          }}
          onPress={(event) => {
            const feature = event.features[0];
            if (feature && feature.properties) {
              if (feature.properties.cluster) {
                // Handle cluster press - zoom in
                if (cameraRef.current) {
                  const geometry = feature.geometry as any; // Cast to any or specific Point type if available
                  const center = geometry.coordinates;
                  cameraRef.current.setCamera({
                    centerCoordinate: center,
                    zoomLevel: 16, // Zoom in to separate
                    animationDuration: 500,
                  });
                }
              } else {
                // Handle individual marker press
                handleMarkerSelect(feature.properties as MapReport);
              }
            }
          }}
        >
          {/* Clusters */}
          <MapboxGL.SymbolLayer
            id="pointCount"
            style={{
              textField: ['get', 'point_count'],
              textSize: 12,
              textColor: '#ffffff',
              textIgnorePlacement: false,
              textAllowOverlap: false,
            }}
          />

          <MapboxGL.CircleLayer
            id="clusteredPoints"
            belowLayerID="pointCount"
            filter={['has', 'point_count']}
            style={{
              circlePitchAlignment: 'map',
              circleColor: theme.colors.primary,
              circleRadius: 20,
              circleOpacity: 0.7,
              circleStrokeWidth: 2,
              circleStrokeColor: 'white',
            }}
          />

          {/* Individual Markers */}
          <MapboxGL.SymbolLayer
            id="reportsLayer"
            filter={['!', ['has', 'point_count']]}
            style={{
              iconImage: [
                'match',
                ['get', 'danh_muc'],
                0, 'traffic',       // Giao thông
                1, 'environment',   // Môi trường
                2, 'fire',          // Cháy nổ
                3, 'trash',         // Rác thải
                4, 'flood',         // Ngập lụt
                'default'           // Default
              ],
              iconSize: 0.08,
              iconAllowOverlap: true,
              iconAnchor: 'bottom',
            }}
          />
        </MapboxGL.ShapeSource>
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
            <TouchableOpacity onPress={fetchMapReports} style={styles.iconButton}>
              <Icon name="refresh" size={ICON_SIZE.md} color={theme.colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
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

        {/* <TouchableOpacity
          style={[styles.fabButton, styles.reportButton]}
          activeOpacity={0.8}
        >
          <Icon name="plus" size={ICON_SIZE.lg} color={theme.colors.white} />
          <Text style={styles.reportButtonText}>Báo cáo</Text>
        </TouchableOpacity> */}
      </View>

      {/* Report Detail Bottom Sheet */}
      {selectedReport && (
        <>
          {/* Backdrop */}
          <Animated.View
            style={[
              styles.backdrop,
              {
                opacity: backdropAnim,
              }
            ]}
          >
            <TouchableOpacity
              style={StyleSheet.absoluteFill}
              activeOpacity={1}
              onPress={handleCloseSheet}
            />
          </Animated.View>

          <Animated.View
            style={[
              styles.bottomSheet,
              {
                transform: [{ translateY: slideAnim }],
              }
            ]}
          >
            <View style={styles.sheetHandle} />

            <View style={styles.sheetHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.sheetTitle} numberOfLines={2}>
                  {selectedReport.tieu_de}
                </Text>
                <Text style={styles.sheetId}>#{selectedReport.id}</Text>
              </View>
              <TouchableOpacity onPress={handleCloseSheet}>
                <Icon name="close" size={ICON_SIZE.md} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.sheetScroll}
              contentContainerStyle={styles.sheetScrollContent}
              showsVerticalScrollIndicator={false}
            >
              {/* Badges */}
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

              {loadingDetail ? (
                <View style={styles.detailLoading}>
                  <Text style={styles.detailLoadingText}>Đang tải thông tin...</Text>
                </View>
              ) : reportDetail ? (
                <>
                  {/* Description */}
                  {reportDetail.mo_ta && (
                    <View style={styles.detailSection}>
                      <Text style={styles.detailLabel}>Mô tả</Text>
                      <Text style={styles.detailText} numberOfLines={3}>
                        {reportDetail.mo_ta}
                      </Text>
                    </View>
                  )}

                  {/* Address & Time */}
                  <View style={styles.detailSection}>
                    <View style={styles.detailRow}>
                      <Icon name="map-marker" size={16} color={theme.colors.textSecondary} />
                      <Text style={styles.detailTextSmall} numberOfLines={1}>
                        {reportDetail.dia_chi}
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Icon name="clock-outline" size={16} color={theme.colors.textSecondary} />
                      <Text style={styles.detailTextSmall}>
                        {new Date(reportDetail.created_at).toLocaleDateString('vi-VN', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </Text>
                    </View>
                  </View>

                  {/* Stats */}
                  <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                      <Icon name="thumb-up-outline" size={18} color={theme.colors.success} />
                      <Text style={styles.statText}>{reportDetail.luot_ung_ho}</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Icon name="thumb-down-outline" size={18} color={theme.colors.error} />
                      <Text style={styles.statText}>{reportDetail.luot_khong_ung_ho || 0}</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Icon name="eye-outline" size={18} color={theme.colors.textSecondary} />
                      <Text style={styles.statText}>{reportDetail.luot_xem}</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Icon name="comment-outline" size={18} color={theme.colors.textSecondary} />
                      <Text style={styles.statText}>{reportDetail.comments?.length || 0}</Text>
                    </View>
                  </View>

                  {/* Comments */}
                  {reportDetail.comments && reportDetail.comments.length > 0 && (
                    <View style={styles.commentsSection}>
                      <Text style={styles.commentsTitle}>
                        Bình luận ({reportDetail.comments.length})
                      </Text>
                      {reportDetail.comments.slice(0, 3).map((comment) => (
                        <View key={comment.id} style={styles.commentItem}>
                          <View style={styles.commentHeader}>
                            <View style={styles.commentAvatar}>
                              <Text style={styles.commentAvatarText}>
                                {comment.user.ho_ten.charAt(0)}
                              </Text>
                            </View>
                            <View style={{ flex: 1 }}>
                              <Text style={styles.commentUser}>{comment.user.ho_ten}</Text>
                              <Text style={styles.commentTime}>
                                {new Date(comment.created_at || comment.ngay_tao || '').toLocaleDateString('vi-VN')}
                              </Text>
                            </View>
                          </View>
                          <Text style={styles.commentText} numberOfLines={2}>
                            {comment.noi_dung}
                          </Text>
                        </View>
                      ))}
                      {reportDetail.comments.length > 3 && (
                        <Text style={styles.moreComments}>
                          +{reportDetail.comments.length - 3} bình luận khác
                        </Text>
                      )}
                    </View>
                  )}
                </>
              ) : null}

              {/* Action Buttons */}
              <View style={styles.sheetActions}>
                <TouchableOpacity
                  style={styles.sheetButton}
                  onPress={() => {
                    // Navigate to detail screen
                    handleCloseSheet();
                    navigation.navigate('ReportDetail', { id: selectedReport.id, reportId: selectedReport.id });
                  }}
                >
                  <Icon name="information-outline" size={ICON_SIZE.md} color={theme.colors.primary} />
                  <Text style={styles.sheetButtonText}>Xem chi tiết</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.sheetButton}>
                  <Icon name="share-variant-outline" size={ICON_SIZE.md} color={theme.colors.primary} />
                  <Text style={styles.sheetButtonText}>Chia sẻ</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </Animated.View>
        </>
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
  iconButton: {
    padding: SPACING.xs,
    marginLeft: SPACING.xs,
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
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 100,
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
    zIndex: 101, // Above backdrop
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
  sheetScroll: {
    maxHeight: hp('50%'),
  },
  sheetScrollContent: {
    paddingBottom: SPACING.md,
    gap: SPACING.md,
  },
  detailLoading: {
    paddingVertical: SPACING.xl,
    alignItems: 'center',
  },
  detailLoadingText: {
    fontSize: FONT_SIZE.sm,
    color: theme.colors.textSecondary,
  },
  detailSection: {
    gap: SPACING.xs,
  },
  detailLabel: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
  },
  detailText: {
    fontSize: FONT_SIZE.md,
    color: theme.colors.text,
    lineHeight: 22,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailTextSmall: {
    fontSize: FONT_SIZE.sm,
    color: theme.colors.textSecondary,
    flex: 1,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.md,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: theme.colors.text,
  },
  commentsSection: {
    gap: SPACING.sm,
  },
  commentsTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: theme.colors.text,
  },
  commentItem: {
    backgroundColor: theme.colors.backgroundSecondary,
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    gap: SPACING.xs,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  commentAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  commentAvatarText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  commentUser: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: theme.colors.text,
  },
  commentTime: {
    fontSize: FONT_SIZE.xs,
    color: theme.colors.textSecondary,
  },
  commentText: {
    fontSize: FONT_SIZE.sm,
    color: theme.colors.text,
    lineHeight: 20,
  },
  moreComments: {
    fontSize: FONT_SIZE.xs,
    color: theme.colors.primary,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
});

export default MapScreen;


