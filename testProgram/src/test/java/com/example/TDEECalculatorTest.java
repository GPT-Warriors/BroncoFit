package com.example;

import org.junit.Test;

import com.example.TDEECalculator.TDEECalculator;

import static org.junit.Assert.*;

public class TDEECalculatorTest {

    @Test
    public void testCalculateBMRMale() {
        TDEECalculator calc = new TDEECalculator();
        double result = calc.calculateBMR("male", 70, 175, 25);
        assertEquals(1673.75, result, 0.01);
    }

    @Test
    public void testCalculateBMRFemale() {
        TDEECalculator calc = new TDEECalculator();
        double result = calc.calculateBMR("female", 60, 165, 30);
        assertEquals(1320.25, result, 0.01);
    }

    @Test(expected = IllegalArgumentException.class)
    public void testInvalidSexThrows() {
        new TDEECalculator().calculateBMR("other", 70, 175, 25);
    }

    @Test
    public void testCalculateTDEEActive() {
        TDEECalculator calc = new TDEECalculator();
        double tdee = calc.calculateTDEE(1673.75, "active");
        assertEquals(2887.22, tdee, 0.01);
    }

    @Test(expected = IllegalArgumentException.class)
    public void testCalculateTDEEInvalidActivity() {
        new TDEECalculator().calculateTDEE(1600, "ultra");
    }
}
