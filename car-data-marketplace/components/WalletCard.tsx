import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { UserWalletInfo } from '../types/CarData';
import { Ionicons } from '@expo/vector-icons';

type WalletCardProps = {
  walletInfo: UserWalletInfo;
  onRefresh?: () => void;
  loading?: boolean;
};

export const WalletCard = ({ walletInfo, onRefresh, loading = false }: WalletCardProps) => {
  return (
    <ThemedView 
      style={styles.container} 
      lightColor="rgba(30, 34, 42, 0.8)"
      darkColor="rgba(30, 34, 42, 0.8)"
    >
      <View style={styles.header}>
        <ThemedText type="subtitle">Your DePIN Wallet</ThemedText>
        {onRefresh && (
          <TouchableOpacity onPress={onRefresh} disabled={loading} style={styles.refreshButton}>
            <Ionicons 
              name={loading ? 'sync-circle' : 'refresh'} 
              size={20} 
              color="#007AFF"
              style={loading ? styles.spinning : undefined} 
            />
          </TouchableOpacity>
        )}
      </View>
      
      <View style={styles.balanceContainer}>
        <ThemedText style={styles.balanceLabel}>Current Balance</ThemedText>
        <View style={styles.tokenContainer}>
          <ThemedText type="title">${walletInfo.balance.toFixed(2)}</ThemedText>
          <ThemedText style={styles.tokenSymbol}>USDC</ThemedText>
        </View>
      </View>
      
      <View style={styles.detailsContainer}>
        <View style={styles.detailRow}>
          <ThemedText style={styles.detailLabel}>Wallet Address</ThemedText>
          <View style={styles.addressContainer}>
            <ThemedText style={styles.address}>
              {walletInfo.address.substring(0, 6)}...{walletInfo.address.substring(walletInfo.address.length - 4)}
            </ThemedText>
            <TouchableOpacity style={styles.copyButton}>
              <Ionicons name="copy-outline" size={16} color="#007AFF" />
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.detailRow}>
          <ThemedText style={styles.detailLabel}>Total Earnings</ThemedText>
          <ThemedText style={styles.earningsText}>${walletInfo.earnings.toFixed(2)}</ThemedText>
        </View>
        
        <View style={styles.detailRow}>
          <ThemedText style={styles.detailLabel}>Data Sharing Status</ThemedText>
          <View style={styles.statusContainer}>
            <View style={[styles.statusDot, walletInfo.sharingActive ? styles.statusActive : styles.statusInactive]} />
            <ThemedText style={walletInfo.sharingActive ? styles.statusActiveText : styles.statusInactiveText}>
              {walletInfo.sharingActive ? 'Active' : 'Inactive'}
            </ThemedText>
          </View>
        </View>
      </View>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    marginVertical: 8,
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  refreshButton: {
    padding: 4,
  },
  spinning: {
    opacity: 0.6,
  },
  balanceContainer: {
    marginBottom: 16,
  },
  balanceLabel: {
    opacity: 0.7,
    marginBottom: 4,
  },
  tokenContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  tokenSymbol: {
    marginLeft: 8,
    opacity: 0.7,
    fontSize: 16,
  },
  detailsContainer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
    paddingTop: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailLabel: {
    opacity: 0.7,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  address: {
    fontFamily: 'monospace',
    fontSize: 14,
  },
  copyButton: {
    marginLeft: 8,
    padding: 4,
  },
  earningsText: {
    fontWeight: '600',
    color: '#4CD964',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusActive: {
    backgroundColor: '#4CD964',
  },
  statusInactive: {
    backgroundColor: '#FF3B30',
  },
  statusActiveText: {
    color: '#4CD964',
    fontWeight: '600',
  },
  statusInactiveText: {
    color: '#FF3B30',
    fontWeight: '600',
  },
});