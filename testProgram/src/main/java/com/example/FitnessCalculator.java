package com.example;

public class FitnessCalculator {

    // Calculates BMI given weight (kg) and height (m)
    public double calculateBMI(double weightKg, double heightM) {
        if (weightKg <= 0 || heightM <= 0) {
            throw new IllegalArgumentException("Weight and height must be positive values.");
        }
        return weightKg / (heightM * heightM);
    }

    // Returns a textual category based on BMI result
    public String classifyBMI(double bmi) {
        if (bmi < 18.5) {
            return "Underweight";
        } else if (bmi < 24.9) {
            return "Normal weight";
        } else if (bmi < 29.9) {
            return "Overweight";
        } else {
            return "Obese";
        }
    }
}
