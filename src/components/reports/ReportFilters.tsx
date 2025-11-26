import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { theme, SPACING, FONT_SIZE, BORDER_RADIUS, ICON_SIZE } from '../../theme';

export interface FilterOptions {
    danh_muc?: number;
    trang_thai?: number;
    uu_tien?: number;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
}

interface ReportFiltersProps {
    filters: FilterOptions;
    onFiltersChange: (filters: FilterOptions) => void;
}

const CATEGORIES = [
    { value: -1, label: 'Tất cả danh mục' },
    { value: 0, label: 'Giao thông', icon: 'car', color: theme.colors.primary },
    { value: 1, label: 'Môi trường', icon: 'leaf', color: theme.colors.success },
    { value: 2, label: 'Hạ tầng', icon: 'hammer-wrench', color: theme.colors.warning },
    { value: 3, label: 'An ninh', icon: 'shield-alert', color: theme.colors.error },
    { value: 4, label: 'Khác', icon: 'dots-horizontal', color: theme.colors.info },
];

const STATUSES = [
    { value: -1, label: 'Tất cả trạng thái' },
    { value: 0, label: 'Chờ xử lý', color: theme.colors.textSecondary },
    { value: 1, label: 'Đã xác nhận', color: theme.colors.info },
    { value: 2, label: 'Đang xử lý', color: theme.colors.warning },
    { value: 3, label: 'Đã giải quyết', color: theme.colors.success },
    { value: 4, label: 'Từ chối', color: theme.colors.error },
];

const PRIORITIES = [
    { value: -1, label: 'Tất cả mức độ' },
    { value: 0, label: 'Thấp', color: theme.colors.textSecondary },
    { value: 1, label: 'Trung bình', color: theme.colors.info },
    { value: 2, label: 'Cao', color: theme.colors.warning },
    { value: 3, label: 'Khẩn cấp', color: theme.colors.error },
];

const SORT_OPTIONS = [
    { value: 'ngay_tao', label: 'Ngày tạo' },
    { value: 'luot_ung_ho', label: 'Lượt ủng hộ' },
    { value: 'luot_xem', label: 'Lượt xem' },
    { value: 'ngay_cap_nhat', label: 'Cập nhật gần đây' },
];

const ReportFilters: React.FC<ReportFiltersProps> = ({ filters, onFiltersChange }) => {
    const [showModal, setShowModal] = useState(false);
    const [tempFilters, setTempFilters] = useState<FilterOptions>(filters);

    const activeFiltersCount = Object.values(filters).filter(v => v !== undefined && v !== -1).length;

    const handleApply = () => {
        onFiltersChange(tempFilters);
        setShowModal(false);
    };

    const handleReset = () => {
        const resetFilters: FilterOptions = {
            sort_by: 'ngay_tao',
            sort_order: 'desc'
        };
        setTempFilters(resetFilters);
        onFiltersChange(resetFilters);
        setShowModal(false);
    };

    const selectedCategory = CATEGORIES.find(c => c.value === (filters.danh_muc ?? -1));
    const selectedStatus = STATUSES.find(s => s.value === (filters.trang_thai ?? -1));
    const selectedPriority = PRIORITIES.find(p => p.value === (filters.uu_tien ?? -1));

    return (
        <>
            <TouchableOpacity style={styles.filterButton} onPress={() => setShowModal(true)} activeOpacity={0.7}>
                <Icon name="filter-variant" size={ICON_SIZE.sm} color={theme.colors.primary} />
                <Text style={styles.filterButtonText}>Bộ lọc</Text>
                {activeFiltersCount > 0 && (
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>{activeFiltersCount}</Text>
                    </View>
                )}
            </TouchableOpacity>

            <Modal
                visible={showModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        {/* Header */}
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Bộ lọc</Text>
                            <TouchableOpacity onPress={() => setShowModal(false)}>
                                <Icon name="close" size={24} color={theme.colors.text} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                            {/* Category Filter */}
                            <View style={styles.filterSection}>
                                <Text style={styles.filterLabel}>Danh mục</Text>
                                <View style={styles.optionsGrid}>
                                    {CATEGORIES.map(category => (
                                        <TouchableOpacity
                                            key={category.value}
                                            style={[
                                                styles.option,
                                                tempFilters.danh_muc === category.value && styles.optionActive
                                            ]}
                                            onPress={() => setTempFilters({
                                                ...tempFilters,
                                                danh_muc: category.value === -1 ? undefined : category.value
                                            })}
                                        >
                                            {category.icon && (
                                                <Icon
                                                    name={category.icon}
                                                    size={20}
                                                    color={tempFilters.danh_muc === category.value ? theme.colors.white : category.color}
                                                />
                                            )}
                                            <Text style={[
                                                styles.optionText,
                                                tempFilters.danh_muc === category.value && styles.optionTextActive
                                            ]}>
                                                {category.label}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            {/* Status Filter */}
                            <View style={styles.filterSection}>
                                <Text style={styles.filterLabel}>Trạng thái</Text>
                                <View style={styles.optionsGrid}>
                                    {STATUSES.map(status => (
                                        <TouchableOpacity
                                            key={status.value}
                                            style={[
                                                styles.option,
                                                tempFilters.trang_thai === status.value && styles.optionActive
                                            ]}
                                            onPress={() => setTempFilters({
                                                ...tempFilters,
                                                trang_thai: status.value === -1 ? undefined : status.value
                                            })}
                                        >
                                            <Text style={[
                                                styles.optionText,
                                                tempFilters.trang_thai === status.value && styles.optionTextActive
                                            ]}>
                                                {status.label}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            {/* Priority Filter */}
                            <View style={styles.filterSection}>
                                <Text style={styles.filterLabel}>Mức độ ưu tiên</Text>
                                <View style={styles.optionsGrid}>
                                    {PRIORITIES.map(priority => (
                                        <TouchableOpacity
                                            key={priority.value}
                                            style={[
                                                styles.option,
                                                tempFilters.uu_tien === priority.value && styles.optionActive
                                            ]}
                                            onPress={() => setTempFilters({
                                                ...tempFilters,
                                                uu_tien: priority.value === -1 ? undefined : priority.value
                                            })}
                                        >
                                            <Text style={[
                                                styles.optionText,
                                                tempFilters.uu_tien === priority.value && styles.optionTextActive
                                            ]}>
                                                {priority.label}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            {/* Sort Options */}
                            <View style={styles.filterSection}>
                                <Text style={styles.filterLabel}>Sắp xếp theo</Text>
                                <View style={styles.optionsGrid}>
                                    {SORT_OPTIONS.map(sort => (
                                        <TouchableOpacity
                                            key={sort.value}
                                            style={[
                                                styles.option,
                                                tempFilters.sort_by === sort.value && styles.optionActive
                                            ]}
                                            onPress={() => setTempFilters({
                                                ...tempFilters,
                                                sort_by: sort.value
                                            })}
                                        >
                                            <Text style={[
                                                styles.optionText,
                                                tempFilters.sort_by === sort.value && styles.optionTextActive
                                            ]}>
                                                {sort.label}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                {/* Sort Order */}
                                <View style={styles.sortOrderContainer}>
                                    <TouchableOpacity
                                        style={[
                                            styles.sortOrderButton,
                                            tempFilters.sort_order === 'desc' && styles.sortOrderActive
                                        ]}
                                        onPress={() => setTempFilters({ ...tempFilters, sort_order: 'desc' })}
                                    >
                                        <Icon name="sort-descending" size={20} color={tempFilters.sort_order === 'desc' ? theme.colors.white : theme.colors.text} />
                                        <Text style={[
                                            styles.sortOrderText,
                                            tempFilters.sort_order === 'desc' && styles.sortOrderTextActive
                                        ]}>Giảm dần</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[
                                            styles.sortOrderButton,
                                            tempFilters.sort_order === 'asc' && styles.sortOrderActive
                                        ]}
                                        onPress={() => setTempFilters({ ...tempFilters, sort_order: 'asc' })}
                                    >
                                        <Icon name="sort-ascending" size={20} color={tempFilters.sort_order === 'asc' ? theme.colors.white : theme.colors.text} />
                                        <Text style={[
                                            styles.sortOrderText,
                                            tempFilters.sort_order === 'asc' && styles.sortOrderTextActive
                                        ]}>Tăng dần</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </ScrollView>

                        {/* Footer */}
                        <View style={styles.modalFooter}>
                            <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
                                <Text style={styles.resetButtonText}>Đặt lại</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
                                <Text style={styles.applyButtonText}>Áp dụng</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </>
    );
};

const styles = StyleSheet.create({
    filterButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        backgroundColor: theme.colors.white,
        borderRadius: BORDER_RADIUS.md,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    filterButtonText: {
        fontSize: FONT_SIZE.sm,
        fontWeight: '600',
        color: theme.colors.text,
    },
    badge: {
        backgroundColor: theme.colors.primary,
        borderRadius: 10,
        width: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    badgeText: {
        color: theme.colors.white,
        fontSize: FONT_SIZE.xs,
        fontWeight: '700',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: theme.colors.white,
        borderTopLeftRadius: BORDER_RADIUS['2xl'],
        borderTopRightRadius: BORDER_RADIUS['2xl'],
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: SPACING.lg,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    modalTitle: {
        fontSize: FONT_SIZE.xl,
        fontWeight: '700',
        color: theme.colors.text,
    },
    modalBody: {
        padding: SPACING.lg,
    },
    filterSection: {
        marginBottom: SPACING.xl,
    },
    filterLabel: {
        fontSize: FONT_SIZE.md,
        fontWeight: '600',
        color: theme.colors.text,
        marginBottom: SPACING.sm,
    },
    optionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: SPACING.sm,
    },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        backgroundColor: theme.colors.backgroundSecondary,
        borderRadius: BORDER_RADIUS.md,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    optionActive: {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
    },
    optionText: {
        fontSize: FONT_SIZE.sm,
        color: theme.colors.text,
        fontWeight: '500',
    },
    optionTextActive: {
        color: theme.colors.white,
        fontWeight: '600',
    },
    sortOrderContainer: {
        flexDirection: 'row',
        gap: SPACING.sm,
        marginTop: SPACING.sm,
    },
    sortOrderButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: SPACING.sm,
        backgroundColor: theme.colors.backgroundSecondary,
        borderRadius: BORDER_RADIUS.md,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    sortOrderActive: {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
    },
    sortOrderText: {
        fontSize: FONT_SIZE.sm,
        color: theme.colors.text,
        fontWeight: '500',
    },
    sortOrderTextActive: {
        color: theme.colors.white,
        fontWeight: '600',
    },
    modalFooter: {
        flexDirection: 'row',
        gap: SPACING.md,
        padding: SPACING.lg,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
    },
    resetButton: {
        flex: 1,
        paddingVertical: SPACING.md,
        backgroundColor: theme.colors.backgroundSecondary,
        borderRadius: BORDER_RADIUS.md,
        alignItems: 'center',
    },
    resetButtonText: {
        fontSize: FONT_SIZE.md,
        fontWeight: '600',
        color: theme.colors.text,
    },
    applyButton: {
        flex: 1,
        paddingVertical: SPACING.md,
        backgroundColor: theme.colors.primary,
        borderRadius: BORDER_RADIUS.md,
        alignItems: 'center',
    },
    applyButtonText: {
        fontSize: FONT_SIZE.md,
        fontWeight: '700',
        color: theme.colors.white,
    },
});

export default ReportFilters;
