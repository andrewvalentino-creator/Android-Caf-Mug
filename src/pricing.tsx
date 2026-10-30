import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { PRODUCT } from './product'
import './index.css'
import './pricing.css'

function Pricing() {
  const home = import.meta.env.BASE_URL
  return <div className="pricing-page">
    <a className="skip-link" href="#pricing-main">Skip to pricing</a>
    <header className="pricing-nav">
      <a className="brand" href={home} aria-label="Zap Band home"><span className="brand-dot" /><span className="display">zap / band</span></a>
      <nav aria-label="Main navigation"><a href={home}>Overview</a><a href="pricing.html" aria-current="page">Pricing</a><a href={`${home}#demo`}>Try the demo ↗</a></nav>
    </header>
    <main id="pricing-main">
      <section className="pricing-hero" aria-labelledby="pricing-title">
        <div className="pricing-intro"><p className="label eyebrow">A personal start to the day</p><h1 id="pricing-title" className="display">Your morning.<br /><span>Your band.</span></h1><p>A wearable alarm concept for people who share their space, but not their schedule.</p></div>
        <div className="pricing-product">
          <figure><img src={PRODUCT.photo} alt="AI-generated graphite Zap Band design mockup with a blue indicator; not a working prototype." width="1500" height="1500" fetchPriority="high" /><figcaption>Design concept · Final form may change</figcaption></figure>
          <article className="pricing-card" aria-labelledby="band-title">
            <span className="product-badge label"><span /> In development</span>
            <h2 id="band-title" className="display">Zap Band</h2>
            <p className="pricing-description">A proposed wearable alarm using adjustable electrical pulses, designed around a quieter wake-up for you and the people nearby.</p>
            <div className="price-display"><strong>$99<span>.99</span></strong><span>USD / device<br />Planned one-time price</span></div>
            <p className="availability">Not available to purchase. No launch date has been announced.</p>
            <a className="button button-primary" href={`${home}#demo`}>Try the concept demo <span aria-hidden="true">↗</span></a>
            <a className="pricing-secondary" href="#pricing-questions">Questions about the concept ↓</a>
            <p className="pricing-small">Device price only. Shipping and tax terms have not been finalized. No payment or reservation is taken.</p>
          </article>
        </div>
      </section>
      <section className="pricing-goals" aria-labelledby="goals-title">
        <div><p className="label eyebrow">What we are exploring</p><h2 id="goals-title" className="display">Simple by intention.</h2><p>These are design goals, not verified capabilities of a finished product.</p></div>
        <div className="goal-grid">
          <article><span className="label">01 / Your schedule</span><h3>Choose your wake time</h3><p>A personal setting for the moment your day begins.</p></article>
          <article><span className="label">02 / Your control</span><h3>Adjustable pulse intensity</h3><p>Explore a more personal alarm with straightforward controls.</p></article>
          <article><span className="label">03 / Your routine</span><h3>Comfortable wearable form</h3><p>A design goal for everyday use, with fit and comfort still to be tested.</p></article>
        </div>
      </section>
      <section id="pricing-questions" className="pricing-faq" aria-labelledby="faq-title"><div><p className="label eyebrow">Before your first morning</p><h2 className="display" id="faq-title">A few clear answers.</h2></div><div className="faq-list">
        <details><summary>Can I buy or preorder Zap Band?</summary><p>Not yet. This page presents a student venture concept at a planned price of $99.99 USD per device. There is no checkout, preorder, or reservation. A launch date has not been set.</p></details>
        <details><summary>Is there a subscription or a different tier?</summary><p>The selected pricing model is a one-time device purchase. No subscriptions, additional tiers, bundles, or paid add-ons are currently offered.</p></details>
        <details><summary>What is included in the price?</summary><p>The $99.99 planned price is for one Zap Band device. Final specifications, packaging contents, shipping charges, tax treatment, and any future purchase terms remain to be finalized.</p></details>
        <details><summary>Has the concept been tested?</summary><p>Safety, waking effectiveness, reliability, and comfortable wear have not been established. The image is a design mockup. The interactive demo illustrates a possible interface and does not schedule an alarm or produce an electrical pulse.</p></details>
      </div></section>
      <section className="pricing-end"><p className="label eyebrow">A quieter start, imagined.</p><h2 className="display">Explore your morning.</h2><a className="button button-ghost" href={`${home}#demo`}>Open the wake-time demo <span aria-hidden="true">↗</span></a></section>
    </main>
    <footer className="pricing-footer"><a className="display" href={home}>zap / band</a><p>Zap Band · A Fairfield University student venture concept.<br />Concept imagery. No product sales or medical claims.</p><a href={home}>Back to overview ↑</a></footer>
  </div>
}
createRoot(document.getElementById('root')!).render(<StrictMode><Pricing /></StrictMode>)
