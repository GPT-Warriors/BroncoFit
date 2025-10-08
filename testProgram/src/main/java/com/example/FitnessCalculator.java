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

    // Calculates body fat percentage using Navy Method
    // waistCm: waist circumference in cm, neckCm: neck circumference in cm
    // hipCm: hip circumference in cm (for females only), heightCm: height in cm
    public double calculateBodyFatPercentage(String sex, double waistCm, double neckCm, double hipCm, double heightCm) {
        if (waistCm <= 0 || neckCm <= 0 || heightCm <= 0) {
            throw new IllegalArgumentException("Waist, neck, and height measurements must be positive values.");
        }

        if (!sex.equalsIgnoreCase("male") && !sex.equalsIgnoreCase("female")) {
            throw new IllegalArgumentException("Sex must be 'male' or 'female'");
        }

        double bodyFatPercentage;

        if (sex.equalsIgnoreCase("male")) {
            // Navy formula for males: 495 / (1.0324 - 0.19077 * log10(waist - neck) + 0.15456 * log10(height)) - 450
            double logValue = Math.log10(waistCm - neckCm);
            double logHeight = Math.log10(heightCm);
            bodyFatPercentage = 495 / (1.0324 - 0.19077 * logValue + 0.15456 * logHeight) - 450;
        } else {
            // Navy formula for females: 495 / (1.29579 - 0.35004 * log10(waist + hip - neck) + 0.22100 * log10(height)) - 450
            if (hipCm <= 0) {
                throw new IllegalArgumentException("Hip measurement must be positive for females.");
            }
            double logValue = Math.log10(waistCm + hipCm - neckCm);
            double logHeight = Math.log10(heightCm);
            bodyFatPercentage = 495 / (1.29579 - 0.35004 * logValue + 0.22100 * logHeight) - 450;
        }

        // Body fat percentage should be between 0 and 50% for reasonable values
        if (bodyFatPercentage < 0 || bodyFatPercentage > 50) {
            throw new IllegalArgumentException("Invalid measurements result in unrealistic body fat percentage.");
        }

        return Math.round(bodyFatPercentage * 100.0) / 100.0; // Round to 2 decimal places
    }

    // Calculates ideal weight range using Hamwi formula
    // heightCm: height in centimeters, sex: "male" or "female"
    // Returns array [minWeight, maxWeight] representing ideal weight range in kg
    public double[] calculateIdealWeightRange(String sex, double heightCm) {
        if (heightCm <= 0) {
            throw new IllegalArgumentException("Height must be a positive value.");
        }

        if (heightCm < 100 || heightCm > 250) {
            throw new IllegalArgumentException("Height must be between 100cm and 250cm.");
        }

        if (!sex.equalsIgnoreCase("male") && !sex.equalsIgnoreCase("female")) {
            throw new IllegalArgumentException("Sex must be 'male' or 'female'");
        }

        // Convert height to feet and inches for Hamwi formula
        double heightInches = heightCm / 2.54;
        double feet = heightInches / 12;
        double remainingInches = heightInches % 12;

        double baseWeight;
        double weightPerInch;

        if (sex.equalsIgnoreCase("male")) {
            // Male: 106 lbs for first 5 feet, then 6 lbs per additional inch
            baseWeight = 106;
            weightPerInch = 6;
        } else {
            // Female: 100 lbs for first 5 feet, then 5 lbs per additional inch
            baseWeight = 100;
            weightPerInch = 5;
        }

        double idealWeightLbs;
        if (feet >= 5) {
            idealWeightLbs = baseWeight + (weightPerInch * remainingInches) + (weightPerInch * 12 * (feet - 5));
        } else {
            // For people shorter than 5 feet, subtract weight proportionally
            double inchesUnder5Feet = 60 - heightInches;
            idealWeightLbs = baseWeight - (weightPerInch * inchesUnder5Feet);
        }

        // Convert to kg and create range (±10%)
        double idealWeightKg = idealWeightLbs * 0.453592;
        double minWeight = idealWeightKg * 0.9;
        double maxWeight = idealWeightKg * 1.1;

        return new double[]{Math.round(minWeight * 100.0) / 100.0, Math.round(maxWeight * 100.0) / 100.0};

    }
    public double calculateBMR(String sex, double weightKg, double heightCm, int age) {
        if (weightKg <= 0 || heightCm <= 0 || age <= 0) {
            throw new IllegalArgumentException("Weight, height, and age must be positive.");
        }

        if (sex.equalsIgnoreCase("male")) {
            return 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
        } else if (sex.equalsIgnoreCase("female")) {
            return 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
        } else {
            throw new IllegalArgumentException("Sex must be 'male' or 'female'.");
        }
    }
    public double calculateTDEE(double bmr, String activityLevel) {
        if (bmr <= 0) {
            throw new IllegalArgumentException("BMR must be a positive value.");
        }

        switch (activityLevel.toLowerCase()) {
            case "Sedentary":
                return bmr * 1.2;
            case "Lightly active":
                return bmr * 1.375;
            case "Moderately active":
                return bmr * 1.55;
            case "Very active":
                return bmr * 1.725;
            case "Extra active":
                return bmr * 1.9;
            default:
                throw new IllegalArgumentException("Unknown activity level. Use: sedentary, lightly active, moderately active, very active, or extra active.");
        }
    }
    public double poundsToKg(double pounds) { return pounds * 0.453592; }
    public double kgToPounds(double kg) { return kg / 0.453592; }
    public double inchesToCm(double inches) { return inches * 2.54; }
    public double cmToInches(double cm) { return cm / 2.54; }

    public String generateHealthSummary(String sex, double weightKg, double heightCm, int age, String activityLevel) {
        double bmi = calculateBMI(weightKg, heightCm / 100);
        String bmiClass = classifyBMI(bmi);
        double bmr = calculateBMR(sex, weightKg, heightCm, age);
        double tdee = calculateTDEE(bmr, activityLevel);

        return String.format(
                "Health Summary:\nBMI: %.2f (%s)\nBMR: %.2f kcal/day\nTDEE: %.2f kcal/day\n",
                bmi, bmiClass, bmr, tdee
        );
    }

}
