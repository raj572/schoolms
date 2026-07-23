import PricingSection from '@/components/landing/PricingSection'
import React from 'react'

const Pricing = () => {
  
  return (
    <div className='py-20 bg-background'>
      <section className="relative text-center px-6 md:px-10">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-background -z-10" />
        <div className="max-w-3xl mx-auto py-20">
          {/* Background grid */}
          <div
            className="absolute inset-0 z-0  opacity-[0.06]"
            style={{
              backgroundImage: `
                linear-gradient(to right, hsl(var(--primary)) 1px, transparent 1px),
                linear-gradient(to bottom, hsl(var(--primary)) 1px, transparent 1px)
              `,
              backgroundSize: "70px 70px",
            }}
          />
          <h1 className="text-4xl md:text-5xl  font-bold text-foreground mb-4">
            Pricing
          </h1>
          <p className="text-muted-foreground text-xl mb-8">
            Choose the plan that fits your institution. No hidden fees, no complexity
            just straightforward value for every school size.
          </p>
        </div>
      </section>

      <PricingSection />
    </div>
  )
}

export default Pricing