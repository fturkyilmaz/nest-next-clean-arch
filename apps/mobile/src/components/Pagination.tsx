import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    TextInput,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    FlatList,
} from 'react-native';
import { PaginationMeta } from '@diet/shared/pagination';

/**
 * React Native pagination components
 * Optimized for mobile apps with Expo
 */

/**
 * Pagination Controls Component (Mobile)
 */
interface MobilePaginationControlsProps {
    meta: PaginationMeta;
    onPageChange: (page: number) => void;
    isLoading?: boolean;
}

export function MobilePaginationControls({
    meta,
    onPageChange,
    isLoading = false,
}: MobilePaginationControlsProps) {
    return (
        <View style={styles.paginationContainer}>
            {/* Previous Button */}
            <TouchableOpacity
                onPress={() => onPageChange(meta.page - 1)}
                disabled={!meta.hasPrev || isLoading}
                style={[
                    styles.paginationButton,
                    (!meta.hasPrev || isLoading) && styles.disabledButton,
                ]}
            >
                <Text style={styles.paginationButtonText}>← Prev</Text>
            </TouchableOpacity>

            {/* Page Info */}
            <View style={styles.pageInfo}>
                <Text style={styles.pageInfoText}>
                    Page {meta.page} of {meta.pages}
                </Text>
                <Text style={styles.totalText}>
                    Total: {meta.total} items
                </Text>
            </View>

            {/* Next Button */}
            <TouchableOpacity
                onPress={() => onPageChange(meta.page + 1)}
                disabled={!meta.hasNext || isLoading}
                style={[
                    styles.paginationButton,
                    (!meta.hasNext || isLoading) && styles.disabledButton,
                ]}
            >
                <Text style={styles.paginationButtonText}>Next →</Text>
            </TouchableOpacity>
        </View>
    );
}

/**
 * Limit Selector Component (Mobile)
 */
interface MobileLimitSelectorProps {
    currentLimit: number;
    onLimitChange: (limit: number) => void;
    options?: number[];
}

export function MobileLimitSelector({
    currentLimit,
    onLimitChange,
    options = [10, 20, 50],
}: MobileLimitSelectorProps) {
    return (
        <View style={styles.limitContainer}>
            <Text style={styles.limitLabel}>Items per page:</Text>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.limitScroll}
            >
                {options.map(option => (
                    <TouchableOpacity
                        key={option}
                        onPress={() => onLimitChange(option)}
                        style={[
                            styles.limitButton,
                            currentLimit === option && styles.limitButtonActive,
                        ]}
                    >
                        <Text
                            style={[
                                styles.limitButtonText,
                                currentLimit === option && styles.limitButtonTextActive,
                            ]}
                        >
                            {option}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
}

/**
 * Search Input Component (Mobile)
 */
interface MobileSearchInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    isLoading?: boolean;
}

export function MobileSearchInput({
    value,
    onChange,
    placeholder = 'Search...',
    isLoading = false,
}: MobileSearchInputProps) {
    return (
        <View style={styles.searchContainer}>
            <TextInput
                value={value}
                onChangeText={onChange}
                placeholder={placeholder}
                editable={!isLoading}
                style={styles.searchInput}
                placeholderTextColor="#9ca3af"
            />
            {isLoading && (
                <ActivityIndicator
                    size="small"
                    color="#2563eb"
                    style={styles.searchSpinner}
                />
            )}
        </View>
    );
}

/**
 * Sort Controls Component (Mobile)
 */
interface MobileSortControlsProps {
    sortBy?: string;
    sortOrder: 'asc' | 'desc';
    onSortChange: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
    sortableFields: { value: string; label: string }[];
}

export function MobileSortControls({
    sortBy,
    sortOrder,
    onSortChange,
    sortableFields,
}: MobileSortControlsProps) {
    const [showPicker, setShowPicker] = useState(false);

    return (
        <View style={styles.sortContainer}>
            <TouchableOpacity
                onPress={() => setShowPicker(!showPicker)}
                style={styles.sortButton}
            >
                <Text style={styles.sortButtonText}>
                    Sort: {sortBy || 'Default'}
                </Text>
            </TouchableOpacity>

            {showPicker && (
                <View style={styles.sortPicker}>
                    <TouchableOpacity
                        onPress={() => {
                            onSortChange('', sortOrder);
                            setShowPicker(false);
                        }}
                        style={styles.sortOption}
                    >
                        <Text
                            style={[
                                styles.sortOptionText,
                                !sortBy && styles.sortOptionActive,
                            ]}
                        >
                            Default
                        </Text>
                    </TouchableOpacity>
                    {sortableFields.map(field => (
                        <TouchableOpacity
                            key={field.value}
                            onPress={() => {
                                onSortChange(field.value, sortOrder);
                                setShowPicker(false);
                            }}
                            style={styles.sortOption}
                        >
                            <Text
                                style={[
                                    styles.sortOptionText,
                                    sortBy === field.value && styles.sortOptionActive,
                                ]}
                            >
                                {field.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}

            <TouchableOpacity
                onPress={() =>
                    onSortChange(
                        sortBy || 'createdAt',
                        sortOrder === 'asc' ? 'desc' : 'asc',
                    )
                }
                style={styles.sortOrderButton}
            >
                <Text style={styles.sortOrderButtonText}>
                    {sortOrder === 'asc' ? '↑' : '↓'}
                </Text>
            </TouchableOpacity>
        </View>
    );
}

/**
 * Mobile Pagination Toolbar
 * Combines all pagination controls
 */
interface MobilePaginationToolbarProps {
    meta: PaginationMeta;
    searchValue: string;
    onSearchChange: (value: string) => void;
    onPageChange: (page: number) => void;
    onLimitChange: (limit: number) => void;
    sortBy?: string;
    sortOrder: 'asc' | 'desc';
    onSortChange: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
    sortableFields: { value: string; label: string }[];
    isLoading?: boolean;
}

export function MobilePaginationToolbar({
    meta,
    searchValue,
    onSearchChange,
    onPageChange,
    onLimitChange,
    sortBy,
    sortOrder,
    onSortChange,
    sortableFields,
    isLoading = false,
}: MobilePaginationToolbarProps) {
    return (
        <View style={styles.toolbar}>
            <MobileSearchInput
                value={searchValue}
                onChange={onSearchChange}
                isLoading={isLoading}
            />

            <View style={styles.controlsRow}>
                <MobileSortControls
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                    onSortChange={onSortChange}
                    sortableFields={sortableFields}
                />
                <MobileLimitSelector
                    currentLimit={meta.limit}
                    onLimitChange={onLimitChange}
                />
            </View>

            <View style={styles.resultInfo}>
                <Text style={styles.resultInfoText}>
                    {(meta.page - 1) * meta.limit + 1} - {Math.min(meta.page * meta.limit, meta.total)} of{' '}
                    {meta.total}
                </Text>
            </View>

            <MobilePaginationControls
                meta={meta}
                onPageChange={onPageChange}
                isLoading={isLoading}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    paginationContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        gap: 8,
    },
    paginationButton: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        backgroundColor: '#2563eb',
        borderRadius: 6,
    },
    paginationButtonText: {
        color: '#ffffff',
        fontWeight: '600',
        fontSize: 14,
    },
    disabledButton: {
        backgroundColor: '#e5e7eb',
        opacity: 0.5,
    },
    pageInfo: {
        flex: 1,
        alignItems: 'center',
    },
    pageInfoText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1f2937',
    },
    totalText: {
        fontSize: 12,
        color: '#6b7280',
        marginTop: 2,
    },
    limitContainer: {
        gap: 8,
        paddingVertical: 12,
    },
    limitLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1f2937',
    },
    limitScroll: {
        flexDirection: 'row',
    },
    limitButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#d1d5db',
        backgroundColor: '#ffffff',
        marginRight: 8,
    },
    limitButtonActive: {
        backgroundColor: '#dbeafe',
        borderColor: '#2563eb',
    },
    limitButtonText: {
        fontSize: 12,
        color: '#4b5563',
    },
    limitButtonTextActive: {
        color: '#2563eb',
        fontWeight: '600',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 6,
        backgroundColor: '#ffffff',
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        color: '#1f2937',
    },
    searchSpinner: {
        marginLeft: 8,
    },
    sortContainer: {
        flexDirection: 'row',
        gap: 8,
        alignItems: 'center',
    },
    sortButton: {
        flex: 1,
        paddingHorizontal: 12,
        paddingVertical: 8,
        backgroundColor: '#f3f4f6',
        borderRadius: 6,
    },
    sortButtonText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#1f2937',
    },
    sortPicker: {
        position: 'absolute',
        top: 40,
        left: 0,
        right: 0,
        backgroundColor: '#ffffff',
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#d1d5db',
        zIndex: 10,
    },
    sortOption: {
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    sortOptionText: {
        fontSize: 12,
        color: '#4b5563',
    },
    sortOptionActive: {
        color: '#2563eb',
        fontWeight: '600',
    },
    sortOrderButton: {
        paddingHorizontal: 10,
        paddingVertical: 8,
        backgroundColor: '#f3f4f6',
        borderRadius: 6,
        minWidth: 40,
    },
    sortOrderButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1f2937',
        textAlign: 'center',
    },
    toolbar: {
        gap: 12,
        paddingHorizontal: 12,
        paddingVertical: 12,
        backgroundColor: '#f9fafb',
        borderRadius: 8,
    },
    controlsRow: {
        gap: 12,
    },
    resultInfo: {
        alignItems: 'center',
    },
    resultInfoText: {
        fontSize: 12,
        color: '#6b7280',
    },
});
