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
}
