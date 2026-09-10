export default function ReturnsPage() {
  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-3xl mb-8">Returns &amp; Exchange Policy</h1>

      <div className="space-y-5 text-ink/80 leading-relaxed">
        <p>
          We want you to receive exactly what you ordered, in perfect condition. Because every
          order is packed and delivered personally, we handle returns a little differently than
          most stores — through a simple video-verification process, rather than a general
          money-back policy.
        </p>

        <p>
          <strong className="text-ink">We do not offer refunds.</strong> If an item arrives with a
          genuine defect — damaged, wrong item, or wrong size sent by us — we'll exchange it for
          you, verified through the unboxing video process below.
        </p>

        <h2 className="font-display text-xl pt-4">How it works</h2>
        <ol className="list-decimal list-inside space-y-3">
          <li>
            We record a video while packing your order, before it's sealed and sent.
          </li>
          <li>
            When your order arrives, record a video of yourself opening the package for the very
            first time — before removing any tags or trying anything on. Keep the camera running
            continuously from an unopened package to a fully revealed item.
          </li>
          <li>
            If you notice a genuine defect, contact us within <strong className="text-ink">7 days</strong> of
            delivery and share your unboxing video with us.
          </li>
          <li>
            We compare your video against our packing video to verify the issue.
          </li>
          <li>
            If confirmed, we arrange an exchange for the same item — correct size or a replacement,
            whichever applies. We do not issue cash refunds or store credit.
          </li>
        </ol>

        <h2 className="font-display text-xl pt-4">To qualify for an exchange</h2>
        <ul className="list-disc list-inside space-y-2">
          <li>The item must be unworn, unwashed, and with all original tags attached</li>
          <li>It must be in its original packaging</li>
          <li>The defect must be clearly visible in your unboxing video</li>
          <li>You must contact us within 7 days of delivery</li>
        </ul>

        <h2 className="font-display text-xl pt-4">What isn't covered</h2>
        <ul className="list-disc list-inside space-y-2">
          <li>Change of mind after purchase</li>
          <li>Wrong size ordered by mistake (not a defect on our part)</li>
          <li>Claims made without a matching unboxing video</li>
          <li>Items that have been worn, washed, or have tags removed</li>
        </ul>

        <h2 className="font-display text-xl pt-4">How to request an exchange</h2>
        <p>
          Reach out to us through the{" "}
          <a href="/contact" className="text-thread underline">
            Contact &amp; support
          </a>{" "}
          page within 7 days of delivery, and attach your unboxing video along with your order ID.
          We personally review every request and respond directly.
        </p>
      </div>
    </div>
  );
}
