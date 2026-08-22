export default function AboutPage() {
  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-3xl mb-6">About Threadly</h1>

      <div className="space-y-5 text-ink/80 leading-relaxed">
        <p>
          Threadly is a one-person clothing shop. There's no warehouse, no
          call center, and no marketplace taking a cut — just me, sourcing
          pieces I think are worth wearing and bringing them to your door
          myself.
        </p>

        <p>
          When you place an order, I personally buy the item from the shop,
          confirm it with you, and deliver it by hand. Payment happens on
          delivery — cash or UPI, whatever's easiest for you.
        </p>

        <h2 className="font-display text-xl pt-4">How it works</h2>
        <ol className="list-decimal list-inside space-y-2">
          <li>Browse the catalog and place an order</li>
          <li>I confirm it and go buy the item</li>
          <li>It's delivered straight to your door</li>
          <li>You pay cash or UPI when it arrives</li>
        </ol>

        <h2 className="font-display text-xl pt-4">Why Threadly</h2>
        <p>
          No middlemen, no marketplace markup, no guessing whether a seller
          is legitimate. Every order is handled personally, start to finish.
        </p>
      </div>
    </div>
  );
}