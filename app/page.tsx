import CompoundInterestCalculator from './components/CompoundInterestCalculator';
import AdSenseAd from './components/AdSenseAd';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Compound Interest Calculator - Free Investment Growth Calculator',
  description: 'Calculate compound interest and investment growth with our free calculator. Plan your savings, investments, and retirement with accurate projections.',
  keywords: 'compound interest, investment calculator, savings calculator, retirement planning, financial calculator',
};

export default function Home() {
  return (
    <main role="main">
      {/* Calculator Component */}
      <CompoundInterestCalculator />

      {/* Educational Content Section */}
      <article className="max-w-4xl mx-auto px-4 py-8 md:px-6">
        <div className="prose prose-lg max-w-none">
          <h2 className="text-2xl md:text-3xl font-bold text-charcoal-800 mb-6 text-center">
            Understanding Compound Interest
          </h2>
          
          <div className="bg-blue-50 border-l-4 border-blue-400 p-6 mb-8">
            <h3 className="text-xl font-semibold text-blue-800 mb-3">What is Compound Interest?</h3>
            <p className="text-blue-700 leading-relaxed">
              Compound interest is the interest calculated on the initial principal and the accumulated interest from previous periods. 
              It&apos;s often called &quot;interest on interest&quot; and can significantly boost your investment returns over time. 
              The longer you invest, the more powerful compound interest becomes.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-lg font-semibold text-charcoal-800 mb-3">How It Works</h3>
              <p className="text-charcoal-700 leading-relaxed">
                When you invest money, you earn interest not just on your original investment, but also on any interest you&apos;ve already earned. 
                This creates a snowball effect where your money grows faster over time.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-charcoal-800 mb-3">Why It Matters</h3>
              <p className="text-charcoal-700 leading-relaxed">
                Understanding compound interest helps you make better financial decisions. 
                Even small, regular contributions can grow into substantial amounts over decades, 
                making it a powerful tool for retirement planning and wealth building.
              </p>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-green-800 mb-3">💡 Pro Tips for Maximizing Compound Interest</h3>
            <ul className="list-disc list-inside text-green-700 space-y-2">
              <li>Start investing early - time is your biggest advantage</li>
              <li>Make regular contributions, even small amounts</li>
              <li>Reinvest all dividends and interest</li>
              <li>Choose investments with consistent returns</li>
              <li>Don&apos;t withdraw money unnecessarily</li>
            </ul>
          </div>

          {/* Ad Unit - After substantial content */}
          <div className="my-8 flex justify-center">
            <AdSenseAd 
              slot="1234567890" 
              style={{ display: 'block', width: '728px', height: '90px' }}
              format="horizontal"
              className="max-w-full"
            />
          </div>

          <h2 className="text-2xl md:text-3xl font-bold text-charcoal-800 mb-6">
            Understanding Your Results
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <h3 className="text-lg font-semibold text-charcoal-800 mb-3">Final Amount</h3>
              <p className="text-charcoal-700 text-sm">
                The total value of your investment at the end of the specified period, 
                including all contributions and earned interest.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <h3 className="text-lg font-semibold text-charcoal-800 mb-3">Total Contributions</h3>
              <p className="text-charcoal-700 text-sm">
                The sum of all money you personally contributed to the investment over time.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <h3 className="text-lg font-semibold text-charcoal-800 mb-3">Interest Earned</h3>
              <p className="text-charcoal-700 text-sm">
                The amount of money earned through compound interest on your investments.
              </p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-charcoal-800 mb-4">Frequently Asked Questions</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-charcoal-800">How accurate are these calculations?</h4>
                <p className="text-charcoal-700 text-sm">
                  Our calculator uses standard compound interest formulas and provides accurate projections based on your inputs. 
                  Remember that actual investment returns may vary due to market fluctuations.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-charcoal-800">What&apos;s a realistic annual return rate?</h4>
                <p className="text-charcoal-700 text-sm">
                  Historical stock market returns average around 7-10% annually, but this varies significantly by asset class 
                  and time period. Conservative estimates are often 5-7% for diversified portfolios.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-charcoal-800">Should I include inflation in my calculations?</h4>
                <p className="text-charcoal-700 text-sm">
                  This calculator shows nominal returns (not adjusted for inflation). 
                  Consider that inflation typically reduces purchasing power by 2-3% annually.
                </p>
              </div>
            </div>
          </div>

          {/* Ad Unit - Before FAQ section */}
          <div className="my-8 flex justify-center">
            <AdSenseAd 
              slot="0987654321" 
              style={{ display: 'block', width: '300px', height: '250px' }}
              format="rectangle"
              className="max-w-full"
            />
          </div>
        </div>
      </article>
    </main>
  );
}
