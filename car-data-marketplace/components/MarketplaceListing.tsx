import React, { useState, useRef } from 'react';
import { StyleSheet, TouchableOpacity, View, Platform, Animated, TextStyle, ViewStyle } from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { MarketplaceListingType } from '../types/CarData';
import { Ionicons } from '@expo/vector-icons';

type MarketplaceListingProps = {
  listing: MarketplaceListingType;
  onToggleShare: (id: string) => void;
  isOwner?: boolean;
  gridView?: boolean;
  featured?: boolean;
};

// Extended the MarketplaceListingType to include the providerVerified property
type ExtendedListing = MarketplaceListingType & {
  providerVerified?: boolean;
};

export const MarketplaceListing = ({ 
  listing, 
  onToggleShare, 
  isOwner = false, 
  gridView = false,
  featured = false
}: MarketplaceListingProps) => {
  const isWeb = Platform.OS === 'web';
  const [isHovered, setIsHovered] = useState(false);
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const previewTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Cast listing to ExtendedListing to avoid TypeScript errors
  const extendedListing = listing as ExtendedListing;
  
  // Web-specific animated values
  const hoverScale = useRef(new Animated.Value(1)).current;
  
  const getDataTypeIcon = (type: MarketplaceListingType['dataType']) => {
    switch (type) {
      case 'speed':
        return 'speedometer-outline';
      case 'location':
        return 'location-outline';
      case 'diagnostics':
        return 'build-outline';
      case 'full':
        return 'car-outline';
      default:
        return 'analytics-outline';
    }
  };

  const formatDuration = (duration: MarketplaceListingType['duration']) => {
    switch (duration) {
      case 'hourly':
        return '/hour';
      case 'daily':
        return '/day';
      case 'weekly':
        return '/week';
      case 'monthly':
        return '/month';
      case 'once':
        return ' (one-time)';
      default:
        return '';
    }
  };

  const getDataTypeLabel = (type: MarketplaceListingType['dataType']) => {
    switch (type) {
      case 'speed':
        return 'Speed Data';
      case 'location':
        return 'Location Data';
      case 'diagnostics':
        return 'Diagnostics';
      case 'full':
        return 'Full Access';
      default:
        return 'Data';
    }
  };

  // Web-specific hover handling with animations
  const onMouseEnter = () => {
    if (isWeb) {
      setIsHovered(true);
      Animated.spring(hoverScale, {
        toValue: 1.02,
        friction: 8,
        tension: 300,
        useNativeDriver: true
      }).start();
      
      // Show preview after a short delay
      if (gridView) {
        previewTimerRef.current = setTimeout(() => {
          setIsPreviewVisible(true);
        }, 500);
      }
    }
  };
  
  const onMouseLeave = () => {
    if (isWeb) {
      setIsHovered(false);
      Animated.spring(hoverScale, {
        toValue: 1,
        friction: 8,
        tension: 300,
        useNativeDriver: true
      }).start();
      
      // Clear preview timer and hide preview
      if (previewTimerRef.current) {
        clearTimeout(previewTimerRef.current);
        previewTimerRef.current = null;
      }
      setIsPreviewVisible(false);
    }
  };
  
  const AnimatedThemedView = Animated.createAnimatedComponent(ThemedView);
  
  const webEventProps = isWeb ? {
    // Use React Native's alternative event props that work with Animated components
    onStartShouldSetResponder: () => true,
    onResponderGrant: onMouseEnter,
    onResponderRelease: onMouseLeave,
  } : {};
  
  return (
    <AnimatedThemedView 
      style={[
        styles.container, 
        isWeb && styles.webContainer,
        isWeb && isHovered && styles.webContainerHovered,
        isWeb && gridView && styles.webGridContainer,
        isWeb && featured && styles.featuredContainer,
        isWeb && { transform: [{ scale: hoverScale }] }
      ]}
      {...webEventProps}
      accessibilityRole={isWeb ? 'button' : undefined}
      accessibilityLabel={`${listing.title} - ${getDataTypeLabel(listing.dataType)} - $${listing.price.toFixed(2)}${formatDuration(listing.duration)}`}
    >
      {isWeb && featured && (
        <View style={styles.featuredBadge}>
          <Ionicons name="star" size={14} color="white" />
          <ThemedText style={styles.featuredText}>Featured</ThemedText>
        </View>
      )}
      
      <View style={[
        styles.header, 
        isWeb && styles.webHeader,
        isWeb && gridView && styles.webGridHeader
      ]}>
        <View style={[
          styles.iconContainer, 
          isWeb && styles.webIconContainer,
          isWeb && gridView && styles.webGridIconContainer,
          isWeb && featured && styles.featuredIconContainer
        ]}>
          <Ionicons 
            name={getDataTypeIcon(listing.dataType)} 
            size={isWeb ? (gridView ? 24 : 28) : 24} 
            color={featured ? "#FF9500" : "#007AFF"} 
          />
        </View>
        
        <View style={[
          styles.titleContainer,
          isWeb && gridView && styles.webGridTitleContainer
        ]}>
          <View style={isWeb ? styles.webTitleRow : null}>
            <ThemedText 
              type={isWeb ? (gridView ? "subtitle" : "subtitle") : "defaultSemiBold"}
              numberOfLines={gridView ? 1 : 2}
            >
              {listing.title}
            </ThemedText>
            
            {isWeb && !gridView && (
              <View style={styles.webCategoryBadge}>
                <ThemedText style={styles.webCategoryText}>
                  {getDataTypeLabel(listing.dataType)}
                </ThemedText>
              </View>
            )}
          </View>
          
          <ThemedText 
            style={[
              styles.description, 
              isWeb && styles.webDescription,
              isWeb && gridView && styles.webGridDescription
            ]}
            numberOfLines={gridView ? 2 : 3}
          >
            {listing.description}
          </ThemedText>
        </View>
      </View>
      
      {isWeb && gridView && (
        <View style={styles.webGridCategoryRow}>
          <View style={styles.webCategoryBadge}>
            <ThemedText style={styles.webCategoryText}>
              {getDataTypeLabel(listing.dataType)}
            </ThemedText>
          </View>
        </View>
      )}
      
      <View style={[
        styles.infoContainer, 
        isWeb && styles.webInfoContainer,
        isWeb && gridView && styles.webGridInfoContainer
      ]}>
        <View style={styles.priceContainer}>
          <ThemedText 
            type={isWeb ? (gridView ? "subtitle" : "subtitle") : "subtitle"} 
            style={styles.priceText}
          >
            ${listing.price.toFixed(2)}
          </ThemedText>
          <ThemedText style={styles.duration}>
            {formatDuration(listing.duration)}
          </ThemedText>
        </View>
        
        {isOwner ? (
          <TouchableOpacity
            style={[
              styles.shareButton,
              listing.shared ? styles.sharingActiveButton : styles.sharingInactiveButton,
              isWeb && styles.webButton,
              isWeb && gridView && styles.webGridButton
            ]}
            onPress={() => onToggleShare(listing.id)}>
            <ThemedText style={[
              listing.shared ? styles.sharingActiveText : styles.sharingButtonText,
              isWeb && styles.webButtonText
            ]}>
              {listing.shared ? 'Sharing' : 'Share'}
            </ThemedText>
          </TouchableOpacity>
        ) : (
          <View style={styles.statsContainer}>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={isWeb ? 18 : 16} color="#FFB800" />
              <ThemedText style={styles.ratingTextStyle}>
                {listing.providerRating.toFixed(1)}
              </ThemedText>
            </View>
            <ThemedText style={styles.soldTextStyle}>
              {listing.totalSold} sold
            </ThemedText>
          </View>
        )}
      </View>

      {isWeb && !gridView && (
        <View style={styles.webDetailsContainerStyle}>
          <View style={styles.webDetailStyle}>
            <Ionicons name="calendar-outline" size={16} color="#666" />
            <ThemedText style={styles.webDetailTextStyle}>
              Updated {Math.floor(Math.random() * 24) + 1}h ago
            </ThemedText>
          </View>
          
          <View style={styles.webDetailStyle}>
            <Ionicons name="cloud-download-outline" size={16} color="#666" />
            <ThemedText style={styles.webDetailTextStyle}>
              {Math.floor(Math.random() * 100) + 10}MB
            </ThemedText>
          </View>
          
          <View style={styles.webDetailStyle}>
            <Ionicons name="repeat-outline" size={16} color="#666" />
            <ThemedText style={styles.webDetailTextStyle}>
              {Math.floor(Math.random() * 60) + 1}min updates
            </ThemedText>
          </View>
        </View>
      )}

      <View style={styles.footerStyle}>
        <View style={styles.providerContainerStyle}>
          <Ionicons 
            name="person-circle-outline" 
            size={isWeb ? 18 : 16} 
            color="#666" 
          />
          <ThemedText style={styles.providerTextStyle}>
            {listing.provider}
          </ThemedText>
          
          {isWeb && extendedListing.providerVerified && !gridView && (
            <View style={styles.verifiedBadgeStyle}>
              <Ionicons name="checkmark-circle" size={14} color="#4CD964" />
              <ThemedText style={styles.verifiedTextStyle}>Verified</ThemedText>
            </View>
          )}
        </View>
        
        {!isOwner && (
          <TouchableOpacity style={styles.buyButtonStyle}>
            <ThemedText style={styles.buyButtonTextStyle}>
              {gridView ? 'Buy' : 'Purchase'}
            </ThemedText>
          </TouchableOpacity>
        )}
      </View>
      
      {isWeb && !isOwner && !gridView && (
        <View style={styles.webCompanyInfoStyle}>
          <TouchableOpacity style={styles.webInfoButtonStyle}>
            <ThemedText style={styles.webInfoButtonTextStyle}>
              View Provider Details
            </ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.webInfoButtonStyle}>
            <ThemedText style={styles.webInfoButtonTextStyle}>
              Sample Data
            </ThemedText>
          </TouchableOpacity>
        </View>
      )}
      
      {/* Quick Preview overlay for web grid view */}
      {isWeb && gridView && isPreviewVisible && (
        <View style={styles.previewOverlayStyle}>
          <View style={styles.previewContentStyle}>
            <ThemedText style={styles.previewTitleStyle}>
              Preview: {listing.title}
            </ThemedText>
            
            <View style={styles.previewDetailStyle}>
              <Ionicons name="information-circle-outline" size={16} color="#FFF" />
              <ThemedText style={styles.previewTextStyle}>
                {listing.description}
              </ThemedText>
            </View>
            
            <View style={styles.previewDetailStyle}>
              <Ionicons name="calendar-outline" size={16} color="#FFF" />
              <ThemedText style={styles.previewTextStyle}>
                Updated {Math.floor(Math.random() * 24) + 1}h ago
              </ThemedText>
            </View>
            
            <View style={styles.previewDetailStyle}>
              <Ionicons name="cloud-download-outline" size={16} color="#FFF" />
              <ThemedText style={styles.previewTextStyle}>
                {Math.floor(Math.random() * 100) + 10}MB
              </ThemedText>
            </View>
            
            <View style={styles.previewActionsStyle}>
              <TouchableOpacity style={styles.previewButtonStyle}>
                <ThemedText style={styles.previewButtonTextStyle}>
                  Quick View
                </ThemedText>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.previewPrimaryButtonStyle}>
                <ThemedText style={styles.previewPrimaryButtonTextStyle}>
                  Purchase
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </AnimatedThemedView>
  );
};

interface Styles {
  container: ViewStyle;
  webContainer: ViewStyle;
  webContainerHovered: ViewStyle;
  webGridContainer: ViewStyle;
  featuredContainer: ViewStyle;
  featuredBadge: ViewStyle;
  featuredText: TextStyle;
  featuredIconContainer: ViewStyle;
  header: ViewStyle;
  webHeader: ViewStyle;
  webGridHeader: ViewStyle;
  iconContainer: ViewStyle;
  webIconContainer: ViewStyle;
  webGridIconContainer: ViewStyle;
  titleContainer: ViewStyle;
  webGridTitleContainer: ViewStyle;
  webTitleRow: ViewStyle;
  description: TextStyle;
  webDescription: TextStyle;
  webGridDescription: TextStyle;
  webGridCategoryRow: ViewStyle;
  webCategoryBadge: ViewStyle;
  webCategoryText: TextStyle;
  infoContainer: ViewStyle;
  webInfoContainer: ViewStyle;
  webGridInfoContainer: ViewStyle;
  priceContainer: ViewStyle;
  priceText: TextStyle;
  duration: TextStyle;
  statsContainer: ViewStyle;
  ratingContainer: ViewStyle;
  ratingTextStyle: TextStyle;
  soldTextStyle: TextStyle;
  webDetailsContainerStyle: ViewStyle;
  webDetailStyle: ViewStyle;
  webDetailTextStyle: TextStyle;
  footerStyle: ViewStyle;
  providerContainerStyle: ViewStyle;
  providerTextStyle: TextStyle;
  verifiedBadgeStyle: ViewStyle;
  verifiedTextStyle: TextStyle;
  buyButtonStyle: ViewStyle;
  buyButtonTextStyle: TextStyle;
  shareButton: ViewStyle;
  webButton: ViewStyle;
  webGridButton: ViewStyle;
  webButtonText: TextStyle;
  sharingInactiveButton: ViewStyle;
  sharingActiveButton: ViewStyle;
  sharingButtonText: TextStyle;
  sharingActiveText: TextStyle;
  webCompanyInfoStyle: ViewStyle;
  webInfoButtonStyle: ViewStyle;
  webInfoButtonTextStyle: TextStyle;
  previewOverlayStyle: ViewStyle;
  previewContentStyle: ViewStyle;
  previewTitleStyle: TextStyle;
  previewDetailStyle: ViewStyle;
  previewTextStyle: TextStyle;
  previewActionsStyle: ViewStyle;
  previewButtonStyle: ViewStyle;
  previewButtonTextStyle: TextStyle;
  previewPrimaryButtonStyle: ViewStyle;
  previewPrimaryButtonTextStyle: TextStyle;
}

const styles = StyleSheet.create<Styles>({
  container: {
    padding: 16,
    borderRadius: 12,
    marginVertical: 8,
    width: '100%',
  },
  webContainer: {
    padding: 20,
    borderRadius: 12,
    marginVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    // Removed unsupported 'transition' property
  },
  webContainerHovered: {
    shadowOpacity: 0.12,
    shadowRadius: 12,
    transform: [{ translateY: -2 }],
  },
  webGridContainer: {
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 8,
    width: '50%', // Changed from 'calc(50% - 16px)' to '50%'
    maxWidth: 380,
    position: 'relative',
  },
  featuredContainer: {
    borderWidth: 1,
    borderColor: '#FF9500',
    shadowColor: '#FF9500',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    position: 'relative',
  },
  featuredBadge: {
    position: 'absolute',
    top: 0,
    right: 20,
    backgroundColor: '#FF9500',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  featuredText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 12,
    marginLeft: 4,
  },
  featuredIconContainer: {
    backgroundColor: 'rgba(255, 149, 0, 0.1)',
  },
  header: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  webHeader: {
    marginBottom: 16,
  },
  webGridHeader: {
    marginBottom: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  webIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 10,
    marginRight: 16,
  },
  webGridIconContainer: {
    width: 40,
    height: 40,
    marginRight: 12,
  },
  titleContainer: {
    flex: 1,
  },
  webGridTitleContainer: {
    maxHeight: 62,
    overflow: 'hidden',
  },
  webTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  description: {
    opacity: 0.7,
    fontSize: 14,
    marginTop: 2,
  },
  webDescription: {
    fontSize: 15,
    marginTop: 4,
    lineHeight: 22,
  },
  webGridDescription: {
    fontSize: 14,
    marginTop: 2,
    lineHeight: 20,
  },
  webGridCategoryRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  webCategoryBadge: {
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
    marginLeft: 12,
  },
  webCategoryText: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '600',
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  webInfoContainer: {
    marginBottom: 16,
  },
  webGridInfoContainer: {
    marginBottom: 12,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  priceText: {
    color: '#007AFF',
  },
  duration: {
    fontSize: 14,
    opacity: 0.7,
    marginLeft: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  ratingTextStyle: {
    marginLeft: 4,
    fontWeight: '600',
    fontSize: 16,
  },
  soldTextStyle: {
    opacity: 0.7,
    fontSize: 14,
  },
  footerStyle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  providerContainerStyle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  providerTextStyle: {
    marginLeft: 4,
    fontSize: 14,
    opacity: 0.8,
    fontWeight: '500',
  },
  verifiedBadgeStyle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  verifiedTextStyle: {
    fontSize: 12,
    color: '#4CD964',
    marginLeft: 2,
  },
  buyButtonStyle: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  buyButtonTextStyle: {
    color: 'white',
    fontWeight: '600',
    fontSize: 15,
  },
  shareButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  webButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  webGridButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  webButtonText: {
    fontSize: 15,
  },
  sharingInactiveButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  sharingActiveButton: {
    backgroundColor: '#4CD964',
  },
  sharingButtonText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  sharingActiveText: {
    color: 'white',
    fontWeight: '600',
  },
  webDetailsContainerStyle: {
    flexDirection: 'row',
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  webDetailStyle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
    marginBottom: 8,
  },
  webDetailTextStyle: {
    marginLeft: 6,
    fontSize: 14,
    opacity: 0.7,
  },
  webCompanyInfoStyle: {
    marginTop: 16,
    flexDirection: 'row',
  },
  webInfoButtonStyle: {
    marginRight: 12,
    paddingVertical: 8,
  },
  webInfoButtonTextStyle: {
    fontSize: 14,
    color: '#007AFF',
    textDecorationLine: 'underline',
  },
  previewOverlayStyle: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  previewContentStyle: {
    width: '100%',
  },
  previewTitleStyle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  previewDetailStyle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  previewTextStyle: {
    color: 'white',
    marginLeft: 8,
    fontSize: 14,
  },
  previewActionsStyle: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  previewButtonStyle: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    marginHorizontal: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  previewButtonTextStyle: {
    color: 'white',
    fontWeight: '600',
  },
  previewPrimaryButtonStyle: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    marginHorizontal: 6,
  },
  previewPrimaryButtonTextStyle: {
    color: 'white',
    fontWeight: '600',
  },
});