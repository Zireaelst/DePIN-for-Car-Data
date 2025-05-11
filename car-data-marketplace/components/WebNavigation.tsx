import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, Platform, TextInput, Modal } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';

/**
 * A web-specific navigation component that provides a more desktop-friendly experience
 * Only renders on web platform
 */
export const WebNavigation = () => {
  const router = useRouter();
  const currentPath = usePathname();
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  
  // Early return in a separate variable to avoid conditional hook call issues
  const shouldRenderNav = Platform.OS === 'web';

  const navItems = [
    { title: 'Dashboard', path: '/' as const, icon: 'speedometer-outline' },
    { title: 'Analytics', path: '/analytics' as const, icon: 'stats-chart-outline' },
    { title: 'Marketplace', path: '/explore' as const, icon: 'gift-outline' },
  ];

  const isActive = (path: string) => {
    if (path === '/') return currentPath === path || currentPath === '/index';
    return currentPath.includes(path);
  };

  const navigateToProfile = () => {
    console.log('Navigating to profile page');
    router.push('/profile');
    setShowUserDropdown(false);
  };

  const toggleUserDropdown = () => {
    console.log('Toggling user dropdown');
    setShowUserDropdown(prev => !prev);
    if (showNotifications) setShowNotifications(false);
  };

  const toggleNotifications = () => {
    console.log('Toggling notifications');
    // On web, directly toggle notifications dropdown
    setShowNotifications(prev => !prev);
    if (showUserDropdown) setShowUserDropdown(false);
  };

  const handleSearch = () => {
    console.log('Searching for:', searchQuery);
    // Implement search functionality
  };

  // Handle clicks outside dropdowns to close them
  useEffect(() => {
    if (Platform.OS === 'web') {
      const handleClickOutside = (e) => {
        const target = e.target;
        const userMenu = document.getElementById('user-dropdown-menu');
        const userButton = document.getElementById('user-button');
        const notifMenu = document.getElementById('notifications-dropdown');
        const notifButton = document.getElementById('notifications-button');
        
        if (showUserDropdown && userMenu && !userMenu.contains(target) && 
            userButton && !userButton.contains(target)) {
          setShowUserDropdown(false);
        }
        
        if (showNotifications && notifMenu && !notifMenu.contains(target) && 
            notifButton && !notifButton.contains(target)) {
          setShowNotifications(false);
        }
      };
      
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
    return undefined;
  }, [showUserDropdown, showNotifications]);

  // Early return but after hooks are called
  if (!shouldRenderNav) {
    return null;
  }

  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      <View style={styles.innerContainer}>
        <View style={styles.logoContainer}>
          <Ionicons name="car-sport" size={28} color="#007AFF" />
          <ThemedText type="title" style={styles.logoText}>DeCharge</ThemedText>
          <ThemedText style={styles.betaBadge}>BETA</ThemedText>
        </View>
        
        <View style={styles.navItems}>
          {navItems.map((item) => (
            <TouchableOpacity 
              key={item.path}
              style={[
                styles.navItem,
                isActive(item.path) && styles.activeNavItem
              ]}
              onPress={() => router.push(item.path)}
            >
              <Ionicons 
                name={item.icon as any} 
                size={18} 
                color={isActive(item.path) ? '#007AFF' : textColor}
                style={styles.navIcon} 
              />
              <ThemedText 
                style={[
                  styles.navText,
                  isActive(item.path) && styles.activeNavText
                ]}
              >
                {item.title}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>
        
        <View style={styles.rightSection}>
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search marketplace..."
              placeholderTextColor="rgba(0,0,0,0.4)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.nativeEvent.text)}
              onKeyPress={(e) => {
                if (e.nativeEvent.key === 'Enter') {
                  handleSearch();
                }
              }}
            />
            <TouchableOpacity 
              style={styles.searchButton}
              onPress={handleSearch}
            >
              <Ionicons name="search" size={18} color="#007AFF" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              id="notifications-button"
              style={[styles.actionButton, showNotifications && styles.activeActionButton]}
              onPress={toggleNotifications}
              accessible={true}
              accessibilityLabel="Show notifications"
            >
              <Ionicons name="notifications-outline" size={22} color={textColor} />
              <View style={styles.notificationBadge}>
                <ThemedText style={styles.notificationCount}>3</ThemedText>
              </View>
            </TouchableOpacity>
            <TouchableOpacity 
              id="user-button"
              style={[styles.userButton, styles.actionButton, showUserDropdown && styles.activeActionButton]}
              onPress={toggleUserDropdown}
              accessible={true}
              accessibilityLabel="User profile menu"
            >
              <Ionicons name="person-circle-outline" size={24} color="#007AFF" />
              <ThemedText style={styles.userName}>John D.</ThemedText>
              <Ionicons name={showUserDropdown ? "chevron-up" : "chevron-down"} size={18} color={textColor} style={styles.dropdownIcon} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
      
      {showUserDropdown && (
        <View id="user-dropdown-menu" style={styles.userDropdown}>
          <TouchableOpacity 
            style={styles.dropdownItem} 
            onPress={navigateToProfile}
          >
            <Ionicons name="person-outline" size={18} color={textColor} style={styles.dropdownIcon} />
            <ThemedText>Profile</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity style={styles.dropdownItem}>
            <Ionicons name="wallet-outline" size={18} color={textColor} style={styles.dropdownIcon} />
            <ThemedText>Wallet</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity style={styles.dropdownItem}>
            <Ionicons name="settings-outline" size={18} color={textColor} style={styles.dropdownIcon} />
            <ThemedText>Settings</ThemedText>
          </TouchableOpacity>
          <View style={styles.dropdownDivider} />
          <TouchableOpacity style={styles.dropdownItem}>
            <Ionicons name="log-out-outline" size={18} color="#FF3B30" style={styles.dropdownIcon} />
            <ThemedText style={{ color: '#FF3B30' }}>Sign Out</ThemedText>
          </TouchableOpacity>
        </View>
      )}
      
      {showNotifications && (
        <View id="notifications-dropdown" style={styles.notificationDropdown}>
          <View style={styles.notificationHeader}>
            <ThemedText type="subtitle">Notifications</ThemedText>
            <TouchableOpacity>
              <ThemedText style={styles.markAllRead}>Mark all as read</ThemedText>
            </TouchableOpacity>
          </View>
          
          <View style={styles.notificationItem}>
            <View style={[styles.notificationDot, styles.notificationUnread]} />
            <View style={styles.notificationContent}>
              <ThemedText type="defaultSemiBold">Data Purchased</ThemedText>
              <ThemedText style={styles.notificationText}>
                Your purchase of Vehicle Speed Data was successful.
              </ThemedText>
              <ThemedText style={styles.notificationTime}>3 hours ago</ThemedText>
            </View>
          </View>
          
          <View style={styles.notificationItem}>
            <View style={[styles.notificationDot, styles.notificationUnread]} />
            <View style={styles.notificationContent}>
              <ThemedText type="defaultSemiBold">New Earnings</ThemedText>
              <ThemedText style={styles.notificationText}>
                You received $2.56 from data shared by your vehicle today.
              </ThemedText>
              <ThemedText style={styles.notificationTime}>5 hours ago</ThemedText>
            </View>
          </View>
          
          <View style={styles.notificationItem}>
            <View style={styles.notificationDot} />
            <View style={styles.notificationContent}>
              <ThemedText type="defaultSemiBold">System Update</ThemedText>
              <ThemedText style={styles.notificationText}>
                DeCharge marketplace has been updated with new features.
              </ThemedText>
              <ThemedText style={styles.notificationTime}>Yesterday</ThemedText>
            </View>
          </View>
          
          <TouchableOpacity style={styles.viewAllNotifications}>
            <ThemedText style={{ color: '#007AFF' }}>View all notifications</ThemedText>
          </TouchableOpacity>
        </View>
      )}

      {/* Mobile notifications modal */}
      <Modal
        visible={showNotificationsModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowNotificationsModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowNotificationsModal(false)}
        >
          <ThemedView style={styles.notificationsModal} onStartShouldSetResponder={() => true}>
            <View style={styles.modalHeader}>
              <ThemedText type="title" style={styles.modalTitle}>Notifications</ThemedText>
              <TouchableOpacity onPress={() => setShowNotificationsModal(false)}>
                <Ionicons name="close" size={24} color={textColor} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.notificationHeader}>
              <ThemedText type="subtitle">Recent</ThemedText>
              <TouchableOpacity>
                <ThemedText style={styles.markAllRead}>Mark all as read</ThemedText>
              </TouchableOpacity>
            </View>
            
            <View style={styles.notificationItem}>
              <View style={[styles.notificationDot, styles.notificationUnread]} />
              <View style={styles.notificationContent}>
                <ThemedText type="defaultSemiBold">Data Purchased</ThemedText>
                <ThemedText style={styles.notificationText}>
                  Your purchase of Vehicle Speed Data was successful.
                </ThemedText>
                <ThemedText style={styles.notificationTime}>3 hours ago</ThemedText>
              </View>
            </View>
            
            <View style={styles.notificationItem}>
              <View style={[styles.notificationDot, styles.notificationUnread]} />
              <View style={styles.notificationContent}>
                <ThemedText type="defaultSemiBold">New Earnings</ThemedText>
                <ThemedText style={styles.notificationText}>
                  You received $2.56 from data shared by your vehicle today.
                </ThemedText>
                <ThemedText style={styles.notificationTime}>5 hours ago</ThemedText>
              </View>
            </View>
            
            <View style={styles.notificationItem}>
              <View style={styles.notificationDot} />
              <View style={styles.notificationContent}>
                <ThemedText type="defaultSemiBold">System Update</ThemedText>
                <ThemedText style={styles.notificationText}>
                  DeCharge marketplace has been updated with new features.
                </ThemedText>
                <ThemedText style={styles.notificationTime}>Yesterday</ThemedText>
              </View>
            </View>
            
            <TouchableOpacity style={styles.viewAllNotifications}>
              <ThemedText style={{ color: '#007AFF' }}>View all notifications</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </TouchableOpacity>
      </Modal>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
    position: 'relative',
    zIndex: 100,
  },
  innerContainer: {
    maxWidth: 1200,
    marginHorizontal: 'auto',
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoText: {
    marginLeft: 8,
    fontWeight: '600',
  },
  betaBadge: {
    fontSize: 10,
    backgroundColor: '#007AFF',
    color: 'white',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 6,
    fontWeight: '700',
  },
  navItems: {
    flexDirection: 'row',
    gap: 12,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  activeNavItem: {
    backgroundColor: 'rgba(0,122,255,0.1)',
  },
  navIcon: {
    marginRight: 6,
  },
  navText: {
    fontWeight: '500',
  },
  activeNavText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 20,
    paddingLeft: 16,
    width: 200,
  },
  searchInput: {
    height: 36,
    flex: 1,
    fontSize: 14,
    color: '#000',
  },
  searchButton: {
    height: 36,
    width: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
    position: 'relative',
  },
  activeActionButton: {
    backgroundColor: 'rgba(0,122,255,0.1)',
  },
  userButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,122,255,0.1)',
    paddingHorizontal: 12,
  },
  userName: {
    marginLeft: 6,
    fontWeight: '500',
  },
  dropdownIcon: {
    marginLeft: 6,
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#FF3B30',
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationCount: {
    color: 'white',
    fontSize: 10,
    fontWeight: '700',
  },
  userDropdown: {
    position: 'absolute',
    top: '100%',
    right: 24,
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    padding: 8,
    marginTop: 4,
    width: 180,
    zIndex: 1000,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 6,
  },
  dropdownDivider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.08)',
    marginVertical: 8,
  },
  notificationDropdown: {
    position: 'absolute',
    top: '100%',
    right: 24,
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    padding: 12,
    marginTop: 4,
    width: 320,
    zIndex: 1000,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.08)',
  },
  markAllRead: {
    fontSize: 12,
    color: '#007AFF',
  },
  notificationItem: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  notificationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'transparent',
    marginRight: 12,
    marginTop: 6,
  },
  notificationUnread: {
    backgroundColor: '#007AFF',
  },
  notificationContent: {
    flex: 1,
  },
  notificationText: {
    fontSize: 14,
    opacity: 0.8,
    marginTop: 2,
  },
  notificationTime: {
    fontSize: 12,
    opacity: 0.5,
    marginTop: 4,
  },
  viewAllNotifications: {
    alignItems: 'center',
    paddingVertical: 10,
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationsModal: {
    width: '90%',
    maxWidth: 400,
    borderRadius: 12,
    padding: 16,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.08)',
  },
  modalTitle: {
    fontSize: 20,
  },
});