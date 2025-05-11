import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, FlatList, ListRenderItem, Alert, View, Platform, TouchableOpacity, ScrollView, useWindowDimensions } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { MarketplaceListing } from '@/components/MarketplaceListing';
import { MarketplaceListingType } from '@/types/CarData';
import { carDataService } from '@/services/carDataService';
import { WebLayoutWrapper } from '@/components/WebLayoutWrapper';

export default function MarketplaceScreen() {
  const [myListings, setMyListings] = useState<MarketplaceListingType[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'price'>('recent');
  const isWeb = Platform.OS === 'web';
  const windowDimensions = useWindowDimensions();
  
  // Default to grid view on web
  useEffect(() => {
    if (isWeb) {
      setViewMode('grid');
    }
  }, [isWeb]);
  
  // Load data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadListings();
    }, [])
  );
  
  const loadListings = async () => {
    setLoading(true);
    try {
      const listings = await carDataService.getMarketplaceListings();
      
      // Display all listings at once for a longer page
      setMyListings(listings);
    } catch (error) {
      console.error('Error loading listings:', error);
      Alert.alert('Error', 'Failed to load marketplace listings');
    } finally {
      setLoading(false);
    }
  };
  
  const handleToggleSharing = async (id: string) => {
    try {
      const success = await carDataService.toggleDataSharing(id);
      if (success) {
        // Refresh listings after toggling
        const updatedListings = await carDataService.getMarketplaceListings();
        setMyListings(updatedListings);
        
        // Find the listing that was toggled
        const listing = updatedListings.find(l => l.id === id);
        if (listing?.shared) {
          Alert.alert(
            'Data Sharing Activated',
            `You're now sharing your ${listing.title} data. You'll earn rewards based on usage.`,
            [{ text: 'OK' }]
          );
        }
      }
    } catch (error) {
      console.error('Error toggling data sharing:', error);
      Alert.alert('Error', 'Failed to update data sharing settings');
    }
  };
  
  const setSortOption = (option: 'recent' | 'popular' | 'price') => {
    setSortBy(option);
    
    // Sort the listings based on the selected option
    const sortedListings = [...myListings];
    
    switch(option) {
      case 'recent':
        // Sort by most recent (using id as proxy for timestamp)
        sortedListings.sort((a, b) => parseInt(b.id) - parseInt(a.id));
        break;
      case 'popular':
        // Sort by popularity using totalSold
        sortedListings.sort((a, b) => b.totalSold - a.totalSold);
        break;
      case 'price':
        // Sort by price low to high
        sortedListings.sort((a, b) => a.price - b.price);
        break;
    }
    
    setMyListings(sortedListings);
  };

  // Calculate the optimal number of columns based on screen width
  const getNumColumns = () => {
    if (!isWeb || viewMode !== 'grid') return 1;
    
    // For larger screens, show more columns
    if (windowDimensions.width > 1600) return 4;
    if (windowDimensions.width > 1200) return 3;
    return 2;
  };

  const renderListingItem: ListRenderItem<MarketplaceListingType> = ({ item }) => {
    return (
      <MarketplaceListing
        listing={item}
        onToggleShare={handleToggleSharing}
        isOwner={true}
        gridView={viewMode === 'grid'}
      />
    );
  };

  const MainContent = (
    <ScrollView 
      style={styles.scrollContainer}
      contentContainerStyle={styles.scrollContentContainer}
      showsVerticalScrollIndicator={false}
      scrollEventThrottle={16}
    >
      <ThemedText style={styles.subtitle}>
        Share your vehicle data and earn rewards through our decentralized marketplace
      </ThemedText>

      {isWeb && (
        <View style={styles.webHeaderControls}>
          <View style={styles.sortControls}>
            <ThemedText style={styles.sortLabel}>Sort by:</ThemedText>
            <TouchableOpacity 
              style={[styles.sortOption, sortBy === 'recent' && styles.sortOptionActive]}
              onPress={() => setSortOption('recent')}
            >
              <ThemedText style={[styles.sortOptionText, sortBy === 'recent' && styles.sortOptionTextActive]}>
                Recent
              </ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.sortOption, sortBy === 'popular' && styles.sortOptionActive]}
              onPress={() => setSortOption('popular')}
            >
              <ThemedText style={[styles.sortOptionText, sortBy === 'popular' && styles.sortOptionTextActive]}>
                Popular
              </ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.sortOption, sortBy === 'price' && styles.sortOptionActive]}
              onPress={() => setSortOption('price')}
            >
              <ThemedText style={[styles.sortOptionText, sortBy === 'price' && styles.sortOptionTextActive]}>
                Price
              </ThemedText>
            </TouchableOpacity>
          </View>
          
          <View style={styles.viewModeControls}>
            <TouchableOpacity
              style={[styles.viewModeButton, viewMode === 'grid' && styles.viewModeButtonActive]}
              onPress={() => setViewMode('grid')}
            >
              <Ionicons
                name="grid-outline"
                size={20}
                color={viewMode === 'grid' ? '#007AFF' : '#999'}
              />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.viewModeButton, viewMode === 'list' && styles.viewModeButtonActive]}
              onPress={() => setViewMode('list')}
            >
              <Ionicons
                name="list-outline"
                size={20}
                color={viewMode === 'list' ? '#007AFF' : '#999'}
              />
            </TouchableOpacity>
          </View>
        </View>
      )}

      <View style={styles.sectionHeader}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>Your Data Sharing Options</ThemedText>
        <ThemedText style={styles.dataInfoText}>
          Choose which types of data you want to share
        </ThemedText>
      </View>

      {/* Replace FlatList with direct rendering for more control */}
      <View 
        style={[
          styles.listingsGrid,
          viewMode === 'grid' && isWeb && styles.gridContainer,
        ]}
      >
        {myListings.map((item) => (
          <View 
            key={item.id}
            style={[
              styles.listingWrapper,
              viewMode === 'grid' && isWeb && styles.gridItemWrapper,
              {width: viewMode === 'grid' && isWeb ? `${100 / getNumColumns() - 1}%` : '100%'}
            ]}
          >
            <MarketplaceListing
              listing={item}
              onToggleShare={handleToggleSharing}
              isOwner={true}
              gridView={viewMode === 'grid'}
            />
          </View>
        ))}
      </View>
      
      <ThemedView style={styles.infoCard}>
        <View style={styles.infoHeader}>
          <Ionicons name="information-circle" size={24} color="#007AFF" />
          <ThemedText type="defaultSemiBold">How It Works</ThemedText>
        </View>
        <ThemedText style={styles.infoText}>
          1. Select which types of car data you want to share
        </ThemedText>
        <ThemedText style={styles.infoText}>
          2. Your data is encrypted and securely shared on the DePIN network
        </ThemedText>
        <ThemedText style={styles.infoText}>
          3. Earn tokens when others purchase access to aggregated data
        </ThemedText>
        <ThemedText style={styles.infoText}>
          4. Check your wallet on the home screen for earnings
        </ThemedText>
      </ThemedView>

      {/* Add more info to make the page longer */}
      <ThemedView style={[styles.infoCard, styles.benefitsCard]}>
        <View style={styles.infoHeader}>
          <Ionicons name="star" size={24} color="#007AFF" />
          <ThemedText type="defaultSemiBold">Benefits of Sharing Your Data</ThemedText>
        </View>
        
        <View style={styles.benefitItem}>
          <Ionicons name="cash-outline" size={22} color="#007AFF" style={styles.benefitIcon} />
          <View style={styles.benefitContent}>
            <ThemedText type="defaultSemiBold">Earn Passive Income</ThemedText>
            <ThemedText style={styles.benefitText}>
              Generate ongoing revenue from your vehicle&apos;s data while you drive
            </ThemedText>
          </View>
        </View>
        
        <View style={styles.benefitItem}>
          <Ionicons name="lock-closed-outline" size={22} color="#007AFF" style={styles.benefitIcon} />
          <View style={styles.benefitContent}>
            <ThemedText type="defaultSemiBold">Privacy Preserved</ThemedText>
            <ThemedText style={styles.benefitText}>
              All data is anonymized and encrypted to protect your privacy
            </ThemedText>
          </View>
        </View>
        
        <View style={styles.benefitItem}>
          <Ionicons name="globe-outline" size={22} color="#007AFF" style={styles.benefitIcon} />
          <View style={styles.benefitContent}>
            <ThemedText type="defaultSemiBold">Support Innovation</ThemedText>
            <ThemedText style={styles.benefitText}>
              Your data helps improve vehicle technology, traffic patterns, and urban planning
            </ThemedText>
          </View>
        </View>
        
        <View style={styles.benefitItem}>
          <Ionicons name="analytics-outline" size={22} color="#007AFF" style={styles.benefitIcon} />
          <View style={styles.benefitContent}>
            <ThemedText type="defaultSemiBold">Access Insights</ThemedText>
            <ThemedText style={styles.benefitText}>
              Get personalized driving analytics and performance recommendations
            </ThemedText>
          </View>
        </View>
      </ThemedView>
      
      <ThemedView style={[styles.infoCard, styles.faqCard]}>
        <View style={styles.infoHeader}>
          <Ionicons name="help-circle-outline" size={24} color="#007AFF" />
          <ThemedText type="defaultSemiBold">Frequently Asked Questions</ThemedText>
        </View>
        
        <ThemedText type="defaultSemiBold" style={styles.faqQuestion}>
          How secure is my data?
        </ThemedText>
        <ThemedText style={styles.faqAnswer}>
          All data is encrypted using industry-standard protocols before being shared on the network. 
          Personal identifiers are removed, and you maintain control over what types of data you share.
        </ThemedText>
        
        <ThemedText type="defaultSemiBold" style={styles.faqQuestion}>
          How are earnings calculated?
        </ThemedText>
        <ThemedText style={styles.faqAnswer}>
          Earnings are based on the volume and value of the data you share. More valuable data types
          (like diagnostic information) generally earn more than basic data. Payments are made in tokens
          that can be converted to other cryptocurrencies or fiat currencies.
        </ThemedText>
        
        <ThemedText type="defaultSemiBold" style={styles.faqQuestion}>
          Can I stop sharing my data at any time?
        </ThemedText>
        <ThemedText style={styles.faqAnswer}>
          Yes, you can toggle data sharing on or off for each data type at any time through this dashboard.
          Changes take effect immediately.
        </ThemedText>
        
        <ThemedText type="defaultSemiBold" style={styles.faqQuestion}>
          What companies or organizations use this data?
        </ThemedText>
        <ThemedText style={styles.faqAnswer}>
          Data purchasers include automotive manufacturers, research institutions, urban planners, 
          insurance companies, and technology developers. All data users are verified and must adhere
          to strict usage policies.
        </ThemedText>
      </ThemedView>
    </ScrollView>
  );

  // Use WebLayoutWrapper only on web platform
  return isWeb ? (
    <WebLayoutWrapper>
      <ThemedView style={styles.container}>
        {isWeb && (
          <View style={styles.webHeader}>
            <ThemedText style={styles.webHeaderTitle}>Explore Data Marketplace</ThemedText>
            <ThemedText style={styles.webSubtitle}>
              {myListings.length} data packages available from verified providers
            </ThemedText>
          </View>
        )}
        {MainContent}
      </ThemedView>
    </WebLayoutWrapper>
  ) : (
    <ThemedView style={styles.container}>
      {MainContent}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  webHeader: {
    marginBottom: 24,
  },
  webHeaderTitle: {
    fontSize: 26,
    fontWeight: '600',
    marginBottom: 8,
  },
  webSubtitle: {
    fontSize: 16,
    opacity: 0.7,
    marginBottom: 16,
  },
  webHeaderControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  viewToggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  viewToggleLabel: {
    fontSize: 14,
    marginRight: 8,
    opacity: 0.7,
  },
  viewToggleButtons: {
    flexDirection: 'row',
    borderRadius: 8,
    overflow: 'hidden',
  },
  viewToggleButton: {
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewToggleButtonActive: {
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  badgeText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  subtitle: {
    opacity: 0.7,
    marginBottom: 24,
  },
  sectionHeader: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  dataInfoText: {
    opacity: 0.7,
    marginTop: 4,
    fontSize: 16,
  },
  listingsGrid: {
    display: 'flex',
    flexDirection: 'column',
    marginBottom: 24,
  },
  listingWrapper: {
    marginBottom: 16,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridItemWrapper: {
    marginBottom: 24,
  },
  infoCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  infoText: {
    marginBottom: 8,
  },
  benefitsCard: {
    marginTop: 12,
  },
  benefitItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  benefitIcon: {
    marginTop: 2,
    marginRight: 12,
    width: 24,
    alignItems: 'center',
  },
  benefitContent: {
    flex: 1,
  },
  benefitText: {
    opacity: 0.8,
    marginTop: 2,
  },
  faqCard: {
    marginTop: 8,
  },
  faqQuestion: {
    marginBottom: 8,
  },
  faqAnswer: {
    opacity: 0.8,
    marginBottom: 20,
  },
  sortControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sortLabel: {
    marginRight: 10,
    fontSize: 14,
  },
  sortOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  sortOptionActive: {
    backgroundColor: 'rgba(0,122,255,0.1)',
  },
  sortOptionText: {
    fontSize: 14,
  },
  sortOptionTextActive: {
    color: '#007AFF',
    fontWeight: '500',
  },
  viewModeControls: {
    flexDirection: 'row',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    overflow: 'hidden',
  },
  viewModeButton: {
    padding: 8,
    width: 40,
    alignItems: 'center',
  },
  viewModeButtonActive: {
    backgroundColor: 'rgba(0,122,255,0.1)',
  },
});
