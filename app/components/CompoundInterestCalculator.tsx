'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';
import { Calculator, DollarSign, TrendingUp, Info, Plus, Trash2, Download, FileSpreadsheet, FileText } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

interface OneTimeTransaction {
  id: string;
  date: string;
  amount: number;
  type: 'deposit' | 'withdrawal';
  description: string;
  amountDisplay?: string;
}

interface CalculationResult {
  finalAmount: number;
  totalContributions: number;
  totalInterest: number;
  chartData: Array<{
    year: number;
    principal: number;
    interest: number;
    total: number;
    oneTimeDeposits: number;
    oneTimeWithdrawals: number;
  }>;
}

const CompoundInterestCalculator: React.FC = () => {
  const [currency, setCurrency] = useState('USD');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [initialInvestment, setInitialInvestment] = useState(1000);
  const [monthlyContribution, setMonthlyContribution] = useState(100);
  const [contributionFrequency, setContributionFrequency] = useState('monthly');
  const [annualIncrease, setAnnualIncrease] = useState(0);
  const [annualRate, setAnnualRate] = useState(7);
  const [years, setYears] = useState(10);
  const [compoundFrequency, setCompoundFrequency] = useState('12');
  const [customCompoundFrequency, setCustomCompoundFrequency] = useState(12);
  const [depositsAtEnd, setDepositsAtEnd] = useState(true);
  const [oneTimeTransactions, setOneTimeTransactions] = useState<OneTimeTransaction[]>([]);
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [finalAmountFontSize, setFinalAmountFontSize] = useState('4rem');
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [initialInvestmentDisplay, setInitialInvestmentDisplay] = useState('');
  const [monthlyContributionDisplay, setMonthlyContributionDisplay] = useState('');

  const currencySymbols = useMemo(() => ({
    USD: '$',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
    CAD: 'C$',
    AUD: 'A$'
  } as const), []);

  const formatCurrency = useCallback((amount: number): string => {
    const symbol = currencySymbols[currency as keyof typeof currencySymbols] || '$';
    return `${symbol}${amount.toLocaleString(undefined, { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })}`;
  }, [currency, currencySymbols]);

  const formatNumberWithCommas = useCallback((value: number): string => {
    return value.toLocaleString();
  }, []);

  const parseNumberFromCommas = useCallback((value: string): number => {
    // Remove commas and parse, but handle empty strings gracefully
    const cleanValue = value.replace(/,/g, '').replace(/[^\d.]/g, '');
    return cleanValue === '' ? 0 : Number(cleanValue) || 0;
  }, []);

  // Initialize display values
  useEffect(() => {
    setInitialInvestmentDisplay(formatNumberWithCommas(initialInvestment));
    setMonthlyContributionDisplay(formatNumberWithCommas(monthlyContribution));
  }, [initialInvestment, monthlyContribution, currency, formatNumberWithCommas]);

  const formatChartAxis = useCallback((value: number): string => {
    const symbol = currencySymbols[currency as keyof typeof currencySymbols] || '$';
    
    if (value >= 1000000) {
      return `${symbol}${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `${symbol}${(value / 1000).toFixed(1)}K`;
    } else {
      return `${symbol}${value.toLocaleString()}`;
    }
  }, [currency, currencySymbols]);

  const addOneTimeTransaction = useCallback(() => {
    const newTransaction: OneTimeTransaction = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      amount: 0,
      type: 'deposit',
      description: '',
      amountDisplay: '0'
    };
    setOneTimeTransactions(prev => [...prev, newTransaction]);
  }, []);

  const downloadYearlyDataPDF = useCallback(() => {
    if (!result) return;
    
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    
    // Define colors to match the app
    const primaryColor = [15, 23, 42]; // charcoal-800
    const accentColor = [16, 185, 129]; // emerald-600
    const lightGray = [248, 250, 252]; // gray-50
    const mediumGray = [156, 163, 175]; // gray-400
    
    // Header with gradient-like background
    doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
    doc.rect(0, 0, pageWidth, 25, 'F');
    
    // Title
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Compound Interest Calculator', pageWidth / 2, 12, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Yearly Data Report', pageWidth / 2, 20, { align: 'center' });
    
    // Reset text color
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    
    let currentY = 35;
    
    // Compact Summary Section - Single row of 3 cards
    const summaryCards = [
      { title: 'FINAL AMOUNT', value: formatCurrency(result.finalAmount), color: accentColor },
      { title: 'CONTRIBUTIONS', value: formatCurrency(result.totalContributions), color: primaryColor },
      { title: 'INTEREST EARNED', value: formatCurrency(result.totalInterest), color: accentColor }
    ];
    
    const cardWidth = 45;
    const cardHeight = 18;
    const cardSpacing = 5;
    const startX = 10;
    
    summaryCards.forEach((card, index) => {
      const x = startX + index * (cardWidth + cardSpacing);
      
      // Card background
      doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
      doc.roundedRect(x, currentY, cardWidth, cardHeight, 2, 2, 'F');
      doc.setDrawColor(mediumGray[0], mediumGray[1], mediumGray[2]);
      doc.roundedRect(x, currentY, cardWidth, cardHeight, 2, 2, 'S');
      
      // Card title
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setFontSize(6);
      doc.setFont('helvetica', 'bold');
      doc.text(card.title, x + 2, currentY + 5);
      
      // Card value
      doc.setTextColor(card.color[0], card.color[1], card.color[2]);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text(card.value, x + 2, currentY + 12);
    });
    
    currentY += cardHeight + 15;
    
    // Compact Investment Parameters Section
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Investment Parameters', startX, currentY);
    
    currentY += 8;
    
    // Parameters in a compact styled box
    const paramBoxHeight = 30;
    doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
    doc.roundedRect(startX, currentY, pageWidth - 20, paramBoxHeight, 2, 2, 'F');
    doc.setDrawColor(mediumGray[0], mediumGray[1], mediumGray[2]);
    doc.roundedRect(startX, currentY, pageWidth - 20, paramBoxHeight, 2, 2, 'S');
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    
    const getContributionLabel = (frequency: string) => {
      switch (frequency) {
        case 'daily': return 'Daily';
        case 'weekly': return 'Weekly';
        case 'biweekly': return 'Bi-weekly';
        case 'monthly': return 'Monthly';
        case 'quarterly': return 'Quarterly';
        case 'semiannual': return 'Semi-annual';
        case 'annual': return 'Annual';
        default: return 'Monthly';
      }
    };
    
    const params = [
      [`Currency: ${currency}`, `Initial Investment: ${formatCurrency(initialInvestment)}`, `${getContributionLabel(contributionFrequency)} Contribution: ${formatCurrency(monthlyContribution)}`],
      [`Start Date: ${startDate}`, `Annual Rate: ${annualRate}%`, `Investment Period: ${years} years`],
      [`Compound Frequency: ${
        compoundFrequency === '1' ? 'Yearly (1/yr)' :
        compoundFrequency === '2' ? 'Half-Yearly (2/yr)' :
        compoundFrequency === '4' ? 'Quarterly (4/yr)' :
        compoundFrequency === '6' ? 'Bi-Monthly (6/yr)' :
        compoundFrequency === '12' ? 'Monthly (12/yr)' :
        compoundFrequency === '24' ? 'Semi-Monthly (24/yr)' :
        compoundFrequency === '26' ? 'Bi-Weekly (26/yr)' :
        compoundFrequency === '52' ? 'Weekly (52/yr)' :
        compoundFrequency === '104' ? 'Semi-Weekly (104/yr)' :
        compoundFrequency === '360' ? 'Daily (360/yr)' :
        compoundFrequency === '365' ? 'Daily (365/yr)' :
        compoundFrequency === 'custom' ? `Custom (${customCompoundFrequency}/yr)` :
        'Custom'
      }`, `Deposit Timing: ${depositsAtEnd ? 'End of period' : 'Beginning of period'}`],
      [`Annual Contribution Increase: ${annualIncrease}%`]
    ];
    
    params.forEach((paramRow, index) => {
      const y = currentY + 6 + (index * 8);
      paramRow.forEach((param, paramIndex) => {
        const x = startX + 5 + (paramIndex * 65);
        doc.text(param, x, y);
      });
    });
    
    currentY += paramBoxHeight + 15;
    
    // Yearly Breakdown Table
    const tableData = result.chartData.map((data, index) => {
      // Calculate NET deposits for this year (regular deposits + one-time deposits - withdrawals)
      let yearDeposits;
      if (data.year === 0) {
        yearDeposits = initialInvestment;
      } else {
        // Apply the annual increase to contributions
        const contributionMultiplier = Math.pow(1 + annualIncrease / 100, data.year - 1);
        const periodsPerYear = contributionFrequency === 'monthly' ? 12 :
                              contributionFrequency === 'quarterly' ? 4 :
                              contributionFrequency === 'semiannual' ? 2 :
                              contributionFrequency === 'annual' ? 1 :
                              contributionFrequency === 'weekly' ? 52 :
                              contributionFrequency === 'biweekly' ? 26 :
                              contributionFrequency === 'daily' ? 365 : 12;
        
        const regularDeposits = (monthlyContribution * (12 / periodsPerYear)) * periodsPerYear * contributionMultiplier;
        yearDeposits = regularDeposits + data.oneTimeDeposits - data.oneTimeWithdrawals;
      }
      
      const yearInterest = index === 0 ? 0 : data.interest - (index > 0 ? result.chartData[index - 1].interest : 0);
      const cumulativeInterest = data.interest;
      
      return [
        data.year.toString(),
        formatCurrency(yearDeposits),
        formatCurrency(yearInterest),
        formatCurrency(data.principal),
        formatCurrency(cumulativeInterest),
        formatCurrency(data.total)
      ];
    });
    
    autoTable(doc, {
      startY: currentY,
      head: [['Year', 'Deposits', 'Interest', 'Total Deposits', 'Accrued Interest', 'Balance']],
      body: tableData,
      theme: 'grid',
      styles: { 
        fontSize: 9, 
        cellPadding: 4,
        textColor: [15, 23, 42],
        lineColor: [229, 231, 235],
        lineWidth: 0.1
      },
      headStyles: { 
        fillColor: [16, 185, 129], 
        textColor: [255, 255, 255],
        fontSize: 10,
        fontStyle: 'bold'
      },
      alternateRowStyles: { 
        fillColor: [248, 250, 252] 
      },
      columnStyles: {
        0: { halign: 'center' },
        1: { halign: 'right' },
        2: { halign: 'right' },
        3: { halign: 'right' },
        4: { halign: 'right' },
        5: { halign: 'right', fontStyle: 'bold' }
      },
      margin: { left: startX, right: startX }
    });
    
    // Footer
    doc.setFontSize(8);
    doc.setTextColor(mediumGray[0], mediumGray[1], mediumGray[2]);
    doc.text(`Generated on ${new Date().toLocaleDateString()}`, startX, pageHeight - 10);
    doc.text('Compound Interest Calculator', pageWidth - 20, pageHeight - 10, { align: 'right' });
    
    // Save the PDF
    doc.save('compound-interest-yearly-data.pdf');
  }, [result, currency, startDate, initialInvestment, monthlyContribution, annualRate, years, compoundFrequency, depositsAtEnd, formatCurrency, annualIncrease, contributionFrequency, customCompoundFrequency]);

  const downloadFullPagePDF = useCallback(async () => {
    if (!result) return;
    
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    
    // Define colors to match the app
    const primaryColor = [15, 23, 42]; // charcoal-800
    const accentColor = [16, 185, 129]; // emerald-600
    const lightGray = [248, 250, 252]; // gray-50
    const mediumGray = [156, 163, 175]; // gray-400
    
    // Header with gradient-like background
    doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
    doc.rect(0, 0, pageWidth, 25, 'F');
    
    // Title
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Compound Interest Calculator', pageWidth / 2, 12, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Complete Investment Report', pageWidth / 2, 20, { align: 'center' });
    
    // Reset text color
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    
    let currentY = 35;
    
    // Final Amount Section (Large and prominent)
    doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
    doc.roundedRect(10, currentY, pageWidth - 20, 25, 3, 3, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Final Amount', 15, currentY + 8);
    
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(formatCurrency(result.finalAmount), 15, currentY + 18);
    
    currentY += 35;
    
    // Results Cards
    const resultsCards = [
      { title: 'TOTAL CONTRIBUTIONS', value: formatCurrency(result.totalContributions), color: primaryColor },
      { title: 'INTEREST EARNED', value: formatCurrency(result.totalInterest), color: accentColor }
    ];
    
    const cardWidth = (pageWidth - 30) / 2;
    const cardHeight = 20;
    
    resultsCards.forEach((card, index) => {
      const x = 10 + index * (cardWidth + 10);
      
      // Card background
      doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
      doc.roundedRect(x, currentY, cardWidth, cardHeight, 2, 2, 'F');
      doc.setDrawColor(mediumGray[0], mediumGray[1], mediumGray[2]);
      doc.roundedRect(x, currentY, cardWidth, cardHeight, 2, 2, 'S');
      
      // Card title
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text(card.title, x + 5, currentY + 8);
      
      // Card value
      doc.setTextColor(card.color[0], card.color[1], card.color[2]);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(card.value, x + 5, currentY + 16);
    });
    
    currentY += cardHeight + 20;
    
    // Investment Parameters Section
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Investment Parameters', 10, currentY);
    
    currentY += 8;
    
    // Parameters in a styled box
    const paramBoxHeight = 40;
    doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
    doc.roundedRect(10, currentY, pageWidth - 20, paramBoxHeight, 2, 2, 'F');
    doc.setDrawColor(mediumGray[0], mediumGray[1], mediumGray[2]);
    doc.roundedRect(10, currentY, pageWidth - 20, paramBoxHeight, 2, 2, 'S');
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    
    const getContributionLabel = (frequency: string) => {
      switch (frequency) {
        case 'daily': return 'Daily';
        case 'weekly': return 'Weekly';
        case 'biweekly': return 'Bi-weekly';
        case 'monthly': return 'Monthly';
        case 'quarterly': return 'Quarterly';
        case 'semiannual': return 'Semi-annual';
        case 'annual': return 'Annual';
        default: return 'Monthly';
      }
    };
    
    const params = [
      [`Currency: ${currency}`, `Initial Investment: ${formatCurrency(initialInvestment)}`, `${getContributionLabel(contributionFrequency)} Contribution: ${formatCurrency(monthlyContribution)}`],
      [`Start Date: ${startDate}`, `Annual Rate: ${annualRate}%`, `Investment Period: ${years} years`],
      [`Compound Frequency: ${
        compoundFrequency === '1' ? 'Yearly (1/yr)' :
        compoundFrequency === '2' ? 'Half-Yearly (2/yr)' :
        compoundFrequency === '4' ? 'Quarterly (4/yr)' :
        compoundFrequency === '6' ? 'Bi-Monthly (6/yr)' :
        compoundFrequency === '12' ? 'Monthly (12/yr)' :
        compoundFrequency === '24' ? 'Semi-Monthly (24/yr)' :
        compoundFrequency === '26' ? 'Bi-Weekly (26/yr)' :
        compoundFrequency === '52' ? 'Weekly (52/yr)' :
        compoundFrequency === '104' ? 'Semi-Weekly (104/yr)' :
        compoundFrequency === '360' ? 'Daily (360/yr)' :
        compoundFrequency === '365' ? 'Daily (365/yr)' :
        compoundFrequency === 'custom' ? `Custom (${customCompoundFrequency}/yr)` :
        'Custom'
      }`, `Deposit Timing: ${depositsAtEnd ? 'End of period' : 'Beginning of period'}`],
      [`Annual Contribution Increase: ${annualIncrease}%`, `One-Time Transactions: ${oneTimeTransactions.length} transaction${oneTimeTransactions.length !== 1 ? 's' : ''}`]
    ];
    
    params.forEach((paramRow, index) => {
      const y = currentY + 6 + (index * 8);
      paramRow.forEach((param, paramIndex) => {
        const x = 15 + (paramIndex * 65);
        doc.text(param, x, y);
      });
    });
    
    currentY += paramBoxHeight + 20;
    
    // Investment Breakdown Chart
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Investment Breakdown', 10, currentY);
    
    currentY += 8;
    
    // Simple breakdown visualization
    const totalWidth = pageWidth - 20;
    const principalWidth = (result.totalContributions / result.finalAmount) * totalWidth;
    const interestWidth = (result.totalInterest / result.finalAmount) * totalWidth;
    
    // Principal bar
    doc.setFillColor(mediumGray[0], mediumGray[1], mediumGray[2]);
    doc.rect(10, currentY, principalWidth, 8, 'F');
    
    // Interest bar
    doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
    doc.rect(10 + principalWidth, currentY, interestWidth, 8, 'F');
    
    currentY += 15;
    
    // Breakdown legend
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(`Principal (${((result.totalContributions / result.finalAmount) * 100).toFixed(1)}%)`, 10, currentY);
    doc.text(`Interest (${((result.totalInterest / result.finalAmount) * 100).toFixed(1)}%)`, 10, currentY + 8);
    
    currentY += 20;
    
    // Growth Over Time Chart Section
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Growth Over Time', 10, currentY);
    
    currentY += 8;
    
    // Try to capture the chart as an image
    try {
      const chartElement = document.getElementById('investment-chart');
      if (chartElement) {
        // Use html2canvas to capture the chart
        const html2canvas = (await import('html2canvas')).default;
        const canvas = await html2canvas(chartElement as HTMLElement, {
          backgroundColor: '#ffffff',
          scale: 2,
          useCORS: true,
          allowTaint: true,
          logging: false
        });
        
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = pageWidth - 20;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        // Add the chart image to the PDF
        doc.addImage(imgData, 'PNG', 10, currentY, imgWidth, imgHeight);
        currentY += imgHeight + 20;
      }
    } catch {
      console.log('Could not capture chart, continuing without it');
      currentY += 20;
    }
    
    // Yearly Breakdown Table
    const tableData = result.chartData.map((data, index) => {
      // Calculate NET deposits for this year (regular deposits + one-time deposits - withdrawals)
      let yearDeposits;
      if (data.year === 0) {
        yearDeposits = initialInvestment;
      } else {
        // Apply the annual increase to contributions
        const contributionMultiplier = Math.pow(1 + annualIncrease / 100, data.year - 1);
        const periodsPerYear = contributionFrequency === 'monthly' ? 12 :
                              contributionFrequency === 'quarterly' ? 4 :
                              contributionFrequency === 'semiannual' ? 2 :
                              contributionFrequency === 'annual' ? 1 :
                              contributionFrequency === 'weekly' ? 52 :
                              contributionFrequency === 'biweekly' ? 26 :
                              contributionFrequency === 'daily' ? 365 : 12;
        
        const regularDeposits = (monthlyContribution * (12 / periodsPerYear)) * periodsPerYear * contributionMultiplier;
        yearDeposits = regularDeposits + data.oneTimeDeposits - data.oneTimeWithdrawals;
      }
      
      const yearInterest = index === 0 ? 0 : data.interest - (index > 0 ? result.chartData[index - 1].interest : 0);
      const cumulativeInterest = data.interest;
      
      return [
        data.year.toString(),
        formatCurrency(yearDeposits),
        formatCurrency(yearInterest),
        formatCurrency(data.principal),
        formatCurrency(cumulativeInterest),
        formatCurrency(data.total)
      ];
    });
    
    autoTable(doc, {
      startY: currentY,
      head: [['Year', 'Deposits', 'Interest', 'Total Deposits', 'Accrued Interest', 'Balance']],
      body: tableData,
      theme: 'grid',
      styles: { 
        fontSize: 8, 
        cellPadding: 3,
        textColor: [15, 23, 42],
        lineColor: [229, 231, 235],
        lineWidth: 0.1
      },
      headStyles: { 
        fillColor: [16, 185, 129], 
        textColor: [255, 255, 255],
        fontSize: 9,
        fontStyle: 'bold'
      },
      alternateRowStyles: { 
        fillColor: [248, 250, 252] 
      },
      columnStyles: {
        0: { halign: 'center' },
        1: { halign: 'right' },
        2: { halign: 'right' },
        3: { halign: 'right' },
        4: { halign: 'right' },
        5: { halign: 'right', fontStyle: 'bold' }
      },
      margin: { left: 10, right: 10 }
    });
    
    // Footer
    doc.setFontSize(8);
    doc.setTextColor(mediumGray[0], mediumGray[1], mediumGray[2]);
    doc.text(`Generated on ${new Date().toLocaleDateString()}`, 10, pageHeight - 10);
    doc.text('Compound Interest Calculator', pageWidth - 20, pageHeight - 10, { align: 'right' });
    
    // Save the PDF
    doc.save('compound-interest-full-report.pdf');
  }, [result, currency, startDate, initialInvestment, monthlyContribution, annualRate, years, compoundFrequency, depositsAtEnd, oneTimeTransactions, formatCurrency, annualIncrease, contributionFrequency, customCompoundFrequency]);

  const downloadPDF = useCallback(() => {
    setShowPdfModal(true);
  }, []);

  const downloadExcel = useCallback(() => {
    if (!result) return;
    
    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    
    // Helper for Excel export
    function getContributionLabel(frequency: string) {
      switch (frequency) {
        case 'daily': return 'Daily';
        case 'weekly': return 'Weekly';
        case 'biweekly': return 'Bi-weekly';
        case 'monthly': return 'Monthly';
        case 'quarterly': return 'Quarterly';
        case 'semiannual': return 'Semi-annual';
        case 'annual': return 'Annual';
        default: return 'Monthly';
      }
    }

    // Summary sheet with pre-formatted currency and percentage strings
    const summaryData = [
      ['Compound Interest Calculator - Investment Summary'],
      [''],
      ['Final Amount', formatCurrency(result.finalAmount)],
      ['Total Contributions', formatCurrency(result.totalContributions)],
      ['Interest Earned', formatCurrency(result.totalInterest)],

      [''],
      ['Investment Parameters'],
      ['Currency', currency],
      ['Start Date', startDate],
      ['Initial Investment', formatCurrency(initialInvestment)],
      [`${getContributionLabel(contributionFrequency)} Contribution`, formatCurrency(monthlyContribution)],
      ['Annual Contribution Increase', `${annualIncrease}%`],
      ['Annual Rate', `${annualRate}%`],
      ['Investment Period', `${years} years`],
      ['Compound Frequency',
        compoundFrequency === '1' ? 'Yearly (1/yr)' :
        compoundFrequency === '2' ? 'Half-Yearly (2/yr)' :
        compoundFrequency === '4' ? 'Quarterly (4/yr)' :
        compoundFrequency === '6' ? 'Bi-Monthly (6/yr)' :
        compoundFrequency === '12' ? 'Monthly (12/yr)' :
        compoundFrequency === '24' ? 'Semi-Monthly (24/yr)' :
        compoundFrequency === '26' ? 'Bi-Weekly (26/yr)' :
        compoundFrequency === '52' ? 'Weekly (52/yr)' :
        compoundFrequency === '104' ? 'Semi-Weekly (104/yr)' :
        compoundFrequency === '360' ? 'Daily (360/yr)' :
        compoundFrequency === '365' ? 'Daily (365/yr)' :
        compoundFrequency === 'custom' ? `Custom (${customCompoundFrequency}/yr)` :
        'Custom'
      ],
      ['Deposit Timing', depositsAtEnd ? 'End of period' : 'Beginning of period']
    ];
    
    const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
    
    // Apply column widths to summary sheet
    summaryWs['!cols'] = [
      { width: 25 },
      { width: 20 }
    ];
    
    XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary');
    
    // Yearly breakdown sheet with pre-formatted currency strings
    const yearlyData = [
      ['Year', 'Deposits', 'Interest', 'Total Deposits', 'Accrued Interest', 'Balance']
    ];
    
    result.chartData.forEach((data, index) => {
      // Calculate NET deposits for this year (regular deposits + one-time deposits - withdrawals)
      let yearDeposits;
      if (data.year === 0) {
        yearDeposits = initialInvestment;
      } else {
        // Apply the annual increase to contributions
        const contributionMultiplier = Math.pow(1 + annualIncrease / 100, data.year - 1);
        const periodsPerYear = contributionFrequency === 'monthly' ? 12 :
                              contributionFrequency === 'quarterly' ? 4 :
                              contributionFrequency === 'semiannual' ? 2 :
                              contributionFrequency === 'annual' ? 1 :
                              contributionFrequency === 'weekly' ? 52 :
                              contributionFrequency === 'biweekly' ? 26 :
                              contributionFrequency === 'daily' ? 365 : 12;
        
        const regularDeposits = (monthlyContribution * (12 / periodsPerYear)) * periodsPerYear * contributionMultiplier;
        yearDeposits = regularDeposits + data.oneTimeDeposits - data.oneTimeWithdrawals;
      }
      
      const yearInterest = index === 0 ? 0 : data.interest - (index > 0 ? result.chartData[index - 1].interest : 0);
      const cumulativeInterest = data.interest;
      
      yearlyData.push([
        data.year.toString(),
        formatCurrency(yearDeposits),
        formatCurrency(yearInterest),
        formatCurrency(data.principal),
        formatCurrency(cumulativeInterest),
        formatCurrency(data.total)
      ]);
    });
    
    const yearlyWs = XLSX.utils.aoa_to_sheet(yearlyData);
    
    // Apply column widths to yearly breakdown sheet
    yearlyWs['!cols'] = [
      { width: 8 },
      { width: 15 },
      { width: 15 },
      { width: 18 },
      { width: 18 },
      { width: 18 }
    ];
    
    XLSX.utils.book_append_sheet(wb, yearlyWs, 'Yearly Breakdown');
    
    // Chart data sheet with pre-formatted currency strings
    const chartData = [
      ['Year', 'Principal', 'Interest', 'Total', 'One-Time Deposits', 'One-Time Withdrawals']
    ];
    
    result.chartData.forEach(data => {
      chartData.push([
        data.year.toString(),
        formatCurrency(data.principal),
        formatCurrency(data.interest),
        formatCurrency(data.total),
        formatCurrency(data.oneTimeDeposits),
        formatCurrency(data.oneTimeWithdrawals)
      ]);
    });
    
    const chartWs = XLSX.utils.aoa_to_sheet(chartData);
    
    // Apply column widths to chart data sheet
    chartWs['!cols'] = [
      { width: 8 },
      { width: 15 },
      { width: 15 },
      { width: 15 },
      { width: 20 },
      { width: 20 }
    ];
    
    XLSX.utils.book_append_sheet(wb, chartWs, 'Chart Data');
    
    // Save the Excel file
    XLSX.writeFile(wb, 'compound-interest-report.xlsx');
  }, [result, currency, startDate, initialInvestment, monthlyContribution, annualRate, years, compoundFrequency, depositsAtEnd, formatCurrency, annualIncrease, contributionFrequency, customCompoundFrequency]);

  const updateOneTimeTransaction = useCallback((id: string, updates: Partial<OneTimeTransaction>) => {
    setOneTimeTransactions(prev => 
      prev.map(transaction => 
        transaction.id === id ? { ...transaction, ...updates } : transaction
      )
    );
  }, []);

  const removeOneTimeTransaction = useCallback((id: string) => {
    setOneTimeTransactions(prev => prev.filter(transaction => transaction.id !== id));
  }, []);

  const calculateCompoundInterest = useCallback((): CalculationResult => {
    const P = initialInvestment;
    const r = annualRate / 100;
    const n = compoundFrequency === 'custom' ? customCompoundFrequency : parseFloat(compoundFrequency);
    const t = years;
    
    // Helper function to round to cents
    const roundToCents = (amount: number): number => {
      return Math.round(amount * 100) / 100;
    };
    
    let currentBalance = P;
    let totalContributionsToDate = P;
    const chartData = [];
    
    // Add year 0 to show initial deposit
    chartData.push({
      year: 0,
      principal: P,
      interest: 0,
      total: P,
      oneTimeDeposits: 0,
      oneTimeWithdrawals: 0
    });
    
    // Calculate the number of periods per year based on contribution frequency
    const getPeriodsPerYear = (freq: string): number => {
      switch(freq) {
        case 'daily': return 365;
        case 'weekly': return 52;
        case 'biweekly': return 26;
        case 'monthly': return 12;
        case 'quarterly': return 4;
        case 'semiannual': return 2;
        case 'annual': return 1;
        default: return 12;
      }
    };
    
    const contributionPeriodsPerYear = getPeriodsPerYear(contributionFrequency);
    const baseContributionPerPeriod = monthlyContribution * (12 / contributionPeriodsPerYear);
    
    // Track cumulative interest more precisely
    let totalInterestEarned = 0;
    
    // Calculate total periods (use monthly periods as base for precision)
    const monthsPerYear = 12;
    const totalMonths = t * monthsPerYear;
    
    // Track year data for chart
    const yearData: { [key: number]: { contributions: number, oneTimeDeposits: number, oneTimeWithdrawals: number, startBalance: number } } = {};
    
    // Initialize year tracking
    for (let year = 1; year <= t; year++) {
      yearData[year] = { contributions: 0, oneTimeDeposits: 0, oneTimeWithdrawals: 0, startBalance: currentBalance };
    }
    
    // Process each month
    for (let month = 1; month <= totalMonths; month++) {
      const currentYear = Math.ceil(month / monthsPerYear);
      const monthInYear = ((month - 1) % monthsPerYear) + 1;
      
      // Calculate contribution amount with annual increase
      const contributionMultiplier = Math.pow(1 + annualIncrease / 100, currentYear - 1);
      
      // Determine if we should add a contribution this month
      const shouldContribute = (() => {
        switch(contributionFrequency) {
          case 'daily': return true; // Simplified: add monthly equivalent
          case 'weekly': return true; // Simplified: add monthly equivalent
          case 'biweekly': return true; // Simplified: add monthly equivalent
          case 'monthly': return true;
          case 'quarterly': return monthInYear % 3 === 0;
          case 'semiannual': return monthInYear % 6 === 0;
          case 'annual': return monthInYear === 12;
          default: return true;
        }
      })();
      
      const monthlyEquivalentContribution = shouldContribute ? 
        roundToCents(baseContributionPerPeriod * contributionMultiplier * (contributionPeriodsPerYear / monthsPerYear)) : 0;
      
      // Add contribution at beginning if specified
      if (!depositsAtEnd && monthlyEquivalentContribution > 0) {
        currentBalance = roundToCents(currentBalance + monthlyEquivalentContribution);
        yearData[currentYear].contributions = roundToCents(yearData[currentYear].contributions + monthlyEquivalentContribution);
      }
      
      // Apply compound interest if it's a compounding period
      const shouldCompound = (() => {
        // Determine if this month is a compounding period
        if (n >= 12) {
          // Monthly or more frequent compounding
          const compoundingsPerMonth = n / monthsPerYear;
          const monthlyRate = r / n;
          // Apply multiple compoundings within the month
          for (let i = 0; i < compoundingsPerMonth; i++) {
            currentBalance = roundToCents(currentBalance * (1 + monthlyRate));
          }
          return true;
        } else {
          // Less frequent than monthly
          const monthsPerCompound = monthsPerYear / n;
          return month % monthsPerCompound === 0;
        }
      })();
      
      if (shouldCompound && n < 12) {
        // For less frequent compounding (quarterly, semi-annual, annual)
        const periodRate = r / n;
        currentBalance = roundToCents(currentBalance * (1 + periodRate));
      }
      
      // Add contribution at end if specified
      if (depositsAtEnd && monthlyEquivalentContribution > 0) {
        currentBalance = roundToCents(currentBalance + monthlyEquivalentContribution);
        yearData[currentYear].contributions = roundToCents(yearData[currentYear].contributions + monthlyEquivalentContribution);
      }
      
      // Handle one-time transactions
      const startYear = new Date(startDate).getFullYear();
      const currentCalendarYear = startYear + currentYear - 1;
      const currentCalendarMonth = monthInYear - 1; // 0-indexed for Date comparison
      
      const monthTransactions = oneTimeTransactions.filter(transaction => {
        const transDate = new Date(transaction.date);
        const transYear = transDate.getFullYear();
        const transMonth = transDate.getMonth();
        
        return transYear === currentCalendarYear && transMonth === currentCalendarMonth;
      });
      
      monthTransactions.forEach(transaction => {
        if (transaction.type === 'deposit') {
          currentBalance = roundToCents(currentBalance + transaction.amount);
          yearData[currentYear].oneTimeDeposits = roundToCents(yearData[currentYear].oneTimeDeposits + transaction.amount);
        } else {
          currentBalance = roundToCents(currentBalance - transaction.amount);
          yearData[currentYear].oneTimeWithdrawals = roundToCents(yearData[currentYear].oneTimeWithdrawals + transaction.amount);
        }
      });
      
      // At the end of each year, record data
      if (month % monthsPerYear === 0) {
        const year = month / monthsPerYear;
        const yearContributions = yearData[year].contributions;
        const yearOneTimeDeposits = yearData[year].oneTimeDeposits;
        const yearOneTimeWithdrawals = yearData[year].oneTimeWithdrawals;
        const yearStartBalance = yearData[year].startBalance;
        
        totalContributionsToDate = roundToCents(totalContributionsToDate + yearContributions + yearOneTimeDeposits - yearOneTimeWithdrawals);
        
        const yearInterest = roundToCents(currentBalance - yearStartBalance - yearContributions - yearOneTimeDeposits + yearOneTimeWithdrawals);
        totalInterestEarned = roundToCents(totalInterestEarned + yearInterest);
        
        chartData.push({
          year,
          principal: totalContributionsToDate,
          interest: totalInterestEarned,
          total: currentBalance,
          oneTimeDeposits: yearOneTimeDeposits,
          oneTimeWithdrawals: yearOneTimeWithdrawals
        });
        
        // Update start balance for next year
        if (year < t) {
          yearData[year + 1].startBalance = currentBalance;
        }
      }
    }
    
    return {
      finalAmount: currentBalance,
      totalContributions: totalContributionsToDate,
      totalInterest: totalInterestEarned,
      chartData: chartData
    };
  }, [initialInvestment, monthlyContribution, annualIncrease, annualRate, years, compoundFrequency, customCompoundFrequency, depositsAtEnd, oneTimeTransactions, startDate, contributionFrequency]);

  useEffect(() => {
    const newResult = calculateCompoundInterest();
    setResult(newResult);
    
      // Adjust font size based on the amount
      if (newResult) {
        const amount = newResult.finalAmount;
        const symbol = currencySymbols[currency as keyof typeof currencySymbols] || '$';
        const amountString = `${symbol}${amount.toLocaleString(undefined, { 
          minimumFractionDigits: 2, 
          maximumFractionDigits: 2 
        })}`;
        const charCount = amountString.length;
        let fontSize = '3rem'; // Default large size
        
        // Only scale down when necessary based on character count
        if (charCount >= 20) { // Very long numbers
          fontSize = '1.5rem';
        } else if (charCount >= 17) {
          fontSize = '1.75rem';
        } else if (charCount >= 15) {
          fontSize = '2rem';
        } else if (charCount >= 13) {
          fontSize = '2.25rem';
        } else if (charCount >= 11) {
          fontSize = '2.5rem';
        } else if (charCount >= 9) {
          fontSize = '2.75rem';
        }
        // Keep default 3rem for anything shorter
        
        setFinalAmountFontSize(fontSize);
      }
  }, [calculateCompoundInterest, currency, currencySymbols]);

  const Tooltip: React.FC<{ id?: string; content: string; children: React.ReactNode }> = ({ content, children }) => (
    <div className="relative inline-block group">
      <div>
        {children}
      </div>
      <div className="absolute z-10 px-4 py-3 text-sm bg-white text-charcoal-800 rounded-xl shadow-xl -top-16 left-1/2 transform -translate-x-1/2 whitespace-nowrap border border-gray-200 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
        {content}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white"></div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen">
      {/* Main Content */}
      <div className="container mx-auto px-4 py-4 md:px-6 md:py-8">
        {/* Header */}
        <div className="text-center mb-6 md:mb-8">
          <div className="flex items-center justify-center gap-3 sm:gap-6">
            <div className="p-2.5 bg-emerald-600 rounded-xl shadow-lg">
              <Calculator className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-medium text-charcoal-800 tracking-tight">
              Compound Interest Calculator
            </h1>
            <div className="p-2.5 bg-emerald-600 rounded-xl shadow-lg">
              <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
          </div>
        </div>

        {/* Main Calculator Card */}
        <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-lg p-6 md:p-10 lg:p-12 mb-8 md:mb-12 border border-gray-100">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
            {/* Input Section */}
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl md:text-3xl font-semibold text-charcoal-800 mb-8 flex items-center gap-3">
                  <Calculator className="w-8 h-8 text-emerald-600" />
                  Investment Parameters
                </h2>

                {/* Currency Selector and Start Date */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                  <div>
                    <label className="flex items-center text-sm font-medium text-charcoal-700 mb-3 uppercase tracking-wide h-[1.5rem]">
                      Currency
                    </label>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-charcoal-800 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 shadow-sm text-lg h-[3.5rem]"
                    >
                      {Object.keys(currencySymbols).map(curr => (
                        <option key={curr} value={curr}>{curr}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="flex items-center text-sm font-medium text-charcoal-700 mb-3 uppercase tracking-wide h-[1.5rem]">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-charcoal-800 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 shadow-sm text-lg h-[3.5rem]"
                    />
                  </div>
                </div>

                {/* Initial Investment and Contribution Amount */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                  <div>
                    <Tooltip id="initial" content="The amount you&apos;re starting with">
                      <label className="flex items-center gap-3 text-sm font-medium text-charcoal-700 mb-3 uppercase tracking-wide h-[2.25rem]">
                        <DollarSign className="w-4 h-4 text-emerald-600" />
                        Initial Investment
                        <Info className="w-4 h-4 text-charcoal-400" />
                      </label>
                    </Tooltip>
                    <input
                      type="text"
                      value={initialInvestmentDisplay}
                      onChange={(e) => {
                        const numericValue = parseNumberFromCommas(e.target.value);
                        setInitialInvestment(numericValue);
                        setInitialInvestmentDisplay(formatNumberWithCommas(numericValue));
                      }}
                      onBlur={(e) => {
                        const numericValue = parseNumberFromCommas(e.target.value);
                        setInitialInvestmentDisplay(formatNumberWithCommas(numericValue));
                      }}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-charcoal-800 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 shadow-sm font-mono text-lg"
                    />
                  </div>

                  <div>
                    <div className="h-[2.25rem] flex items-center mb-3">
                      <Tooltip id="contribution" content="Amount you plan to invest at each interval">
                        <label className="flex items-center gap-3 text-sm font-medium text-charcoal-700 uppercase tracking-wide">
                          <span className="flex items-center gap-2">
                            Contribution
                            <select
                              value={contributionFrequency}
                              onChange={(e) => setContributionFrequency(e.target.value)}
                              className="ml-2 px-2 py-1 text-xs border border-gray-200 rounded-lg bg-white text-charcoal-800 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 shadow-sm appearance-none cursor-pointer"
                              style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23007CB2%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 4px center', backgroundSize: '12px auto', paddingRight: '20px' }}
                            >
                              <option value="daily">Daily</option>
                              <option value="weekly">Weekly</option>
                              <option value="biweekly">Bi-weekly</option>
                              <option value="monthly">Monthly</option>
                              <option value="quarterly">Quarterly</option>
                              <option value="semiannual">Semi-annual</option>
                              <option value="annual">Annual</option>
                            </select>
                          </span>
                          <Info className="w-4 h-4 text-charcoal-400" />
                        </label>
                      </Tooltip>
                    </div>
                    <input
                      type="text"
                      value={monthlyContributionDisplay}
                      onChange={(e) => {
                        const numericValue = parseNumberFromCommas(e.target.value);
                        setMonthlyContribution(numericValue);
                        setMonthlyContributionDisplay(formatNumberWithCommas(numericValue));
                      }}
                      onBlur={(e) => {
                        const numericValue = parseNumberFromCommas(e.target.value);
                        setMonthlyContributionDisplay(formatNumberWithCommas(numericValue));
                      }}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-charcoal-800 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 shadow-sm font-mono text-lg"
                    />
                  </div>
                </div>

                {/* Annual Interest Rate and Investment Period */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                  <div>
                    <Tooltip id="rate" content="Expected annual return on your investment">
                      <label className="flex items-center gap-3 text-sm font-medium text-charcoal-700 mb-3 uppercase tracking-wide">
                        Annual Rate ({annualRate}%)
                        <Info className="w-4 h-4 text-charcoal-400" />
                      </label>
                    </Tooltip>
                    <div className="flex gap-4 items-center">
                      <input
                        type="range"
                        min="0"
                        max="20"
                        step="0.1"
                        value={annualRate}
                        onChange={(e) => setAnnualRate(Number(e.target.value))}
                        className="flex-1 accent-emerald-500"
                      />
                      <input
                        type="number"
                        value={annualRate || ''}
                        onChange={(e) => setAnnualRate(Number(e.target.value) || 0)}
                        className="w-20 px-3 py-2 border border-gray-200 rounded-lg bg-white text-charcoal-800 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 shadow-sm font-mono"
                        min="0"
                        max="50"
                        step="0.1"
                      />
                    </div>
                  </div>

                  <div>
                    <Tooltip id="years" content="How long you plan to invest">
                      <label className="flex items-center gap-3 text-sm font-medium text-charcoal-700 mb-3 uppercase tracking-wide">
                        Period ({years} years)
                        <Info className="w-4 h-4 text-charcoal-400" />
                      </label>
                    </Tooltip>
                    <div className="flex gap-4 items-center">
                      <input
                        type="range"
                        min="1"
                        max="50"
                        value={years}
                        onChange={(e) => setYears(Number(e.target.value))}
                        className="flex-1 accent-emerald-500"
                      />
                      <input
                        type="number"
                        value={years || ''}
                        onChange={(e) => setYears(Number(e.target.value) || 1)}
                        className="w-20 px-3 py-2 border border-gray-200 rounded-lg bg-white text-charcoal-800 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 shadow-sm font-mono"
                        min="1"
                        max="100"
                      />
                    </div>
                  </div>
                </div>

                {/* Compound Frequency and Deposit Timing */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                  <div>
                    <Tooltip id="compound" content="How often interest is compounded">
                      <label className="flex items-center gap-3 text-sm font-medium text-charcoal-700 mb-3 uppercase tracking-wide">
                        Compound Frequency
                        <Info className="w-4 h-4 text-charcoal-400" />
                      </label>
                    </Tooltip>
                    <select
                      value={compoundFrequency}
                      onChange={e => setCompoundFrequency(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-charcoal-800 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 shadow-sm"
                    >
                      <option value={365}>Daily (365/yr)</option>
                      <option value={360}>Daily (360/yr)</option>
                      <option value={104}>Semi-Weekly (104/yr)</option>
                      <option value={52}>Weekly (52/yr)</option>
                      <option value={26}>Bi-Weekly (26/yr)</option>
                      <option value={24}>Semi-Monthly (24/yr)</option>
                      <option value={12}>Monthly (12/yr)</option>
                      <option value={6}>Bi-Monthly (6/yr)</option>
                      <option value={4}>Quarterly (4/yr)</option>
                      <option value={2}>Half-Yearly (2/yr)</option>
                      <option value={1}>Yearly (1/yr)</option>
                      <option value="custom">Custom</option>
                    </select>
                    
                    {/* Inline custom input (show only if compoundFrequency === 'custom') */}
                    {compoundFrequency === 'custom' && (
                      <div className="mt-3 flex items-center gap-2">
                        <label htmlFor="custom-compound" className="text-xs text-charcoal-700">Compounds per Year:</label>
                        <input
                          id="custom-compound"
                          type="number"
                          min="0.01"
                          step="0.01"
                          value={customCompoundFrequency}
                          onChange={e => setCustomCompoundFrequency(Number(e.target.value) || 1)}
                          className="w-20 px-2 py-1 border border-gray-200 rounded-lg bg-white text-charcoal-800 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 shadow-sm font-mono text-sm"
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <Tooltip id="deposits-timing" content="When deposits are made relative to interest calculation">
                      <label className="flex items-center gap-3 text-sm font-medium text-charcoal-700 mb-3 uppercase tracking-wide">
                        Deposit Timing
                        <Info className="w-4 h-4 text-charcoal-400" />
                      </label>
                    </Tooltip>
                    <div className="space-y-3 pt-2">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="radio"
                          name="depositsAtEnd"
                          checked={!depositsAtEnd}
                          onChange={() => setDepositsAtEnd(false)}
                          className="w-4 h-4 text-emerald-500 accent-emerald-500"
                        />
                        <span className="text-sm text-charcoal-700">Beginning of period</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="radio"
                          name="depositsAtEnd"
                          checked={depositsAtEnd}
                          onChange={() => setDepositsAtEnd(true)}
                          className="w-4 h-4 text-emerald-500 accent-emerald-500"
                        />
                        <span className="text-sm text-charcoal-700">End of period</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* One-Time Transactions */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <Tooltip id="one-time-transactions" content="Add one-time deposits or withdrawals on specific dates">
                      <label className="flex items-center gap-3 text-sm font-medium text-charcoal-700 uppercase tracking-wide">
                        One-Time Transactions
                        <Info className="w-4 h-4 text-charcoal-400" />
                      </label>
                    </Tooltip>
                    <button
                      onClick={addOneTimeTransaction}
                      className="flex items-center gap-2 px-3 py-2 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors duration-200"
                    >
                      <Plus className="w-4 h-4" />
                      Add Transaction
                    </button>
                  </div>
                  
                  <div className="space-y-3 max-h-48 overflow-y-auto">
                    {oneTimeTransactions.map((transaction) => (
                      <div key={transaction.id} className="p-4 bg-gray-50 rounded-xl border border-gray-200 shadow-sm">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-center">
                          <div>
                            <label className="block text-xs font-medium text-charcoal-700 mb-1">Type</label>
                            <select
                              value={transaction.type}
                              onChange={(e) => updateOneTimeTransaction(transaction.id, { type: e.target.value as 'deposit' | 'withdrawal' })}
                              className="w-full px-2 py-1 text-sm border border-gray-200 rounded-lg bg-white text-charcoal-800 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            >
                              <option value="deposit">Deposit</option>
                              <option value="withdrawal">Withdrawal</option>
                            </select>
                          </div>
                          
                          <div>
                            <label className="block text-xs font-medium text-charcoal-700 mb-1">Amount</label>
                            <input
                              type="text"
                              value={transaction.amountDisplay || formatNumberWithCommas(transaction.amount)}
                              onChange={(e) => {
                                const numericValue = parseNumberFromCommas(e.target.value);
                                updateOneTimeTransaction(transaction.id, { 
                                  amount: numericValue,
                                  amountDisplay: formatNumberWithCommas(numericValue)
                                });
                              }}
                              onBlur={(e) => {
                                const numericValue = parseNumberFromCommas(e.target.value);
                                updateOneTimeTransaction(transaction.id, { 
                                  amountDisplay: formatNumberWithCommas(numericValue)
                                });
                              }}
                              className="w-full px-2 py-1 text-sm border border-gray-200 rounded-lg bg-white text-charcoal-800 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                              placeholder="0"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-xs font-medium text-charcoal-700 mb-1">Date</label>
                            <input
                              type="date"
                              value={transaction.date}
                              onChange={(e) => updateOneTimeTransaction(transaction.id, { date: e.target.value })}
                              className="w-full px-2 py-1 text-sm border border-gray-200 rounded-lg bg-white text-charcoal-800 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            />
                          </div>
                          
                          <div className="flex justify-end">
                            <button
                              onClick={() => removeOneTimeTransaction(transaction.id)}
                              className="p-1 text-red-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors duration-200"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {oneTimeTransactions.length === 0 && (
                      <div className="text-center py-6 text-charcoal-500 text-sm">
                        No one-time transactions planned. Click &quot;Add Transaction&quot; to get started.
                      </div>
                    )}
                  </div>
                </div>

                {/* Annual Contribution Increase */}
                <div className="mb-6">
                  <Tooltip id="annual-increase" content="Percentage increase in contributions each year (e.g., 5% for salary raises)">
                    <label className="flex items-center gap-3 text-sm font-medium text-charcoal-700 mb-3 uppercase tracking-wide">
                      Annual Increase ({annualIncrease}%)
                      <Info className="w-4 h-4 text-charcoal-400" />
                    </label>
                  </Tooltip>
                  <div className="flex gap-4 items-center">
                    <input
                      type="range"
                      min="0"
                      max="20"
                      step="0.5"
                      value={annualIncrease}
                      onChange={(e) => setAnnualIncrease(Number(e.target.value))}
                      className="flex-1 accent-emerald-500"
                    />
                    <input
                      type="number"
                      value={annualIncrease || ''}
                      onChange={(e) => setAnnualIncrease(Number(e.target.value) || 0)}
                      className="w-20 px-3 py-2 border border-gray-200 rounded-lg bg-white text-charcoal-800 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 shadow-sm font-mono"
                      min="0"
                      max="50"
                      step="0.5"
                    />
                  </div>
                </div>

              </div>
            </div>

            {/* Results Section */}
            <div className="space-y-6 md:space-y-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-semibold text-charcoal-800 mb-6 md:mb-8 flex items-center gap-3">
                  <TrendingUp className="w-8 h-8 text-emerald-600" />
                  Results
                </h2>

                {result ? (
                  <>
                    {/* Final Amount */}
                    <div className="p-8 bg-emerald-700 rounded-2xl shadow-xl mb-6">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="p-2.5 bg-white/20 rounded-xl">
                          <TrendingUp className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-xl font-medium text-white">
                          Final Amount
                        </h3>
                      </div>
                      <div className="flex items-center justify-center min-h-24 p-2 overflow-hidden">
                        <p 
                          className="font-bold text-white font-mono tracking-wide leading-none text-center whitespace-nowrap"
                          style={{
                            fontSize: finalAmountFontSize,
                            lineHeight: '1'
                          }}
                        >
                          {formatCurrency(result.finalAmount)}
                        </p>
                      </div>
                    </div>

                    {/* Breakdown */}
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 mb-6">
                      <div className="p-6 bg-gray-50 rounded-xl border border-gray-200 min-w-0">
                        <h4 className="text-xs font-medium text-charcoal-600 mb-2 uppercase tracking-wider">
                          Total Contributions
                        </h4>
                        <p 
                          className="font-bold text-charcoal-800 font-mono whitespace-nowrap overflow-hidden text-xl"
                        >
                          {formatCurrency(result.totalContributions)}
                        </p>
                      </div>

                      <div className="p-6 bg-emerald-50 rounded-xl border border-emerald-200 min-w-0">
                        <h4 className="text-xs font-medium text-emerald-700 mb-2 uppercase tracking-wider">
                          Interest Earned
                        </h4>
                        <p 
                          className="font-bold text-emerald-700 font-mono whitespace-nowrap overflow-hidden text-xl"
                        >
                          {formatCurrency(result.totalInterest)}
                        </p>
                      </div>
                    </div>

                    {/* Visual Breakdown */}
                    <div className="p-6 bg-white rounded-xl border border-gray-200">
                      <h4 className="text-lg font-medium text-charcoal-800 mb-4">
                        Investment Breakdown
                      </h4>
                      <div className="relative h-8 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="absolute left-0 top-0 h-full bg-gray-600 transition-all duration-1000"
                          style={{ width: `${(result.totalContributions / result.finalAmount) * 100}%` }}
                        ></div>
                        <div 
                          className="absolute top-0 h-full bg-emerald-600 transition-all duration-1000"
                          style={{ 
                            left: `${(result.totalContributions / result.finalAmount) * 100}%`,
                            width: `${(result.totalInterest / result.finalAmount) * 100}%` 
                          }}
                        ></div>
                      </div>
                      <div className="flex justify-between mt-4 text-sm">
                        <span className="flex items-center gap-2 text-charcoal-600">
                          <div className="w-3 h-3 bg-gray-600 rounded"></div>
                          Principal ({((result.totalContributions / result.finalAmount) * 100).toFixed(1)}%)
                        </span>
                        <span className="flex items-center gap-2 text-charcoal-600">
                          <div className="w-3 h-3 bg-emerald-600 rounded"></div>
                          Interest ({((result.totalInterest / result.finalAmount) * 100).toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="p-12 bg-gray-50 rounded-3xl border border-gray-200 shadow-xl mb-8">
                    <div className="text-center">
                      <Calculator className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-2xl font-medium text-gray-600 mb-2">
                        Calculate Your Investment
                      </h3>
                      <p className="text-gray-500">
                        Enter your investment parameters to see your results
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>


        {/* Chart Section */}
        {result && (
          <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-lg p-6 md:p-10 lg:p-12 mb-8 md:mb-12 border border-gray-100">
            <div className="mb-6">
              <h2 className="text-2xl md:text-3xl font-semibold text-charcoal-800 flex items-center gap-3">
                <TrendingUp className="w-8 h-8 text-emerald-600" />
                Growth Over Time
              </h2>
            </div>

            <div className="h-64 md:h-80 lg:h-96" id="investment-chart">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={result.chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis 
                    dataKey="year" 
                    stroke="#64748B"
                    fontSize={12}
                  />
                  <YAxis 
                    tickFormatter={(value) => formatChartAxis(value)}
                    stroke="#64748B"
                    fontSize={12}
                  />
                  <RechartsTooltip 
                    formatter={(value: number, name: string) => {
                      if (name === "One-Time Withdrawals" && value > 0) {
                        return [`-${formatCurrency(value)}`, name];
                      }
                      return [formatCurrency(value), name];
                    }}
                    labelFormatter={(label) => `Year ${label}`}
                    content={(props) => {
                      if (!props.active || !props.payload || props.payload.length === 0) return null;
                      
                      const data = props.payload[0].payload;
                      const total = data.total;
                      
                      return (
                        <div style={{
                          backgroundColor: '#FFFFFF',
                          border: '1px solid #E2E8F0',
                          borderRadius: '12px',
                          color: '#1E293B',
                          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                          padding: '12px'
                        }}>
                          <p style={{ marginBottom: '8px', fontWeight: 'bold' }}>{`Year ${props.label}`}</p>
                          {props.payload.map((entry: { name: string; value: number; color: string }, index: number) => (
                            <p key={index} style={{ color: entry.color, margin: '4px 0' }}>
                              {entry.name === "One-Time Withdrawals" && entry.value > 0 
                                ? `${entry.name}: -${formatCurrency(entry.value)}`
                                : `${entry.name}: ${formatCurrency(entry.value)}`
                              }
                            </p>
                          ))}
                          <div style={{ borderTop: '1px solid #E2E8F0', marginTop: '8px', paddingTop: '8px' }}>
                            <p style={{ fontWeight: 'bold', color: '#000000' }}>
                              Total: {formatCurrency(total)}
                            </p>
                          </div>
                        </div>
                      );
                    }}
                  />
                  <Legend />
                  <Bar 
                    dataKey="principal" 
                    stackId="a"
                    fill="#64748B"
                    name="Contributions"
                  />
                  <Bar 
                    dataKey="interest" 
                    stackId="a"
                    fill="#10B981"
                    name="Interest Earned"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Yearly Breakdown Table */}
        {result && (
          <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-lg p-6 md:p-10 lg:p-12 mb-8 md:mb-12 border border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <h2 className="text-2xl md:text-3xl font-semibold text-charcoal-800 flex items-center gap-3">
                <Calculator className="w-8 h-8 text-emerald-600" />
                Yearly Breakdown
              </h2>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={downloadExcel}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  Download Excel
                </button>
                <button
                  onClick={downloadPDF}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
                >
                  <Download className="w-4 h-4" />
                  Download PDF
                </button>
              </div>
            </div>
            
            <div className="overflow-x-auto -mx-4 md:mx-0">
              <div className="min-w-full px-4 md:px-0">
                <table className="w-full text-sm min-w-[640px]">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-4 px-4 font-medium text-charcoal-700 bg-gray-50 rounded-tl-xl">Year</th>
                    <th className="text-left py-4 px-4 font-medium text-charcoal-700">Deposits</th>
                    <th className="text-left py-4 px-4 font-medium text-charcoal-700">Interest</th>
                    <th className="text-left py-4 px-4 font-medium text-charcoal-700 bg-gray-50">Total Deposits</th>
                    <th className="text-left py-4 px-4 font-medium text-charcoal-700 bg-emerald-50">Accrued Interest</th>
                    <th className="text-left py-4 px-4 font-medium text-charcoal-700 bg-gray-50 rounded-tr-xl">Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {result.chartData.map((data, index) => {
                    // Calculate NET deposits for this year (regular deposits + one-time deposits - withdrawals)
                    let yearDeposits;
                    if (data.year === 0) {
                      yearDeposits = initialInvestment;
                    } else {
                      // Apply the annual increase to contributions
                      const contributionMultiplier = Math.pow(1 + annualIncrease / 100, data.year - 1);
                      const periodsPerYear = contributionFrequency === 'monthly' ? 12 :
                                            contributionFrequency === 'quarterly' ? 4 :
                                            contributionFrequency === 'semiannual' ? 2 :
                                            contributionFrequency === 'annual' ? 1 :
                                            contributionFrequency === 'weekly' ? 52 :
                                            contributionFrequency === 'biweekly' ? 26 :
                                            contributionFrequency === 'daily' ? 365 : 12;
                      
                      const regularDeposits = (monthlyContribution * (12 / periodsPerYear)) * periodsPerYear * contributionMultiplier;
                      yearDeposits = regularDeposits + data.oneTimeDeposits - data.oneTimeWithdrawals;
                    }
                    
                    // Calculate interest for this specific year
                    const yearInterest = index === 0 
                      ? 0 
                      : data.interest - (index > 0 ? result.chartData[index - 1].interest : 0);
                    
                    // Calculate cumulative interest properly
                    const cumulativeInterest = data.interest;
                    
                    return (
                      <tr key={data.year} className={`border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200 ${
                        data.year % 5 === 0 ? 'bg-gray-50' : ''
                      }`}>
                        <td className="py-4 px-4 font-medium text-charcoal-800">
                          {data.year}
                        </td>
                        <td className="py-4 px-4 text-charcoal-700 font-mono whitespace-nowrap">
                          {formatCurrency(yearDeposits)}
                        </td>
                        <td className="py-4 px-4 text-charcoal-700 font-mono whitespace-nowrap">
                          {formatCurrency(yearInterest)}
                        </td>
                        <td className="py-4 px-4 font-semibold text-charcoal-800 bg-gray-50 font-mono whitespace-nowrap">
                          {formatCurrency(data.principal)}
                        </td>
                        <td className="py-4 px-4 font-semibold text-emerald-600 bg-emerald-50 font-mono whitespace-nowrap">
                          {formatCurrency(cumulativeInterest)}
                        </td>
                        <td className="py-4 px-4 font-bold text-emerald-600 bg-gray-50 font-mono whitespace-nowrap">
                          {formatCurrency(data.total)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              </div>
            </div>
          </div>
        )}

        {/* PDF Download Modal */}
        {showPdfModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl md:rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl">
              <div className="text-center mb-4 md:mb-6">
                <h3 className="text-xl md:text-2xl font-semibold text-charcoal-800 mb-2">
                  Download PDF Report
                </h3>
                <p className="text-charcoal-600">
                  Choose what you&apos;d like to download
                </p>
              </div>
              
              <div className="space-y-4">
                <button
                  onClick={() => {
                    downloadYearlyDataPDF();
                    setShowPdfModal(false);
                  }}
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors duration-200 shadow-lg hover:shadow-xl"
                >
                  <FileText className="w-5 h-5" />
                  Yearly Data Report
                  <span className="text-sm opacity-90">(Summary + Table)</span>
                </button>
                
                <button
                  onClick={async () => {
                    await downloadFullPagePDF();
                    setShowPdfModal(false);
                  }}
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-charcoal-800 hover:bg-charcoal-900 text-white rounded-xl transition-colors duration-200 shadow-lg hover:shadow-xl"
                >
                  <FileText className="w-5 h-5" />
                  Complete Report
                  <span className="text-sm opacity-90">(Full Page Content + Chart)</span>
                </button>
                
                <button
                  onClick={() => setShowPdfModal(false)}
                  className="w-full px-6 py-3 text-charcoal-600 hover:text-charcoal-800 border border-gray-300 hover:border-gray-400 rounded-xl transition-colors duration-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Share Button - Bottom of Page */}
        <div className="max-w-7xl mx-auto flex justify-center mb-8">
          <button
            onClick={() => {
              const url = window.location.href;
              if (navigator.share) {
                navigator.share({
                  title: 'Compound Interest Calculator',
                  text: 'Calculate your investment growth with our free compound interest calculator!',
                  url: url
                });
              } else {
                navigator.clipboard.writeText(url).then(() => {
                  alert('Link copied to clipboard!');
                });
              }
            }}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 md:px-6 md:py-3 rounded-lg shadow-lg transition-all duration-200 flex items-center gap-2 font-medium text-sm md:text-base border-0 outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
            title="Share this calculator"
            style={{ WebkitAppearance: 'none', MozAppearance: 'none' }}
          >
            <svg className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
            </svg>
            <span className="whitespace-nowrap">Share Calculator</span>
          </button>
        </div>

      </div>
    </div>
  );
};

export default CompoundInterestCalculator;