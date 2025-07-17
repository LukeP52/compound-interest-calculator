import CompoundInterestCalculator from './components/CompoundInterestCalculator';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Compound Interest Calculator - Free Investment Growth Calculator',
  description: 'Calculate compound interest and investment growth with our free calculator. Plan your savings, investments, and retirement with accurate projections.',
  keywords: 'compound interest, investment calculator, savings calculator, retirement planning, financial calculator',
};

export default function Home() {
  return <CompoundInterestCalculator />;
}
