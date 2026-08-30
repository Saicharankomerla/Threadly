import Image from "next/image";

export default function AboutPage() {
  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-3xl mb-10">About Komerla</h1>

      <div className="grid sm:grid-cols-[1fr_1.1fr] gap-8 sm:gap-12 items-center mb-16">
        <div className="relative aspect-[4/5] w-full overflow-hidden bg-line/40">
          <Image
            src="/founder.jpg"
            alt="Sai Charan Komerla"
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 480px"
            priority
          />
        </div>
        <div>
          <p className="font-display text-4xl sm:text-5xl leading-[1.05] mb-4">
            Sai Charan
            <br />
            Komerla
          </p>
          <div className="w-10 border-t border-ink/30 mb-4" />
          <p className="text-sm uppercase tracking-widest text-thread mb-1">
            Founder &amp; CEO
          </p>
          <p className="text-xs uppercase tracking-[0.3em] text-ink/50">
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
          confirm it with you, and deliver it by hand.I'm sorry to say this there is no cash on delivery
           — Only Bank transfer or UPI, whatever's easiest for you.
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
