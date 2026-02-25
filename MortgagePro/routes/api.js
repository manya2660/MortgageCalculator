const express = require('express');
const router = express.Router();

/**
 * 1️⃣ EMI Calculator
 * Formula: EMI = P × r × (1+r)^n / ((1+r)^n − 1)
 */
router.post('/calculate-emi', (req, res) => {
    const { loanAmount, interestRate, tenureYears } = req.body;

    if (!loanAmount || !interestRate || !tenureYears) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const P = parseFloat(loanAmount);
    const annualRate = parseFloat(interestRate);
    const n = parseInt(tenureYears) * 12;
    const r = annualRate / (12 * 100);

    const emi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const totalPayment = emi * n;
    const totalInterest = totalPayment - P;

    res.json({
        monthlyEmi: emi.toFixed(2),
        totalInterest: totalInterest.toFixed(2),
        totalPayment: totalPayment.toFixed(2),
        principal: P.toFixed(2)
    });
});

/**
 * 2️⃣ Buy vs Rent Analyzer
 */
router.post('/buy-vs-rent', (req, res) => {
    const { monthlyRent, propertyPrice, years, appreciation } = req.body;

    if (!monthlyRent || !propertyPrice || !years || !appreciation) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const rent = parseFloat(monthlyRent);
    const price = parseFloat(propertyPrice);
    const y = parseInt(years);
    const appRate = parseFloat(appreciation) / 100;

    const totalRentPaid = rent * 12 * y;
    const futureValue = price * Math.pow(1 + appRate, y);

    const suggestion = futureValue > (price + totalRentPaid) ? 'Buying is likely better due to property appreciation.' : 'Renting might be more economical in this timeframe.';

    res.json({
        totalRentPaid: totalRentPaid.toFixed(2),
        futureValue: futureValue.toFixed(2),
        suggestion
    });
});

/**
 * 3️⃣ Prepayment Analyzer
 */
router.post('/prepayment', (req, res) => {
    const { loanAmount, interestRate, tenureYears, extraMonthly } = req.body;

    if (!loanAmount || !interestRate || !tenureYears || extraMonthly === undefined) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const P = parseFloat(loanAmount);
    const annualRate = parseFloat(interestRate);
    const nTotal = parseInt(tenureYears) * 12;
    const r = annualRate / (12 * 100);
    const extra = parseFloat(extraMonthly);

    // Standard EMI
    const emi = (P * r * Math.pow(1 + r, nTotal)) / (Math.pow(1 + r, nTotal) - 1);

    // Simulate with prepayment
    let balance = P;
    let months = 0;
    let totalInterestWithPrepayment = 0;

    while (balance > 0 && months < nTotal) {
        const interest = balance * r;
        totalInterestWithPrepayment += interest;
        const principalPaid = (emi + extra) - interest;
        balance -= principalPaid;
        months++;
        if (balance < 0) balance = 0;
    }

    const originalTotalInterest = (emi * nTotal) - P;
    const interestSavings = originalTotalInterest - totalInterestWithPrepayment;
    const reducedTenureMonths = nTotal - months;

    res.json({
        originalTotalInterest: originalTotalInterest.toFixed(2),
        newTotalInterest: totalInterestWithPrepayment.toFixed(2),
        interestSavings: interestSavings.toFixed(2),
        newTenureMonths: months,
        reducedTenureMonths
    });
});

module.exports = router;
