import { PRODUCT } from './product'

/* Original CTA band, rule, columns and fading wordmark, in responsive flow
   outside the artboard. The actual merchant handles checkout and support. */
export default function Footer() {
  return <footer id="purchase" className="site-footer" tabIndex={-1}>
    <div className="footer-panel">
      <div className="purchase-band">
        <div>
          <span className="product-badge label"><span aria-hidden="true" /> Your next everyday favorite</span>
          <h2 className="display">Make room<br />for <span>your mug.</span></h2>
          <p>Android Café Mug. A little character for your coffee.</p>
        </div>
        <div className="purchase-box">
          <div className="purchase-price"><strong className="display">{PRODUCT.price}</strong><span className="label">USD / 11 oz</span></div>
          <a className="button button-primary" href={PRODUCT.buyUrl}>Buy on Google Merch Shop <span aria-hidden="true">↗</span></a>
          <p>See the shop for current pricing, availability,<br />shipping, and returns.</p>
        </div>
      </div>
      <div className="footer-rule" />
      <div className="footer-columns">
        <div className="footer-brand"><span className="brand-dot" aria-hidden="true" /><span className="display">android / café</span><p>Your favorite companion.<br />Now part of your daily ritual.</p></div>
        <div><h3 className="label">The mug</h3><p>11 oz capacity</p><p>Matte exterior</p><p>Glossy interior</p></div>
        <div><h3 className="label">A little care</h3><p>Handwashing recommended</p><p>Made for your daily coffee break</p></div>
        <div><h3 className="label">Find your Android</h3><a href={PRODUCT.buyUrl}>Shop the mug ↗</a><a href="#overview" onClick={e => { e.preventDefault(); window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' }); history.replaceState(null, '', '#overview') }}>Back to top ↑</a></div>
      </div>
      <div className="legal-bar"><span>Independent product showcase. Not affiliated with Google.</span><span>Android is a trademark of Google LLC.</span></div>
      <div className="footer-wordmark display" aria-hidden="true">android.</div>
    </div>
  </footer>
}
