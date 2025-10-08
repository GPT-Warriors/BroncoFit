package com.example;

import org.junit.Test;
import static org.junit.Assert.*;

public class FitnessCalculatorTest {

    private final FitnessCalculator fitnessCalc = new FitnessCalculator();

    @Test
    public void testCalculateBMI_NormalValues() {
        double bmi = fitnessCalc.calculateBMI(70, 1.75);
        assertEquals(22.86, bmi, 0.01); // Expected BMI ≈ 22.86
    }

    @Test(expected = IllegalArgumentException.class)
    public void testCalculateBMI_InvalidHeight() {
        fitnessCalc.calculateBMI(70, 0);
    }

    @Test
    public void testClassifyBMI_Underweight() {
        String result = fitnessCalc.classifyBMI(17.5);
        assertEquals("Underweight", result);
    }

    @Test
    public void testClassifyBMI_NormalWeight() {
        String result = fitnessCalc.classifyBMI(22.0);
        assertEquals("Normal weight", result);
    }

    @Test
    public void testClassifyBMI_Overweight() {
        String result = fitnessCalc.classifyBMI(27.0);
        assertEquals("Overweight", result);
    }

    @Test
    public void testClassifyBMI_Obese() {
        String result = fitnessCalc.classifyBMI(31.0);
        assertEquals("Obese", result);
    }

    // Tests for calculateBodyFatPercentage method
    @Test
    public void testCalculateBodyFatPercentage_MaleValidMeasurements() {
        // Test with typical male measurements
        double bodyFat = fitnessCalc.calculateBodyFatPercentage("male", 85, 38, 0, 175);
        assertTrue("Body fat should be between 5% and 25% for typical male", bodyFat >= 5 && bodyFat <= 25);
    }

    @Test
    public void testCalculateBodyFatPercentage_FemaleValidMeasurements() {
        // Test with typical female measurements
        double bodyFat = fitnessCalc.calculateBodyFatPercentage("female", 75, 32, 95, 165);
        assertTrue("Body fat should be between 10% and 35% for typical female", bodyFat >= 10 && bodyFat <= 35);
    }

    @Test(expected = IllegalArgumentException.class)
    public void testCalculateBodyFatPercentage_InvalidSex() {
        fitnessCalc.calculateBodyFatPercentage("other", 85, 38, 0, 175);
    }

    @Test(expected = IllegalArgumentException.class)
    public void testCalculateBodyFatPercentage_NegativeWaist() {
        fitnessCalc.calculateBodyFatPercentage("male", -85, 38, 0, 175);
    }

    @Test(expected = IllegalArgumentException.class)
    public void testCalculateBodyFatPercentage_ZeroNeck() {
        fitnessCalc.calculateBodyFatPercentage("male", 85, 0, 0, 175);
    }

    @Test(expected = IllegalArgumentException.class)
    public void testCalculateBodyFatPercentage_NegativeHeight() {
        fitnessCalc.calculateBodyFatPercentage("male", 85, 38, 0, -175);
    }

    @Test(expected = IllegalArgumentException.class)
    public void testCalculateBodyFatPercentage_FemaleNoHipMeasurement() {
        fitnessCalc.calculateBodyFatPercentage("female", 75, 32, 0, 165);
    }

    @Test(expected = IllegalArgumentException.class)
    public void testCalculateBodyFatPercentage_FemaleNegativeHip() {
        fitnessCalc.calculateBodyFatPercentage("female", 75, 32, -95, 165);
    }

    @Test
    public void testCalculateBodyFatPercentage_CaseInsensitiveSex() {
        // Test that "MALE" and "FEMALE" work (case insensitive)
        double bodyFatMale = fitnessCalc.calculateBodyFatPercentage("MALE", 85, 38, 0, 175);
        double bodyFatFemale = fitnessCalc.calculateBodyFatPercentage("FEMALE", 75, 32, 95, 165);

        assertTrue("Male body fat should be reasonable", bodyFatMale > 0 && bodyFatMale < 50);
        assertTrue("Female body fat should be reasonable", bodyFatFemale > 0 && bodyFatFemale < 50);
    }

    @Test(expected = IllegalArgumentException.class)
    public void testCalculateBodyFatPercentage_UnrealisticMeasurements() {
        // Test measurements that would result in unrealistic body fat percentage
        fitnessCalc.calculateBodyFatPercentage("male", 200, 10, 0, 175);
    }

    // Tests for calculateIdealWeightRange method
    @Test
    public void testCalculateIdealWeightRange_MaleAverageHeight() {
        // Test with average male height (175cm)
        double[] weightRange = fitnessCalc.calculateIdealWeightRange("male", 175);

        assertEquals("Should return array of length 2", 2, weightRange.length);
        assertTrue("Min weight should be positive", weightRange[0] > 0);
        assertTrue("Max weight should be greater than min", weightRange[1] > weightRange[0]);
        assertTrue("Weight range should be reasonable for 175cm male", weightRange[0] >= 60 && weightRange[1] <= 85);
    }

    @Test
    public void testCalculateIdealWeightRange_FemaleAverageHeight() {
        // Test with average female height (165cm)
        double[] weightRange = fitnessCalc.calculateIdealWeightRange("female", 165);

        assertEquals("Should return array of length 2", 2, weightRange.length);
        assertTrue("Min weight should be positive", weightRange[0] > 0);
        assertTrue("Max weight should be greater than min", weightRange[1] > weightRange[0]);
        assertTrue("Weight range should be reasonable for 165cm female", weightRange[0] >= 50 && weightRange[1] <= 75);
    }

    @Test
    public void testCalculateIdealWeightRange_TallMale() {
        // Test with tall male (190cm)
        double[] weightRange = fitnessCalc.calculateIdealWeightRange("male", 190);

        assertTrue("Tall male should have higher weight range", weightRange[0] >= 70);
        assertTrue("Max weight should be reasonable for tall male", weightRange[1] <= 100);
    }

    @Test
    public void testCalculateIdealWeightRange_ShortFemale() {
        // Test with short female (150cm)
        double[] weightRange = fitnessCalc.calculateIdealWeightRange("female", 150);

        assertTrue("Short female should have lower weight range", weightRange[0] >= 40);
        assertTrue("Max weight should be reasonable for short female", weightRange[1] <= 65);
    }

    @Test(expected = IllegalArgumentException.class)
    public void testCalculateIdealWeightRange_InvalidSex() {
        fitnessCalc.calculateIdealWeightRange("other", 175);
    }

    @Test(expected = IllegalArgumentException.class)
    public void testCalculateIdealWeightRange_NegativeHeight() {
        fitnessCalc.calculateIdealWeightRange("male", -175);
    }

    @Test(expected = IllegalArgumentException.class)
    public void testCalculateIdealWeightRange_ZeroHeight() {
        fitnessCalc.calculateIdealWeightRange("female", 0);
    }

    @Test(expected = IllegalArgumentException.class)
    public void testCalculateIdealWeightRange_HeightTooShort() {
        fitnessCalc.calculateIdealWeightRange("male", 99); // Below 100cm limit
    }

    @Test(expected = IllegalArgumentException.class)
    public void testCalculateIdealWeightRange_HeightTooTall() {
        fitnessCalc.calculateIdealWeightRange("female", 251); // Above 250cm limit
    }

    @Test
    public void testCalculateIdealWeightRange_CaseInsensitiveSex() {
        // Test that "MALE" and "FEMALE" work (case insensitive)
        double[] maleRange = fitnessCalc.calculateIdealWeightRange("MALE", 175);
        double[] femaleRange = fitnessCalc.calculateIdealWeightRange("FEMALE", 165);

        assertTrue("Male range should be valid", maleRange[0] > 0 && maleRange[1] > maleRange[0]);
        assertTrue("Female range should be valid", femaleRange[0] > 0 && femaleRange[1] > femaleRange[0]);
    }

    @Test
    public void testCalculateIdealWeightRange_BoundaryHeights() {
        // Test boundary values
        double[] minHeightRange = fitnessCalc.calculateIdealWeightRange("male", 100); // Minimum allowed
        double[] maxHeightRange = fitnessCalc.calculateIdealWeightRange("female", 250); // Maximum allowed

        assertTrue("Min height should produce valid range", minHeightRange[0] > 0 && minHeightRange[1] > minHeightRange[0]);
        assertTrue("Max height should produce valid range", maxHeightRange[0] > 0 && maxHeightRange[1] > maxHeightRange[0]);
    }

    @Test
    public void testCalculateIdealWeightRange_MaleVsFemaleComparison() {
        // At same height, males should generally have higher ideal weight than females
        double[] maleRange = fitnessCalc.calculateIdealWeightRange("male", 170);
        double[] femaleRange = fitnessCalc.calculateIdealWeightRange("female", 170);

        assertTrue("Male ideal weight should be higher than female at same height",
                   maleRange[0] > femaleRange[0] && maleRange[1] > femaleRange[1]);
    }
}
