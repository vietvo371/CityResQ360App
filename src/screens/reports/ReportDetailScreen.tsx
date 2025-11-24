import React, { useState, useEffect, useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { RootStackParamList } from '../../navigation/types';
import PageHeader from '../../component/PageHeader';
import { theme, SPACING, FONT_SIZE, BORDER_RADIUS, SCREEN_PADDING, wp, hp } from '../../theme';
import { reportService } from '../../services/reportService';
import { commentService } from '../../services/commentService';
import { ReportDetail, Comment } from '../../types/api/report';

type ReportDetailRouteProp = RouteProp<RootStackParamList, 'ReportDetail'>;

const ReportDetailScreen = () => {
  const route = useRoute<ReportDetailRouteProp>();
  const { id } = route.params;
  const [report, setReport] = useState<ReportDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchReportDetail = useCallback(async () => {
    try {
      const response = await reportService.getReportDetail(id);
      if (response.success) {
        setReport(response.data);
      }
    } catch (error) {
      console.error('Error fetching report detail:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchReportDetail();
  }, [fetchReportDetail]);

  const handleSendComment = async () => {
    if (!commentText.trim()) return;

    try {
      setSubmitting(true);
      const response = await commentService.addComment(id, commentText);
      if (response.success) {
        setCommentText('');
        // Refresh report to get new comment or append manually
        fetchReportDetail();
      }
    } catch (error) {
      console.error('Error sending comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status: number) => {
    switch (status) {
      case 0: return theme.colors.warning;
      case 1: return theme.colors.info;
      case 2: return theme.colors.success;
      case 3: return theme.colors.error;
      default: return theme.colors.textSecondary;
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!report) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Không tìm thấy phản ánh</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <PageHeader title="Chi tiết phản ánh" variant="default" />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {/* Status & Priority */}
          <View style={styles.statusRow}>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(report.trang_thai) + '15' }]}>
              <Text style={[styles.statusText, { color: getStatusColor(report.trang_thai) }]}>
                {report.trang_thai_text}
              </Text>
            </View>
            <Text style={styles.dateText}>
              {new Date(report.ngay_tao).toLocaleDateString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>

          {/* Title & Description */}
          <Text style={styles.title}>{report.tieu_de}</Text>
          <Text style={styles.description}>{report.mo_ta}</Text>

          {/* Location */}
          <View style={styles.locationContainer}>
            <Icon name="map-marker" size={16} color={theme.colors.textSecondary} />
            <Text style={styles.locationText}>{report.dia_chi}</Text>
          </View>

          {/* Media Gallery */}
          {report.media && report.media.length > 0 && (
            <View style={styles.mediaContainer}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {report.media.map((item) => (
                  <Image
                    key={item.id}
                    source={{ uri: item.url }}
                    style={styles.mediaImage}
                  />
                ))}
              </ScrollView>
            </View>
          )}

          {/* Comments Section */}
          <View style={styles.commentsSection}>
            <Text style={styles.sectionTitle}>Bình luận ({report.comments?.length || 0})</Text>
            {report.comments && report.comments.map((comment) => (
              <View key={comment.id} style={styles.commentItem}>
                <View style={styles.commentHeader}>
                  <Text style={styles.commentUser}>{comment.user.ho_ten}</Text>
                  <Text style={styles.commentTime}>
                    {new Date(comment.ngay_tao).toLocaleDateString('vi-VN')}
                  </Text>
                </View>
                <Text style={styles.commentContent}>{comment.noi_dung}</Text>
              </View>
            ))}
          </View>
        </ScrollView>

        {/* Comment Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Viết bình luận..."
            value={commentText}
            onChangeText={setCommentText}
            multiline
          />
          <TouchableOpacity
            style={[styles.sendButton, !commentText.trim() && styles.sendButtonDisabled]}
            onPress={handleSendComment}
            disabled={!commentText.trim() || submitting}
          >
            {submitting ? (
              <ActivityIndicator size="small" color={theme.colors.white} />
            ) : (
              <Icon name="send" size={20} color={theme.colors.white} />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: FONT_SIZE.md,
    color: theme.colors.textSecondary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: 80,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  dateText: {
    fontSize: FONT_SIZE.xs,
    color: theme.colors.textSecondary,
  },
  title: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: SPACING.sm,
  },
  description: {
    fontSize: FONT_SIZE.md,
    color: theme.colors.text,
    lineHeight: 24,
    marginBottom: SPACING.md,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    gap: 4,
  },
  locationText: {
    fontSize: FONT_SIZE.sm,
    color: theme.colors.textSecondary,
    flex: 1,
  },
  mediaContainer: {
    marginBottom: SPACING.lg,
  },
  mediaImage: {
    width: wp('60%'),
    height: wp('40%'),
    borderRadius: BORDER_RADIUS.md,
    marginRight: SPACING.md,
    backgroundColor: theme.colors.borderLight,
  },
  commentsSection: {
    marginTop: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: SPACING.md,
  },
  commentItem: {
    backgroundColor: theme.colors.white,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
    ...theme.shadows.sm,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
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
  commentContent: {
    fontSize: FONT_SIZE.md,
    color: theme.colors.text,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: SPACING.md,
    backgroundColor: theme.colors.white,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderLight,
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: 8,
    maxHeight: 100,
    marginRight: SPACING.sm,
    fontSize: FONT_SIZE.md,
    color: theme.colors.text,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: theme.colors.borderLight,
  },
});

export default ReportDetailScreen;


