import { Link } from "react-router-dom";
import SEO from "../components/SEO";

export default function ShippingReturns() {
  return (
    <>
      <SEO title="Shipping and Returns" description="Zealc.ollection delivery timelines, costs and return policy." />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-10 pt-[120px] md:pt-[210px] pb-12 md:pb-20">
        <p className="eyebrow text-center mb-3">Service</p>
        <h1 className="section-heading text-3xl md:text-4xl text-center mb-12">
          Shipping and Returns
        </h1>

        <div className="space-y-10 text-onyx/75 leading-relaxed font-body text-[15px]">
          <div>
            <h2 className="font-display text-xl text-onyx mb-3">Delivery Options</h2>
            <table className="w-full text-sm mt-4">
              <thead>
                <tr className="border-b border-mist text-left">
                  <th className="py-3 pr-4 font-medium text-onyx">Method</th>
                  <th className="py-3 pr-4 font-medium text-onyx">Timeline</th>
                  <th className="py-3 font-medium text-onyx">Cost</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-mist">
                  <td className="py-3 pr-4">Standard Delivery</td>
                  <td className="py-3 pr-4">3-5 business days</td>
                  <td className="py-3">Free above 500, otherwise 25</td>
                </tr>
                <tr className="border-b border-mist">
                  <td className="py-3 pr-4">Express Delivery</td>
                  <td className="py-3 pr-4">1-2 business days</td>
                  <td className="py-3">45, fully insured</td>
                </tr>
                <tr>
                  <td className="py-3 pr-4">International</td>
                  <td className="py-3 pr-4">5-10 business days</td>
                  <td className="py-3">Calculated at checkout</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div>
            <h2 className="font-display text-xl text-onyx mb-3">Packaging</h2>
            <p>
              Every order is presented in signature Zealc.ollection packaging, including
              an embossed gift box, protective dust bag and certificate of
              authenticity where applicable. A handwritten note can be added
              at checkout at no additional cost.
            </p>
          </div>

          <div>
            <h2 className="font-display text-xl text-onyx mb-3">Returns</h2>
            <p className="mb-4">
              You may return any unworn item in its original condition and
              packaging within 30 days of delivery for a full refund. To
              initiate a return, contact our concierge team with your order
              reference and they will arrange collection or provide a prepaid
              label.
            </p>
            <p>
              Timepieces must be returned with all certificates, tags and
              original packaging. Items showing signs of wear, alteration or
              damage will not be accepted.
            </p>
          </div>

          <div>
            <h2 className="font-display text-xl text-onyx mb-3">Refunds</h2>
            <p>
              Refunds are processed to the original payment method within 14
              business days of our receiving the returned item. Shipping costs
              are non-refundable unless the return results from an error on
              our part.
            </p>
          </div>

          <div>
            <h2 className="font-display text-xl text-onyx mb-3">Exchanges and Repairs</h2>
            <p>
              We gladly exchange items for a different size or color subject to
              availability. All timepieces and leather goods are covered by our
              warranty and may be submitted for repair through our concierge
              team at any time during the coverage period.
            </p>
          </div>

          <div>
            <h2 className="font-display text-xl text-onyx mb-3">Contact</h2>
            <p>
              For any shipping or return enquiries, please contact
              concierge@zealcollection.com or visit our Contact page.
            </p>
          </div>
        </div>

        <div className="text-center mt-14">
          <Link to="/" className="btn-luxury-outline">
            Return to Home
          </Link>
        </div>
      </div>
    </>
  );
}
