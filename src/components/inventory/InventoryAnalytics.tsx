import React, { useMemo } from 'react';
import { StyleSheet, Text, View, Dimensions } from 'react-native';
import { BarChart, PieChart } from 'react-native-chart-kit';
import { Batch } from '../../types/inventory';

const screenWidth = Dimensions.get('window').width - 40;

interface Props {
  batches: Batch[];
}

export const InventoryAnalytics = ({ batches }: Props) => {
  const chartData = useMemo(() => {
    const now = new Date();
    const categories: Record<string, number> = { '0-7 Days': 0, '8-30 Days': 0, '30+ Days': 0, 'Expired': 0 };
    
    // Logic for Bar Chart (Next 6 months forecast)
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = now.getMonth();
    const forecastLabels = [];
    const forecastValues = new Array(6).fill(0);

    for (let i = 0; i < 6; i++) {
      forecastLabels.push(months[(currentMonth + i) % 12]);
    }

    batches.forEach(batch => {
      const expDate = new Date(batch.expiryDate);
      const diffDays = Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 3600 * 24));
      
      // Pie Chart Data Logic
      if (diffDays < 0) categories['Expired'] += batch.quantity;
      else if (diffDays <= 7) categories['0-7 Days'] += batch.quantity;
      else if (diffDays <= 30) categories['8-30 Days'] += batch.quantity;
      else categories['30+ Days'] += batch.quantity;

      // Bar Chart Logic (Items expiring in next 6 months)
      const diffMonths = (expDate.getFullYear() - now.getFullYear()) * 12 + (expDate.getMonth() - now.getMonth());
      if (diffMonths >= 0 && diffMonths < 6) {
        forecastValues[diffMonths] += batch.quantity;
      }
    });

    const pieData = [
      { name: 'Critical', population: categories['0-7 Days'], color: '#EF4444', legendFontColor: '#4B5563', legendFontSize: 12 },
      { name: 'Warning', population: categories['8-30 Days'], color: '#F59E0B', legendFontColor: '#4B5563', legendFontSize: 12 },
      { name: 'Healthy', population: categories['30+ Days'], color: '#10B981', legendFontColor: '#4B5563', legendFontSize: 12 },
      { name: 'Expired', population: categories['Expired'], color: '#374151', legendFontColor: '#4B5563', legendFontSize: 12 },
    ].filter(item => item.population > 0);

    return { pieData, forecastLabels, forecastValues };
  }, [batches]);

  return (
    <View style={styles.container}>
      <Text style={styles.chartTitle}>Stock Distribution</Text>
      <View style={styles.card}>
        <PieChart
          data={chartData.pieData}
          width={screenWidth}
          height={180}
          chartConfig={chartConfig}
          accessor={"population"}
          backgroundColor={"transparent"}
          paddingLeft={"15"}
          absolute
        />
      </View>

      {/* <Text style={[styles.chartTitle, { marginTop: 25 }]}>6-Month Expiry Forecast</Text>
      <View style={styles.card}>
        <BarChart
          data={{
            labels: chartData.forecastLabels,
            datasets: [{ data: chartData.forecastValues }]
          }}
          width={screenWidth - 20}
          height={220}
          yAxisLabel=""
          yAxisSuffix="u"
          chartConfig={barChartConfig}
          style={styles.barChart}
          flatColor={true}
          fromZero={true}
        />
      </View> */}
    </View>
  );
};

const chartConfig = {
  color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
};

const barChartConfig = {
  backgroundColor: "#ffffff",
  backgroundGradientFrom: "#ffffff",
  backgroundGradientTo: "#ffffff",
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`, // Blue bars
  labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
  style: { borderRadius: 16 },
  propsForBackgroundLines: { strokeDasharray: "" }, // solid background lines
};

const styles = StyleSheet.create({
  container: { marginTop: 25, paddingHorizontal: 20 },
  chartTitle: { fontSize: 18, fontWeight: '800', color: '#111827', marginBottom: 12 },
  card: { 
    backgroundColor: 'white', 
    borderRadius: 20, 
    padding: 10, 
    borderWidth: 1, 
    borderColor: '#F3F4F6',
    alignItems: 'center'
  },
  barChart: { marginVertical: 8, borderRadius: 16 }
});