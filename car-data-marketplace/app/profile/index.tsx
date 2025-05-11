import React from 'react';
import { StyleSheet, View, ScrollView, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';
import { WebLayoutWrapper } from '@/components/WebLayoutWrapper';

export default function ProfileScreen() {
  const router = useRouter();
  const backgroundColor = useThemeColor({}, 'background');
  const cardBackground = useThemeColor({}, 'background');

  return (
    <WebLayoutWrapper>
      <ScrollView
        style={[styles.container, { backgroundColor }]}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#007AFF" />
          </TouchableOpacity>
          <ThemedText type="title" style={styles.headerTitle}>Profile</ThemedText>
        </View>

        <ThemedView style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <Ionicons name="person-circle" size={80} color="#007AFF" />
            </View>
            <View style={styles.profileInfo}>
              <ThemedText type="title">John Doe</ThemedText>
              <ThemedText style={styles.emailText}>john.doe@example.com</ThemedText>
              <ThemedText style={styles.memberSince}>Member since May 2024</ThemedText>
            </View>
          </View>

          <TouchableOpacity style={styles.editButton}>
            <ThemedText style={styles.editButtonText}>Edit Profile</ThemedText>
          </TouchableOpacity>
        </ThemedView>

        <ThemedText type="subtitle" style={styles.sectionTitle}>Account Settings</ThemedText>
        
        <ThemedView style={styles.settingsCard}>
          <TouchableOpacity style={styles.settingsItem}>
            <View style={styles.settingsIcon}>
              <Ionicons name="wallet-outline" size={24} color="#007AFF" />
            </View>
            <View style={styles.settingsContent}>
              <ThemedText type="defaultSemiBold">Wallet & Payments</ThemedText>
              <ThemedText style={styles.settingsDescription}>Manage your wallet and payment methods</ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#A0A0A0" />
          </TouchableOpacity>
          
          <View style={styles.divider} />
          
          <TouchableOpacity style={styles.settingsItem}>
            <View style={styles.settingsIcon}>
              <Ionicons name="car-outline" size={24} color="#007AFF" />
            </View>
            <View style={styles.settingsContent}>
              <ThemedText type="defaultSemiBold">My Vehicles</ThemedText>
              <ThemedText style={styles.settingsDescription}>Manage your connected vehicles</ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#A0A0A0" />
          </TouchableOpacity>
          
          <View style={styles.divider} />
          
          <TouchableOpacity style={styles.settingsItem}>
            <View style={styles.settingsIcon}>
              <Ionicons name="shield-outline" size={24} color="#007AFF" />
            </View>
            <View style={styles.settingsContent}>
              <ThemedText type="defaultSemiBold">Privacy & Security</ThemedText>
              <ThemedText style={styles.settingsDescription}>Manage your privacy preferences</ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#A0A0A0" />
          </TouchableOpacity>
          
          <View style={styles.divider} />
          
          <TouchableOpacity style={styles.settingsItem}>
            <View style={styles.settingsIcon}>
              <Ionicons name="notifications-outline" size={24} color="#007AFF" />
            </View>
            <View style={styles.settingsContent}>
              <ThemedText type="defaultSemiBold">Notifications</ThemedText>
              <ThemedText style={styles.settingsDescription}>Manage your notification settings</ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#A0A0A0" />
          </TouchableOpacity>
        </ThemedView>

        <TouchableOpacity style={styles.signOutButton}>
          <ThemedText style={styles.signOutText}>Sign Out</ThemedText>
        </TouchableOpacity>
      </ScrollView>
    </WebLayoutWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '600',
  },
  profileCard: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarContainer: {
    marginRight: 20,
  },
  profileInfo: {
    flex: 1,
  },
  emailText: {
    opacity: 0.7,
    fontSize: 16,
    marginTop: 4,
  },
  memberSince: {
    opacity: 0.5,
    fontSize: 14,
    marginTop: 6,
  },
  editButton: {
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  editButtonText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  sectionTitle: {
    marginBottom: 16,
    marginTop: 8,
  },
  settingsCard: {
    borderRadius: 12,
    marginBottom: 24,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  settingsIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  settingsContent: {
    flex: 1,
  },
  settingsDescription: {
    opacity: 0.6,
    fontSize: 14,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.06)',
    marginLeft: 56,
  },
  signOutButton: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    alignItems: 'center',
    marginTop: 8,
  },
  signOutText: {
    color: '#FF3B30',
    fontWeight: '600',
  },
});