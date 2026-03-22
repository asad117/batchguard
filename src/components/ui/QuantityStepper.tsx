import { Minus, Plus } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface StepperProps {
  value: number;
  onChange: (newValue: number) => void;
}

export const QuantityStepper = ({ value, onChange }: StepperProps) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.button} 
        onPress={() => onChange(Math.max(1, value - 1))}
      >
        <Minus size={20} color="#4B5563" />
      </TouchableOpacity>
      
      <View style={styles.valueContainer}>
        <Text style={styles.valueText}>{value}</Text>
      </View>
      
      <TouchableOpacity 
        style={styles.button} 
        onPress={() => onChange(value + 1)}
      >
        <Plus size={20} color="#4B5563" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 4,
    alignSelf: 'center',
    marginBottom: 20,
  },
  button: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  valueContainer: {
    paddingHorizontal: 24,
  },
  valueText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
});