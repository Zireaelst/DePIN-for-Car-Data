import React, { useState } from 'react';
import { View, StyleSheet, Dimensions, ScrollView, Platform, TouchableOpacity } from 'react-native';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { CarData } from '../types/CarData';
import { useThemeColor } from '@/hooks/useThemeColor';

type DataChartProps = {
  data: CarData[];
  chartType: 'speed' | 'rpm' | 'fuelLevel' | 'engineTemp';
  title: string;
  compact?: boolean;
};

export const DataChart = ({ data, chartType, title, compact = false }: DataChartProps) => {
  const [timeRange, setTimeRange] = useState<'hour' | 'day' | 'week'>('hour');
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const accentColor = '#007AFF'; // Apple blue color
  const isWeb = Platform.OS === 'web';
  
  // Ensure we have data to display
  if (!data.length) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>No data available</ThemedText>
      </ThemedView>
    );
  }

  // For simulation, we'll filter data based on selected time range
  // In a real app, you'd fetch different data from your backend
  const filteredData = timeRange === 'hour' ? data.slice(-60) : 
                      timeRange === 'day' ? data.slice(-144) : 
                      data; // week - all data

  // Prepare data for the chart
  const chartData = {
    labels: filteredData.map((_, i) => {
      // For x-axis labels, show fewer labels for readability
      // On web, we'll show more labels for wider screens
      const interval = timeRange === 'hour' ? (isWeb ? 5 : 10) :
                      timeRange === 'day' ? (isWeb ? 12 : 24) : 
                      (isWeb ? 24 : 48);
                      
      const label = timeRange === 'hour' ? `${i}m` :
                    timeRange === 'day' ? `${Math.floor(i/6)}h` :
                    `${Math.floor(i/24)}d`;
                    
      return i % interval === 0 ? label : '';
    }),
    datasets: [
      {
        data: filteredData.map(item => {
          switch (chartType) {
            case 'speed':
              return item.speed;
            case 'rpm':
              return item.rpm;
            case 'fuelLevel':
              return item.fuelLevel;
            case 'engineTemp':
              return item.engineTemp;
            default:
              return 0;
          }
        }),
        color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
        strokeWidth: isWeb ? 3 : 2,
      },
    ],
  };

  // Get min and max values for better y-axis scaling
  const dataValues = chartData.datasets[0].data;
  const minValue = Math.min(...dataValues);
  const maxValue = Math.max(...dataValues);
  const avgValue = dataValues.reduce((sum, val) => sum + val, 0) / filteredData.length;
  
  // Format number values to be more readable
  const formatValue = (value: number): string => {
    if (chartType === 'fuelLevel') {
      return value.toFixed(1) + '%';
    } else if (chartType === 'engineTemp') {
      return value.toFixed(0) + '°F';
    } else if (chartType === 'speed') {
      return value.toFixed(0) + ' mph';
    } else {
      return value.toFixed(0);
    }
  };

  // Customize chart based on data type
  const getChartConfig = () => {
    return {
      backgroundColor,
      backgroundGradientFrom: backgroundColor,
      backgroundGradientTo: backgroundColor,
      decimalPlaces: chartType === 'fuelLevel' ? 1 : 0,
      color: (opacity = 1) => `rgba(0, 122, 255, ${Math.min(opacity * 1.2, 1)})`,
      labelColor: () => textColor,
      style: {
        borderRadius: isWeb ? 12 : 16,
      },
      propsForDots: {
        r: isWeb ? '3' : '4',
        strokeWidth: '1',
        stroke: accentColor,
      },
      propsForLabels: {
        fontSize: isWeb ? 12 : 10,
      },
      // Custom y-axis scaling for better readability
      yAxisInterval: 5,
    };
  };

  // Get y-axis label based on chart type
  const getYAxisLabel = () => {
    switch (chartType) {
      case 'speed':
        return 'mph';
      case 'rpm':
        return 'RPM';
      case 'fuelLevel':
        return '%';
      case 'engineTemp':
        return '°F';
      default:
        return '';
    }
  };

  // Define chart dimensions based on platform
  const screenWidth = Dimensions.get('window').width;
  const chartWidth = 
    isWeb ? 
      (compact ? Math.min(screenWidth * 0.8, 600) : Math.min(screenWidth * 0.85, 1000)) : 
      (compact ? screenWidth * 0.9 : screenWidth * 1.5);
  
  const chartHeight = isWeb ? (compact ? 200 : 280) : (compact ? 180 : 220);
  
  // Custom time range selector for web
  const renderWebTimeRangeSelector = () => {
    if (!isWeb) return null;
    
    return (
      <View style={styles.timeRangeSelector}>
        <TouchableOpacity 
          style={[styles.timeRangeButton, timeRange === 'hour' && styles.activeTimeRange]}
          onPress={() => setTimeRange('hour')}
        >
          <ThemedText style={[styles.timeRangeText, timeRange === 'hour' && styles.activeTimeRangeText]}>
            Hour
          </ThemedText>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.timeRangeButton, timeRange === 'day' && styles.activeTimeRange]}
          onPress={() => setTimeRange('day')}
        >
          <ThemedText style={[styles.timeRangeText, timeRange === 'day' && styles.activeTimeRangeText]}>
            Day
          </ThemedText>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.timeRangeButton, timeRange === 'week' && styles.activeTimeRange]}
          onPress={() => setTimeRange('week')}
        >
          <ThemedText style={[styles.timeRangeText, timeRange === 'week' && styles.activeTimeRangeText]}>
            Week
          </ThemedText>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <ThemedView style={[
      styles.container, 
      compact && styles.compactContainer,
      isWeb && styles.webContainer
    ]}>
      <View style={styles.chartHeader}>
        <ThemedText type="subtitle" style={styles.title}>{title}</ThemedText>
        
        {isWeb && !compact && (
          <View style={styles.webActions}>
            {renderWebTimeRangeSelector()}
            <TouchableOpacity style={styles.downloadButton}>
              <Ionicons name="download-outline" size={18} color={textColor} />
              <ThemedText style={styles.downloadText}>Export</ThemedText>
            </TouchableOpacity>
          </View>
        )}
      </View>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={isWeb ? styles.webChartContainer : undefined}
      >
        <LineChart
          data={chartData}
          width={chartWidth}
          height={chartHeight}
          chartConfig={getChartConfig()}
          bezier
          withShadow={isWeb}
          withInnerLines={!compact || isWeb}
          withOuterLines={true}
          withVerticalLines={!compact || isWeb}
          withHorizontalLines={true}
          yAxisLabel={getYAxisLabel() + ' '}
          style={isWeb ? {...styles.chart, ...styles.webChart} : styles.chart}
          segments={isWeb ? 6 : 4}
        />
      </ScrollView>
      
      <View style={[styles.statsRow, isWeb && styles.webStatsRow]}>
        <View style={styles.statItem}>
          <ThemedText style={styles.statLabel}>Average</ThemedText>
          <ThemedText type={isWeb ? "subtitle" : "defaultSemiBold"} style={styles.statValue}>
            {formatValue(avgValue)}
          </ThemedText>
        </View>
        
        <View style={styles.statItem}>
          <ThemedText style={styles.statLabel}>Maximum</ThemedText>
          <ThemedText type={isWeb ? "subtitle" : "defaultSemiBold"} style={[styles.statValue, styles.maxValue]}>
            {formatValue(maxValue)}
          </ThemedText>
        </View>
        
        <View style={styles.statItem}>
          <ThemedText style={styles.statLabel}>Minimum</ThemedText>
          <ThemedText type={isWeb ? "subtitle" : "defaultSemiBold"} style={styles.statValue}>
            {formatValue(minValue)}
          </ThemedText>
        </View>

        {isWeb && (
          <View style={styles.statItem}>
            <ThemedText style={styles.statLabel}>Current</ThemedText>
            <ThemedText type="subtitle" style={[styles.statValue, styles.currentValue]}>
              {formatValue(dataValues[dataValues.length - 1])}
            </ThemedText>
          </View>
        )}
      </View>
      
      {isWeb && !compact && (
        <View style={styles.webInfoRow}>
          <ThemedText style={styles.infoText}>
            {chartType === 'speed' && 'Average driving speed over the last hour, showing traffic patterns and driving habits.'}
            {chartType === 'rpm' && 'Engine RPM trends showing engine performance and driving behavior patterns.'}
            {chartType === 'fuelLevel' && 'Fuel consumption patterns helping identify efficiency opportunities.'}
            {chartType === 'engineTemp' && 'Engine temperature variations that may indicate maintenance needs.'}
          </ThemedText>
        </View>
      )}
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    marginVertical: 8,
    width: '100%',
  },
  compactContainer: {
    padding: 12,
    marginVertical: 4,
  },
  webContainer: {
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    padding: 20,
    marginVertical: 12,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    marginBottom: 0,
  },
  webActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  periodSelector: {
    fontSize: 14,
    opacity: 0.7,
  },
  periodOption: {
    color: '#007AFF',
    textDecorationLine: 'underline',
  },
  chart: {
    borderRadius: 16,
    marginHorizontal: -8,
  },
  webChart: {
    borderRadius: 12,
    marginHorizontal: 0,
    alignSelf: 'center',
  },
  webChartContainer: {
    justifyContent: 'center',
    width: '100%',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  webStatsRow: {
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    opacity: 0.7,
    fontSize: 12,
    marginBottom: 4,
  },
  statValue: {
    textAlign: 'center',
  },
  maxValue: {
    color: '#4CD964', // Green for maximum value
  },
  currentValue: {
    color: '#007AFF', // Blue for current value
  },
  webInfoRow: {
    marginTop: 12,
    paddingTop: 8,
    alignItems: 'center',
  },
  infoText: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: 'center',
    maxWidth: 700,
  },
  timeRangeSelector: {
    flexDirection: 'row',
    marginRight: 16,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 20,
    padding: 2,
  },
  timeRangeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 18,
  },
  activeTimeRange: {
    backgroundColor: '#007AFF',
  },
  timeRangeText: {
    fontSize: 14,
  },
  activeTimeRangeText: {
    color: 'white',
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 18,
  },
  downloadText: {
    fontSize: 14,
    marginLeft: 4,
  },
});