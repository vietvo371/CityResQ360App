import React, { useState, useRef, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Image, Platform, Modal, Dimensions, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import MapboxGL from '@rnmapbox/maps';
import PageHeader from '../../component/PageHeader';
import InputCustom from '../../component/InputCustom';
import ButtonCustom from '../../component/ButtonCustom';
import ModalCustom from '../../component/ModalCustom';
import { theme, SPACING, FONT_SIZE, BORDER_RADIUS, SCREEN_PADDING, wp, hp } from '../../theme';
import { reportService } from '../../services/reportService';
import { mapService } from '../../services/mapService';
import { CreateReportRequest } from '../../types/api/report';
import env from '../../config/env';

// Initialize Mapbox
MapboxGL.setAccessToken(env.MAPBOX_ACCESS_TOKEN);

// Category options matching API
const CATEGORIES = [
  { value: 0, label: 'Giao thông', icon: 'car', color: theme.colors.primary },
  { value: 1, label: 'Môi trường', icon: 'leaf', color: theme.colors.success },
  { value: 2, label: 'Hỏa hoạn', icon: 'fire', color: theme.colors.error },
  { value: 3, label: 'Rác thải', icon: 'delete', color: theme.colors.warning },
  { value: 4, label: 'Ngập lụt', icon: 'water', color: theme.colors.info },
  { value: 5, label: 'Khác', icon: 'dots-horizontal', color: theme.colors.textSecondary },
];

// Priority options matching API
const PRIORITIES = [
  { value: 1, label: 'Bình thường', color: theme.colors.success },
  { value: 2, label: 'Trung bình', color: theme.colors.info },
  { value: 3, label: 'Cao', color: theme.colors.warning },
  { value: 4, label: 'Khẩn cấp', color: theme.colors.error },
];

const CreateReportScreen = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Map Modal State
  const [showMapModal, setShowMapModal] = useState(false);
  const [tempLocation, setTempLocation] = useState<number[] | null>(null);
  const [tempAddress, setTempAddress] = useState('');
  const [loadingAddress, setLoadingAddress] = useState(false);
  const mapRef = useRef<MapboxGL.MapView>(null);
  const cameraRef = useRef<MapboxGL.Camera>(null);

  const [formData, setFormData] = useState<CreateReportRequest>({
    tieu_de: '',
    mo_ta: '',
    danh_muc: 0,
    vi_do: 10.7769, // Default location (can be updated with GPS)
    kinh_do: 106.7009,
    dia_chi: '',
    uu_tien: 1,
    la_cong_khai: true,
    the_tags: [],
    media_ids: []
  });

  const [errors, setErrors] = useState<{
    tieu_de?: string;
    mo_ta?: string;
    dia_chi?: string;
  }>({});

  useEffect(() => {
    // Initialize tempLocation with current formData location when modal opens
    if (showMapModal) {
      setTempLocation([formData.kinh_do, formData.vi_do]);
      setTempAddress(formData.dia_chi);
    }
  }, [showMapModal]);

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!formData.tieu_de.trim()) {
      newErrors.tieu_de = 'Vui lòng nhập tiêu đề';
    } else if (formData.tieu_de.length < 10) {
      newErrors.tieu_de = 'Tiêu đề phải có ít nhất 10 ký tự';
    }

    if (!formData.mo_ta.trim()) {
      newErrors.mo_ta = 'Vui lòng nhập mô tả';
    } else if (formData.mo_ta.length < 20) {
      newErrors.mo_ta = 'Mô tả phải có ít nhất 20 ký tự';
    }

    if (!formData.dia_chi.trim()) {
      newErrors.dia_chi = 'Vui lòng nhập địa chỉ';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const response = await reportService.createReport(formData);

      if (response.success) {
        setSuccessMessage(response.message || 'Tạo phản ánh thành công!');
        setShowSuccessModal(true);
      }
    } catch (error: any) {
      console.error('Create report error:', error);
      let message = 'Không thể tạo phản ánh. Vui lòng thử lại.';

      if (error.response?.data?.message) {
        message = error.response.data.message;
      } else if (error.message) {
        message = error.message;
      }

      setErrorMessage(message);
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    navigation.goBack();
  };

  const handleMapPress = async (feature: any) => {
    const coords = feature.geometry.coordinates;
    setTempLocation(coords);

    // Reverse Geocoding
    try {
      setLoadingAddress(true);
      const address = await mapService.reverseGeocode(coords[1], coords[0]);
      setTempAddress(address);
    } catch (error) {
      console.error('Geocoding error:', error);
    } finally {
      setLoadingAddress(false);
    }
  };

  const confirmLocation = () => {
    if (tempLocation) {
      setFormData({
        ...formData,
        kinh_do: tempLocation[0],
        vi_do: tempLocation[1],
        dia_chi: tempAddress || formData.dia_chi || `Vị trí: ${tempLocation[1].toFixed(6)}, ${tempLocation[0].toFixed(6)}`
      });
      setShowMapModal(false);
    }
  };

  const openMapModal = () => {
    setTempLocation([formData.kinh_do, formData.vi_do]);
    setShowMapModal(true);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <PageHeader title="Tạo phản ánh mới" variant="default" />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Category Selection */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Danh mục</Text>
          <View style={styles.categoryGrid}>
            {CATEGORIES.map((category) => {
              const isActive = formData.danh_muc === category.value;
              return (
                <TouchableOpacity
                  key={category.value}
                  style={[
                    styles.categoryItem,
                    isActive && styles.categoryItemActive,
                    isActive && { borderColor: category.color, backgroundColor: category.color + '10' }
                  ]}
                  onPress={() => setFormData({ ...formData, danh_muc: category.value })}
                  activeOpacity={0.7}
                >
                  <View style={[
                    styles.iconContainer,
                    { backgroundColor: isActive ? category.color : theme.colors.backgroundSecondary }
                  ]}>
                    <Icon
                      name={category.icon}
                      size={24}
                      color={isActive ? theme.colors.white : theme.colors.textSecondary}
                    />
                  </View>
                  <Text style={[
                    styles.categoryText,
                    isActive && { color: category.color, fontWeight: '700' }
                  ]}>
                    {category.label}
                  </Text>
                  {isActive && (
                    <View style={[styles.checkBadge, { backgroundColor: category.color }]}>
                      <Icon name="check" size={10} color={theme.colors.white} />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Main Info */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Thông tin chi tiết</Text>

          <View style={styles.inputGroup}>
            <InputCustom
              label="Tiêu đề"
              placeholder="Nhập tiêu đề phản ánh"
              value={formData.tieu_de}
              onChangeText={(text) => setFormData({ ...formData, tieu_de: text })}
              error={errors.tieu_de}
              leftIcon="format-title"
              maxLength={200}
              containerStyle={styles.input}
            />
            <Text style={styles.charCount}>{formData.tieu_de.length}/200</Text>
          </View>

          <View style={styles.inputGroup}>
            <InputCustom
              label="Mô tả"
              placeholder="Mô tả chi tiết vấn đề"
              value={formData.mo_ta}
              onChangeText={(text) => setFormData({ ...formData, mo_ta: text })}
              error={errors.mo_ta}
              leftIcon="text"
              multiline
              numberOfLines={5}
              maxLength={1000}
              containerStyle={styles.input}
            />
            <Text style={styles.charCount}>{formData.mo_ta.length}/1000</Text>
          </View>
        </View>

        {/* Location */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Vị trí</Text>
          <View style={styles.inputGroup}>
            <InputCustom
              label="Địa chỉ"
              placeholder="Nhập địa chỉ cụ thể"
              value={formData.dia_chi}
              onChangeText={(text) => setFormData({ ...formData, dia_chi: text })}
              error={errors.dia_chi}
              leftIcon="map-marker"
              containerStyle={styles.input}
            />
            <TouchableOpacity
              style={styles.locationButton}
              activeOpacity={0.7}
              onPress={openMapModal}
            >
              <View style={styles.locationIconBg}>
                <Icon name="map-marker-radius" size={20} color={theme.colors.primary} />
              </View>
              <Text style={styles.locationButtonText}>Chọn vị trí trên bản đồ</Text>
            </TouchableOpacity>
            {formData.vi_do && formData.kinh_do && (
              <Text style={styles.coordsText}>
                Tọa độ: {formData.vi_do.toFixed(6)}, {formData.kinh_do.toFixed(6)}
              </Text>
            )}
          </View>
        </View>

        {/* Priority */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Mức độ ưu tiên</Text>
          <View style={styles.priorityContainer}>
            {PRIORITIES.map((priority) => {
              const isActive = formData.uu_tien === priority.value;
              return (
                <TouchableOpacity
                  key={priority.value}
                  style={[
                    styles.priorityChip,
                    isActive && { backgroundColor: priority.color }
                  ]}
                  onPress={() => setFormData({ ...formData, uu_tien: priority.value })}
                  activeOpacity={0.7}
                >
                  {isActive && <Icon name="check" size={16} color={theme.colors.white} style={{ marginRight: 4 }} />}
                  <Text style={[
                    styles.priorityText,
                    isActive && { color: theme.colors.white, fontWeight: '700' }
                  ]}>
                    {priority.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Media Upload */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Hình ảnh/Video</Text>
          <TouchableOpacity style={styles.uploadArea} activeOpacity={0.7}>
            <View style={styles.uploadIconCircle}>
              <Icon name="camera-plus" size={32} color={theme.colors.primary} />
            </View>
            <Text style={styles.uploadTitle}>Thêm ảnh hoặc video</Text>
            <Text style={styles.uploadSubtitle}>Tối đa 5 file (JPG, PNG, MP4)</Text>
          </TouchableOpacity>
        </View>

        {/* Settings */}
        <View style={styles.card}>
          <View style={styles.switchRow}>
            <View style={styles.switchInfo}>
              <View style={styles.switchLabelRow}>
                <Icon name={formData.la_cong_khai ? "eye" : "eye-off"} size={20} color={theme.colors.text} />
                <Text style={styles.switchLabel}>Công khai phản ánh</Text>
              </View>
              <Text style={styles.switchDescription}>
                {formData.la_cong_khai
                  ? 'Mọi người đều có thể nhìn thấy phản ánh này'
                  : 'Chỉ bạn và cơ quan chức năng mới nhìn thấy'}
              </Text>
            </View>
            <Switch
              value={formData.la_cong_khai}
              onValueChange={(value) => setFormData({ ...formData, la_cong_khai: value })}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
              thumbColor={theme.colors.white}
            />
          </View>
        </View>

        {/* Submit Button */}
        <View style={styles.footer}>
          <ButtonCustom
            title={loading ? 'Đang gửi...' : 'Gửi phản ánh'}
            onPress={handleSubmit}
            disabled={loading}
            icon="send"
            style={styles.submitButton}
          />
        </View>
      </ScrollView>

      {/* Map Modal */}
      <Modal
        visible={showMapModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowMapModal(false)}
      >
        <View style={styles.modalOverlay}>
          <SafeAreaView style={styles.mapModalContainer} edges={['bottom']}>
            <View style={styles.mapHeader}>
              <TouchableOpacity onPress={() => setShowMapModal(false)} style={styles.closeButton}>
                <Icon name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
              <Text style={styles.mapTitle}>Chọn vị trí</Text>
              <TouchableOpacity onPress={confirmLocation} style={styles.confirmButton}>
                <Text style={styles.confirmButtonText}>Xác nhận</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.mapContainer}>
              <MapboxGL.MapView
                ref={mapRef}
                style={styles.map}
                styleURL={MapboxGL.StyleURL.Street}
                logoEnabled={false}
                attributionEnabled={false}
                onPress={handleMapPress}
              >
                <MapboxGL.Camera
                  ref={cameraRef}
                  zoomLevel={15}
                  centerCoordinate={tempLocation || [106.7009, 10.7769]}
                  animationMode="flyTo"
                  animationDuration={1000}
                />
                {tempLocation && (
                  <MapboxGL.PointAnnotation
                    id="selectedLocation"
                    coordinate={tempLocation}
                  >
                    <View style={styles.markerContainer}>
                      <Icon name="map-marker" size={40} color={theme.colors.primary} />
                    </View>
                  </MapboxGL.PointAnnotation>
                )}
              </MapboxGL.MapView>

              <View style={styles.addressOverlay}>
                {loadingAddress ? (
                  <ActivityIndicator size="small" color={theme.colors.primary} />
                ) : (
                  <Text style={styles.addressText} numberOfLines={2}>
                    {tempAddress || 'Chạm vào bản đồ để chọn vị trí'}
                  </Text>
                )}
              </View>
            </View>
          </SafeAreaView>
        </View>
      </Modal>

      {/* Success Modal */}
      <ModalCustom
        isModalVisible={showSuccessModal}
        setIsModalVisible={setShowSuccessModal}
        title="Thành công"
        type="success"
        isClose={false}
        actionText="OK"
        onPressAction={handleSuccessClose}
      >
        <Text style={styles.modalText}>{successMessage}</Text>
      </ModalCustom>

      {/* Error Modal */}
      <ModalCustom
        isModalVisible={showErrorModal}
        setIsModalVisible={setShowErrorModal}
        title="Lỗi"
        type="error"
        isClose={false}
        actionText="OK"
      >
        <Text style={styles.modalText}>{errorMessage}</Text>
      </ModalCustom>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
    padding: SCREEN_PADDING.horizontal,
  },
  card: {
    backgroundColor: theme.colors.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    ...theme.shadows.sm,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: SPACING.md,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  categoryItem: {
    width: '31%',
    aspectRatio: 1,
    backgroundColor: theme.colors.background,
    borderRadius: BORDER_RADIUS.lg,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
    position: 'relative',
  },
  categoryItemActive: {
    backgroundColor: theme.colors.white,
    borderWidth: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  categoryText: {
    fontSize: FONT_SIZE.xs,
    color: theme.colors.textSecondary,
    fontWeight: '500',
    textAlign: 'center',
  },
  checkBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputGroup: {
    marginBottom: SPACING.md,
  },
  input: {
    marginBottom: 0,
  },
  charCount: {
    fontSize: FONT_SIZE.xs,
    color: theme.colors.textSecondary,
    textAlign: 'right',
    marginTop: 4,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.sm,
    padding: SPACING.sm,
    backgroundColor: theme.colors.primary + '10',
    borderRadius: BORDER_RADIUS.md,
    alignSelf: 'flex-start',
  },
  locationIconBg: {
    marginRight: SPACING.xs,
  },
  locationButtonText: {
    fontSize: FONT_SIZE.sm,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  coordsText: {
    fontSize: FONT_SIZE.xs,
    color: theme.colors.textSecondary,
    marginTop: SPACING.xs,
    marginLeft: SPACING.xs,
  },
  priorityContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  priorityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: theme.colors.background,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  priorityText: {
    fontSize: FONT_SIZE.sm,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  uploadArea: {
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderStyle: 'dashed',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xl,
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  uploadIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  uploadTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },
  uploadSubtitle: {
    fontSize: FONT_SIZE.xs,
    color: theme.colors.textSecondary,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  switchInfo: {
    flex: 1,
    marginRight: SPACING.md,
  },
  switchLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: SPACING.xs,
  },
  switchLabel: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: theme.colors.text,
  },
  switchDescription: {
    fontSize: FONT_SIZE.xs,
    color: theme.colors.textSecondary,
    lineHeight: 18,
  },
  footer: {
    paddingBottom: SPACING.xl,
  },
  submitButton: {
    borderRadius: BORDER_RADIUS.xl,
    ...theme.shadows.md,
  },
  modalText: {
    textAlign: 'center',
    color: theme.colors.text,
    fontSize: FONT_SIZE.md,
  },
  mapModalContainer: {
    flex: 1,
    backgroundColor: theme.colors.white,
    marginTop: hp('20%'), // Start from 20% down (80% height)
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    ...theme.shadows.lg,
  },
  mapHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.white,
  },
  closeButton: {
    padding: SPACING.sm,
  },
  mapTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: theme.colors.text,
  },
  confirmButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: theme.colors.primary,
    borderRadius: BORDER_RADIUS.md,
  },
  confirmButtonText: {
    color: theme.colors.white,
    fontWeight: '600',
    fontSize: FONT_SIZE.sm,
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  addressOverlay: {
    position: 'absolute',
    bottom: SPACING.xl,
    left: SPACING.md,
    right: SPACING.md,
    backgroundColor: theme.colors.white,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    ...theme.shadows.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  addressText: {
    color: theme.colors.text,
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default CreateReportScreen;
