import React from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { Ionicons } from '@expo/vector-icons';

type MetricData = {
  label: string;
  value: string | number;
  unit?: string;
  icon?: string;
  color?: string;
  change?: number;
};

type CarDataMetricsProps = {
  metrics: MetricData[];
  title?: string;
  subtitle?: string;
};

export const CarDataMetrics = ({ metrics, title, subtitle }: CarDataMetricsProps) => {
  const isWeb = Platform.OS === 'web';
  
  const getChangeIcon = (change?: number) => {
    if (change === undefined) return null;
    return change > 0 ? 'arrow-up' : change < 0 ? 'arrow-down' : 'remove';
  };

  const getChangeColor = (change?: number) => {
    if (change === undefined) return 'transparent';
    return change > 0 ? '#34C759' : change < 0 ? '#FF3B30' : '#8E8E93';
  };

  return (
    <ThemedView 
      style={[styles.container, isWeb && styles.webContainer]}
      lightColor="rgba(30, 34, 42, 0.7)" 
      darkColor="rgba(30, 34, 42, 0.7)"
    >
      {(title || subtitle) && (
        <View style={[styles.header, isWeb && styles.webHeader]}>
          {title && <ThemedText type={isWeb ? "title" : "title"}>{title}</ThemedText>}
          {subtitle && (
            <ThemedText
              style={[styles.subtitle, isWeb && styles.webSubtitle]}
            >
              {subtitle}
            </ThemedText>
          )}
        </View>
      )}

      <View style={[
        styles.metricsContainer, 
        isWeb && styles.webMetricsContainer
      ]}>
        {metrics.map((metric, index) => (
          <View
            key={`${metric.label}-${index}`}
            style={[
              styles.metricItem,
              isWeb && styles.webMetricItem,
              index === metrics.length - 1 && styles.lastItem,
              isWeb && metrics.length > 2 && { 
                width: `${Math.min(100 / Math.ceil(metrics.length / 2), 33)}%` 
              }
            ]}
          >
            <View style={[
              styles.metricHeader, 
              isWeb && styles.webMetricHeader
            ]}>
              {metric.icon && (
                <View
                  style={[
                    styles.iconContainer,
                    { backgroundColor: metric.color ? `${metric.color}20` : '#007AFF20' },
                    isWeb && styles.webIconContainer
                  ]}
                >
                  <Ionicons
                    name={metric.icon as any}
                    size={isWeb ? 20 : 18}
                    color={metric.color || '#007AFF'}
                  />
                </View>
              )}
              <ThemedText style={[styles.metricLabel, isWeb && styles.webMetricLabel]}>
                {metric.label}
              </ThemedText>
            </View>
            
            <View style={styles.valueContainer}>
              <ThemedText 
                type={isWeb ? "subtitle" : "subtitle"} 
                style={isWeb && styles.webValue}
              >
                {typeof metric.value === 'number' ? metric.value.toLocaleString() : metric.value}
                {metric.unit && <ThemedText style={styles.unit}> {metric.unit}</ThemedText>}
              </ThemedText>
              
              {metric.change !== undefined && (
                <View style={[
                  styles.changeContainer,
                  { backgroundColor: `${getChangeColor(metric.change)}20` },
                  isWeb && styles.webChangeContainer
                ]}>
                  <Ionicons
                    name={getChangeIcon(metric.change) as any}
                    size={12}
                    color={getChangeColor(metric.change)}
                    style={styles.changeIcon}
                  />
                  <ThemedText
                    style={[
                      styles.changeText,
                      { color: getChangeColor(metric.change) },
                    ]}
                  >
                    {Math.abs(metric.change)}%
                  </ThemedText>
                </View>
              )}
            </View>
            
            {isWeb && (
              <View style={styles.webUnderline} />
            )}
          </View>
        ))}
      </View>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  webContainer: {
    padding: 20,
    borderRadius: 14,
    marginVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  header: {
    marginBottom: 16,
  },
  webHeader: {
    marginBottom: 20,
  },
  subtitle: {
    opacity: 0.6,
    marginTop: 4,
    fontSize: 14,
  },
  webSubtitle: {
    marginTop: 6,
    fontSize: 15,
    lineHeight: 22,
  },
  metricsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  webMetricsContainer: {
    marginHorizontal: -12,
  },
  metricItem: {
    width: '50%',
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  webMetricItem: {
    paddingHorizontal: 12,
    marginBottom: 24,
  },
  lastItem: {
    marginBottom: 0,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  webMetricHeader: {
    marginBottom: 8,
  },
  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  webIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    marginRight: 10,
  },
  metricLabel: {
    fontSize: 14,
    opacity: 0.7,
  },
  webMetricLabel: {
    fontSize: 15,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  webValue: {
    fontSize: 20,
  },
  unit: {
    fontSize: 14,
    opacity: 0.6,
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  webChangeContainer: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  changeIcon: {
    marginRight: 2,
  },
  changeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  webUnderline: {
    position: 'absolute',
    bottom: -12,
    left: 12,
    right: 12,
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
});