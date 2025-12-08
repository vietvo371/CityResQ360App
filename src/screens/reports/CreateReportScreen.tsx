import React, { useState, useRef, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Image, Platform, Modal, Dimensions, ActivityIndicator, PermissionsAndroid, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import MapboxGL from '@rnmapbox/maps';
import Geolocation from 'react-native-geolocation-service';
import PageHeader from '../../component/PageHeader';
import InputCustom from '../../component/InputCustom';
import ButtonCustom from '../../component/ButtonCustom';
import ModalCustom from '../../component/ModalCustom';
import { theme, SPACING, FONT_SIZE, BORDER_RADIUS, SCREEN_PADDING, wp, hp } from '../../theme';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import { reportService } from '../../services/reportService';
import { mapService } from '../../services/mapService';
import { mediaService } from '../../services/mediaService';
import { CreateReportRequest, Media } from '../../types/api/report';
import env from '../../config/env';

// Initialize Mapbox
MapboxGL.setAccessToken(env.MAPBOX_ACCESS_TOKEN);

// Category options matching API
const CATEGORIES = [
  { value: 1, label: 'Giao thông', icon: 'car', color: '#EF4444' },
  { value: 2, label: 'Môi trường', icon: 'leaf', color: '#10B981' },
  { value: 3, label: 'Cháy nổ', icon: 'fire', color: '#F97316' },
  { value: 4, label: 'Rác thải', icon: 'delete', color: '#8B5CF6' },
  { value: 5, label: 'Ngập lụt', icon: 'water', color: '#3B82F6' },
  { value: 6, label: 'Khác', icon: 'dots-horizontal', color: '#6B7280' },
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
  const [showAIModal, setShowAIModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [aiAnalysisMessage, setAiAnalysisMessage] = useState('');

  // Map Modal State
  const [showMapModal, setShowMapModal] = useState(false);
  const [tempLocation, setTempLocation] = useState<number[] | null>(null);
  const [tempAddress, setTempAddress] = useState('');
  const [loadingAddress, setLoadingAddress] = useState(false);
  const [currentTag, setCurrentTag] = useState('');
  const [uploadedMedia, setUploadedMedia] = useState<Media[]>([]);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const mapRef = useRef<MapboxGL.MapView>(null);
  const cameraRef = useRef<MapboxGL.Camera>(null);

  const [formData, setFormData] = useState<CreateReportRequest>({
    tieu_de: '',
    mo_ta: '',
    danh_muc: 1,
    vi_do: 10.7769, // Default location (can be updated with GPS)
    kinh_do: 106.7009,
    dia_chi: '',
    uu_tien: 1,
    la_cong_khai: true,
    the_tags: [],
    media_ids: []
  });

  const handleAddTag = () => {
    const currentTags = formData.the_tags || [];
    if (currentTag.trim() && !currentTags.includes(currentTag.trim())) {
      setFormData({
        ...formData,
        the_tags: [...currentTags, currentTag.trim()]
      });
      setCurrentTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const currentTags = formData.the_tags || [];
    setFormData({
      ...formData,
      the_tags: currentTags.filter(tag => tag !== tagToRemove)
    });
  };

  const mapPriorityLevel = (priority: string): number => {
    const priorityMap: { [key: string]: number } = {
      'low': 1,
      'medium': 2,
      'high': 3,
      'critical': 4,
      'urgent': 4,
    };
    return priorityMap[priority.toLowerCase()] || 2; // Default to medium
  };

  const uploadMediaAssets = async (assets: any[]) => {
    setUploadingMedia(true);
    const newMedia: Media[] = [];
    const newMediaIds: number[] = [];
    let aiAnalysisData: any = null;

    for (const asset of assets) {
      try {
        console.log('🚀 [API Request] Upload Media:', asset.fileName);
        const response = await mediaService.uploadMedia(
          asset,
          asset.type?.includes('video') ? 'video' : 'image',
          'phan_anh',
          'Hình ảnh phản ánh'
        );
        console.log('✅ [API Response] Upload Media:', response);

        if (response.success && response.data) {
          newMedia.push(response.data);
          newMediaIds.push(response.data.id);

          // Get AI analysis from first uploaded image
          if (!aiAnalysisData && response.data.ai_analysis) {
            aiAnalysisData = response.data.ai_analysis;
            console.log('🤖 [AI Analysis] Detected:', aiAnalysisData);
          }
        }
      } catch (error) {
        console.error('❌ [API Error] Upload Media:', error);
      }
    }

    if (newMedia.length > 0) {
      setUploadedMedia([...uploadedMedia, ...newMedia]);
      
      // Auto-fill form with AI analysis if available
      if (aiAnalysisData) {
        const categoryLabel = CATEGORIES.find(c => c.value === aiAnalysisData.danh_muc_id)?.label || 'Khác';
        const priorityLabel = PRIORITIES.find(p => p.value === mapPriorityLevel(aiAnalysisData.muc_do_uu_tien || 'medium'))?.label || 'Trung bình';
        
        setFormData(prev => ({
          ...prev,
          media_ids: [...(prev.media_ids || []), ...newMediaIds],
          // Only fill if current values are empty
          danh_muc: aiAnalysisData.danh_muc_id || prev.danh_muc,
          tieu_de: prev.tieu_de || aiAnalysisData.tieu_de || '',
          mo_ta: prev.mo_ta || aiAnalysisData.mo_ta || '',
          uu_tien: aiAnalysisData.muc_do_uu_tien 
            ? mapPriorityLevel(aiAnalysisData.muc_do_uu_tien) 
            : prev.uu_tien,
        }));

        // Prepare AI analysis message
        const detectedObjects = aiAnalysisData.ai_analysis?.detected_objects || [];
        const objectsText = detectedObjects.length > 0 
          ? `\n\n🔍 Phát hiện: ${detectedObjects.slice(0, 5).join(', ')}${detectedObjects.length > 5 ? '...' : ''}` 
          : '';
        
        setAiAnalysisMessage(
          `AI đã tự động phân tích và điền:\n\n` +
          `📁 Danh mục: ${categoryLabel}\n` +
          `⚠️ Mức độ: ${priorityLabel}\n` +
          `📝 Tiêu đề & Mô tả${objectsText}\n\n` +
          `Bạn có thể chỉnh sửa nếu cần.`
        );
        setShowAIModal(true);
      } else {
        setFormData(prev => ({
          ...prev,
          media_ids: [...(prev.media_ids || []), ...newMediaIds]
        }));
      }
    }
    setUploadingMedia(false);
  };

  const handleTakePhoto = async () => {
    try {
      const result = await launchCamera({
        mediaType: 'photo',
        quality: 0.5, // Reduced quality to avoid 413
        maxWidth: 1024, // Resize large images
        maxHeight: 1024,
        saveToPhotos: true,
      });

      if (result.assets && result.assets.length > 0) {
        await uploadMediaAssets(result.assets);
      }
    } catch (error) {
      console.error('Camera error:', error);
      setErrorMessage('Không thể mở camera. Vui lòng kiểm tra quyền truy cập.');
      setShowErrorModal(true);
    }
  };

  const handleSelectFromGallery = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'mixed',
        selectionLimit: 5 - uploadedMedia.length,
        quality: 0.5, // Reduced quality to avoid 413
        maxWidth: 1024, // Resize large images
        maxHeight: 1024,
      });

      if (result.assets && result.assets.length > 0) {
        await uploadMediaAssets(result.assets);
      }
    } catch (error) {
      console.error('Image picker error:', error);
      setErrorMessage('Không thể chọn ảnh. Vui lòng thử lại.');
      setShowErrorModal(true);
    }
  };

  const handleSelectMedia = () => {
    if (uploadedMedia.length >= 5) {
      setErrorMessage('Bạn chỉ được tải lên tối đa 5 ảnh/video');
      setShowErrorModal(true);
      return;
    }

    Alert.alert(
      'Chọn hình ảnh',
      'Chọn nguồn hình ảnh',
      [
        {
          text: 'Chụp ảnh',
          onPress: handleTakePhoto,
        },
        {
          text: 'Chọn từ thư viện',
          onPress: handleSelectFromGallery,
        },
        {
          text: 'Hủy',
          style: 'cancel',
        },
      ],
      { cancelable: true }
    );
  };

  const handleRemoveMedia = (mediaId: number) => {
    setUploadedMedia(uploadedMedia.filter(m => m.id !== mediaId));
    setFormData(prev => ({
      ...prev,
      media_ids: (prev.media_ids || []).filter(id => id !== mediaId)
    }));
  };

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

  useEffect(() => {
    const getCurrentLocation = async () => {
      try {
        if (Platform.OS === 'android') {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          );
          if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
            return;
          }
        } else {
          const auth = await Geolocation.requestAuthorization('whenInUse');
          if (auth !== 'granted') {
            return;
          }
        }

        Geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;

            // Get address for current location
            let address = '';
            try {
              address = await mapService.reverseGeocode(latitude, longitude);
            } catch (error) {
              console.error('Reverse geocode error:', error);
            }

            setFormData(prev => ({
              ...prev,
              vi_do: latitude,
              kinh_do: longitude,
              dia_chi: address
            }));
          },
          (error) => {
            console.log('Location error:', error.code, error.message);
          },
          { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
        );
      } catch (error) {
        console.error('Permission error:', error);
      }
    };

    getCurrentLocation();
  }, []);

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
    console.log('🚀 [API Request] Create Report:', formData);
    try {
      const response = await reportService.createReport(formData);
      console.log('✅ [API Response] Create Report:', response);

      if (response.success) {
        setSuccessMessage('Phản ánh của bạn đã được tạo thành công!');
        setShowSuccessModal(true);
      }
    } catch (error: any) {
      console.error('❌ [API Error] Create Report:', error);
      if (error.response) {
        console.log('Error Data:', error.response.data);
        console.log('Error Status:', error.response.status);
      }
      let message = 'Không thể tạo phản ánh của bạn. Vui lòng thử lại.';

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
      console.log('🚀 [API Request] Reverse Geocode:', { lat: coords[1], long: coords[0] });
      const address = await mapService.reverseGeocode(coords[1], coords[0]);
      console.log('✅ [API Response] Reverse Geocode:', address);
      setTempAddress(address);
    } catch (error) {
      console.error('❌ [API Error] Reverse Geocode:', error);
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
         {/* Media Upload */}
         <View style={styles.card}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionTitle}>Hình ảnh/Video</Text>
            <View style={styles.aiChip}>
              <Icon name="robot" size={14} color={theme.colors.primary} />
              <Text style={styles.aiChipText}>AI phân tích</Text>
            </View>
          </View>

          <View style={styles.mediaList}>
            {uploadedMedia.map((media) => (
              <View key={media.id} style={styles.mediaItem}>
                <Image
                  source={{ uri: media.thumbnail_url || media.url }}
                  style={styles.mediaImage}
                  resizeMode="cover"
                />
                {media.type === 'video' && (
                  <View style={styles.videoBadge}>
                    <Icon name="video" size={12} color={theme.colors.white} />
                  </View>
                )}
                <TouchableOpacity
                  style={styles.removeMediaButton}
                  onPress={() => handleRemoveMedia(media.id)}
                >
                  <Icon name="close" size={12} color={theme.colors.white} />
                </TouchableOpacity>
              </View>
            ))}

            {uploadedMedia.length < 5 && (
              <TouchableOpacity
                style={styles.uploadButton}
                activeOpacity={0.7}
                onPress={handleSelectMedia}
                disabled={uploadingMedia}
              >
                {uploadingMedia ? (
                  <ActivityIndicator size="small" color={theme.colors.primary} />
                ) : (
                  <>
                    <Icon name="camera-plus" size={24} color={theme.colors.primary} />
                    <Text style={styles.uploadButtonText}>Thêm</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>
          <Text style={styles.uploadSubtitle}>Tối đa 5 file (JPG, PNG, MP4)</Text>
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

          {/* Tags */}
          <View style={styles.inputGroup}>
            <InputCustom
              label="Thẻ (Tags)"
              placeholder="Nhập thẻ (ví dụ: ngập lụt)"
              value={currentTag}
              onChangeText={setCurrentTag}
              rightIcon="plus-circle"
              onRightIconPress={handleAddTag}
              containerStyle={styles.input}
            />
            <View style={styles.tagList}>
              {(formData.the_tags || []).map((tag, index) => (
                <View key={index} style={styles.tagChip}>
                  <Text style={styles.tagText}>#{tag}</Text>
                  <TouchableOpacity onPress={() => handleRemoveTag(tag)} hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}>
                    <Icon name="close-circle" size={16} color={theme.colors.textSecondary} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
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

      {/* AI Analysis Modal */}
      <ModalCustom
        isModalVisible={showAIModal}
        setIsModalVisible={setShowAIModal}
        title="🤖 AI đã phân tích ảnh"
        type="success"
        isClose={false}
        actionText="Đồng ý"
      >
        <Text style={styles.aiModalText}>{aiAnalysisMessage}</Text>
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
  sectionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  aiChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: theme.colors.primary + '10',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: theme.colors.primary + '30',
  },
  aiChipText: {
    fontSize: FONT_SIZE.xs,
    color: theme.colors.primary,
    fontWeight: '600',
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
  tagList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.backgroundSecondary,
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.full,
    gap: 6,
  },
  tagText: {
    fontSize: FONT_SIZE.sm,
    color: theme.colors.text,
    fontWeight: '500',
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
    marginTop: SPACING.xs,
  },
  mediaList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  mediaItem: {
    width: (wp('100%') - SCREEN_PADDING.horizontal * 2 - SPACING.md * 2 - SPACING.sm * 2) / 3,
    aspectRatio: 1,
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
    position: 'relative',
  },
  mediaImage: {
    width: '100%',
    height: '100%',
  },
  removeMediaButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoBadge: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  uploadButton: {
    width: (wp('100%') - SCREEN_PADDING.horizontal * 2 - SPACING.md * 2 - SPACING.sm * 2) / 3,
    aspectRatio: 1,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.primary + '05',
  },
  uploadButtonText: {
    fontSize: FONT_SIZE.xs,
    color: theme.colors.primary,
    marginTop: 4,
    fontWeight: '500',
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
  aiModalText: {
    textAlign: 'left',
    color: theme.colors.text,
    fontSize: FONT_SIZE.sm,
    lineHeight: 22,
    paddingHorizontal: SPACING.xs,
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
