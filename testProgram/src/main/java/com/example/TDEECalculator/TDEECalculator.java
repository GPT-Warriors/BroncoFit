package com.example.TDEECalculator;

public class TDEECalculator {
     public double calculateBMR(String sex, double weightKg, double heightCm, int age) {
        if (weightKg <= 0 || heightCm <= 0 || age <= 0) {
            throw new IllegalArgumentException("Invalid input: weight, height, and age must be positive.");
        }

        if (sex.equalsIgnoreCase("male")) {
            return 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
        } else if (sex.equalsIgnoreCase("female")) {
            return 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
        } else {
            throw new IllegalArgumentException("Sex must be 'male' or 'female'");
        }
    }

    public double calculateTDEE(double bmr, String activityLevel) {
        if (bmr <= 0) throw new IllegalArgumentException("BMR must be positive.");

        switch (activityLevel.toLowerCase()) {
            case "sedentary": return bmr * 1.2;
            case "light": return bmr * 1.375;
            case "moderate": return bmr * 1.55;
            case "active": return bmr * 1.725;
            case "very active": return bmr * 1.9;
            default: throw new IllegalArgumentException("Invalid activity level.");
        }
    }
}
