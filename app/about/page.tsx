import Image from "next/image";

export default function AboutPage() {
  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-3xl mb-10">About Komerla</h1>

      <div className="flex flex-col sm:flex-row gap-8 items-center sm:items-start mb-12 card p-6">
        <div className="relative h-40 w-40 flex-shrink-0 overflow-hidden rounded-full bg-line/40">
          <Image
            src="/founder.jpg"
            alt="Sai Charan Komerla"
            fill
            className="object-cover"
            sizes="160px"
          />
        </div>
        <div className="text-center sm:text-left">
          <p className="font-display text-2xl">Sai Charan Komerla</p>
          <p className="text-sm uppercase tracking-widest text-thread mt-1">
            Founder &amp; CEO
          </p>
          <p className="text-xs uppercase tracking-[0.2em] text-ink/50 mt-1">
            Komerla Fashion House
          </p>
        </div>
      </div>

      <div className="max-w-2xl space-y-5 text-ink/80 leading-relaxed">
        <p>
          Komerla is a fashion house built on a simple idea: great style shouldn't come with markup, guesswork, or middlemen.
          We curate pieces we believe are worth wearing, and we handle every order personally — from sourcing to delivery — so you always know exactly what you're getting and who you're getting it from.
        </p>

        <p>
          When you place an order, I personally 
          confirm it with you, and deliver it by hand. Payment happens on
          delivery — Bank transfer or UPI, whatever's easiest for you.
        </p>

        <h2 className="font-display text-xl pt-4">How it works</h2>
        <ol className="list-decimal list-inside space-y-2">
          <li>Browse the catalog and place an order</li>
          <li>Complete payment securely via UPI or bank transfer</li>
          <li>We source your item and confirm it's ready for delivery</li>
          <li>There is no COD for your first 3 orders</li>
          <li>Your order is delivered straight to your door</li>
        </ol>

        <h2 className="font-display text-xl pt-4">Why Komerla</h2>
        <p>
          Our Promise

No marketplace fees. No inflated pricing. No uncertainty about who you're buying from. Every order at Komerla is sourced, verified, and delivered with the same care — start to finish.
We built Komerla because fashion shouldn't require choosing between paying a premium for convenience or gambling on unreliable resellers. So we cut out the middle layer entirely — sourcing pieces ourselves, at fair prices, and delivering them directly to you.
No algorithms deciding what you see. No countdown timers or fake urgency. Just clothing we stand behind, priced fairly.
        </p>
        <p>        Questions before you order?                                                                                                          
 Reach out anytime — every message is read and answered personally, and we'll always be upfront about whether something's worth your money.</p> 
      </div>
    </div>
  );
}