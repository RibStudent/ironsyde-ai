import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { Card } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ChevronRight, Users, MessageSquare } from "lucide-react";
import { useState } from "react";

export default function Home() {
  // The userAuth hooks provides authentication state
  // To implement login/logout functionality, simply call logout() or redirect to getLoginUrl()
  let { user, loading, error, isAuthenticated, logout } = useAuth();

  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "annual">("annual");

  return (
    <div className="min-h-screen bg-[#0a0a14] text-white">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-pink-400 to-pink-500 text-white py-3 text-center text-sm">
        <span>Introducing Black Atys - our new iGaming Partnerships agency </span>
        <a href="#" className="underline hover:no-underline">learn more</a>
      </div>

      {/* Header */}
      <header className="border-b border-white/10">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-pink-500 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-6 h-6" />
            </div>
            <span className="text-xl font-bold">IronSyde</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="hover:text-pink-400 transition-colors">Features</a>
            <a href="#pricing" className="hover:text-pink-400 transition-colors">Pricing</a>
            <Button variant="outline" className="border-white/20 hover:bg-white/10">
              Log In
            </Button>
            <Button className="bg-gradient-to-r from-pink-600 to-pink-600 hover:from-pink-700 hover:to-pink-700">
              Start Free Trial
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20 text-center">
        <div className="inline-block mb-6 px-4 py-2 bg-pink-500/20 border border-pink-500/30 rounded-full text-sm">
          🎉 Now just $36/month!
        </div>
        <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
          The <span className="bg-gradient-to-r from-pink-400 via-pink-400 to-pink-400 bg-clip-text text-transparent">Flagship App</span>
          <br />
          to <span className="bg-gradient-to-r from-pink-400 via-pink-400 to-pink-400 bg-clip-text text-transparent">Scale</span> Adult Content
        </h1>
        <p className="text-xl text-gray-400 mb-8">The AI-powered CRM for Adult Content creators</p>
        <Button 
          size="lg" 
          className="bg-gradient-to-r from-pink-600 to-pink-600 hover:from-pink-700 hover:to-pink-700 text-lg px-8 py-6"
          onClick={() => window.location.href = isAuthenticated ? '/generate' : getLoginUrl()}
        >
          {isAuthenticated ? 'Generate Avatar' : 'Start Free Trial'}
        </Button>
        <p className="text-sm text-gray-500 mt-4">7-day free trial</p>
        
        {/* Hero Image */}
        <div className="mt-16 relative max-w-2xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden border-4 border-pink-500/30 shadow-2xl shadow-pink-500/20">
            <img 
              src="/karlee-hero.jpg" 
              alt="AI-Generated Avatar Example" 
              className="w-full h-auto"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
              <p className="text-sm text-pink-400 font-semibold">AI-Generated with IronSyde</p>
              <p className="text-xs text-gray-300">Create stunning avatars in seconds</p>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics */}
      <section className="container mx-auto px-6 py-12">
        <div className="flex justify-center gap-20">
          <div className="text-center">
            <div className="w-16 h-16 bg-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-pink-400" />
            </div>
            <div className="text-4xl font-bold mb-2">10K+</div>
            <div className="text-gray-400">Trusted by creators</div>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-8 h-8 text-blue-400" />
            </div>
            <div className="text-4xl font-bold mb-2">8M+</div>
            <div className="text-gray-400">Chat's sent with AI</div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-6 py-20">
        <h2 className="text-4xl font-bold text-center mb-12">Features</h2>
        <div className="max-w-4xl mx-auto">
          <Accordion type="single" collapsible defaultValue="item-1">
            <AccordionItem value="item-1" className="border-l-4 border-pink-500 bg-pink-500/5 px-6 mb-4">
              <AccordionTrigger className="text-xl font-semibold hover:text-pink-400">
                Works in Any Browser
              </AccordionTrigger>
              <AccordionContent className="text-gray-400 pt-4">
                Every other Adult Content CRM requires a desktop computer to use. IronSyde is the only CRM that works perfectly on your phone's browser - manage your business from anywhere without being tied to a desktop.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2" className="border-l-4 border-green-500 bg-green-500/5 px-6 mb-4">
              <AccordionTrigger className="text-xl font-semibold hover:text-green-400">
                Craft Perfect Messages Every Time
              </AccordionTrigger>
              <AccordionContent className="text-gray-400 pt-4">
                Our AI suggests personalized messages in your chosen personality style. Customize your personality or let our AI learn your unique voice - you're always in control.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3" className="border-l-4 border-pink-500 bg-pink-500/5 px-6 mb-4">
              <AccordionTrigger className="text-xl font-semibold hover:text-pink-400">
                Know Your Fans Inside Out
              </AccordionTrigger>
              <AccordionContent className="text-gray-400 pt-4">
                Track fan behavior, spending patterns, and engagement to build stronger relationships. Get insights that help you craft better messages and increase your earnings.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="container mx-auto px-6 py-20">
        <h2 className="text-4xl font-bold text-center mb-8">Pricing</h2>
        
        <div className="flex justify-center gap-4 mb-8">
          <Button
            variant={billingPeriod === "monthly" ? "default" : "outline"}
            onClick={() => setBillingPeriod("monthly")}
            className={billingPeriod === "monthly" ? "bg-pink-600" : "border-white/20"}
          >
            Monthly
          </Button>
          <Button
            variant={billingPeriod === "annual" ? "default" : "outline"}
            onClick={() => setBillingPeriod("annual")}
            className={billingPeriod === "annual" ? "bg-pink-600" : "border-white/20"}
          >
            Annual
          </Button>
        </div>

        {billingPeriod === "annual" && (
          <div className="text-center mb-8">
            <span className="inline-block px-4 py-2 bg-pink-500/20 border border-pink-500/30 rounded-full text-sm">
              🎉 Save $132/year with Annual
            </span>
          </div>
        )}

        <Card className="max-w-md mx-auto bg-gradient-to-br from-pink-900/20 to-pink-900/20 border-pink-500/30 p-8">
          <div className="text-center">
            <div className="text-5xl font-bold mb-2">${billingPeriod === "annual" ? "36" : "47"}</div>
            <div className="text-gray-400 mb-1">per account, per month</div>
            {billingPeriod === "annual" && (
              <div className="text-sm text-gray-500 mb-4">(billed annually)</div>
            )}
            {billingPeriod === "monthly" && (
              <div className="text-sm text-pink-400 mb-4">Save $132/year with annual</div>
            )}
            <Button className="w-full bg-gradient-to-r from-pink-600 to-pink-600 hover:from-pink-700 hover:to-pink-700 mb-2">
              Start Free Trial
            </Button>
            <p className="text-sm text-gray-500">7-day free trial</p>
          </div>

          <div className="mt-8 space-y-3">
            <p className="font-semibold mb-4">Includes:</p>
            {[
              "Access to IronSyde CRM",
              "Access to IronSyde AI",
              "Mobile-first CRM interface",
              "12,000 AI Credits",
              "Complete fan management",
              "AI message crafting assistant",
              "Advanced analytics & insights",
              "Multi-language support",
              "Fan behavior tracking",
              "Custom message templates",
              "24/7 priority support"
            ].map((feature, index) => (
              <div key={index} className="flex items-start gap-2">
                <ChevronRight className="w-5 h-5 text-pink-400 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-300">{feature}</span>
              </div>
            ))}
          </div>
        </Card>
      </section>

      {/* Testimonials */}
      <section className="container mx-auto px-6 py-20">
        <h2 className="text-4xl font-bold text-center mb-4">Creator Testimonials</h2>
        <p className="text-center text-gray-400 mb-12">Join thousands of creators using the only mobile Adult Content CRM</p>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <Card className="bg-gradient-to-br from-pink-900/20 to-pink-900/20 border-pink-500/30 p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-pink-500 rounded-full flex items-center justify-center text-xl font-bold">
                J
              </div>
              <div>
                <div className="font-semibold">Jayda Jacobs</div>
                <div className="text-sm text-gray-400">@JaydaJacobs • 244K followers</div>
              </div>
            </div>
            <p className="text-gray-300 italic">"I actually LOVE the chat feature IronSyde offers, so these additional tools will be very useful and helpful 🙏🏾💓"</p>
          </Card>

          <Card className="bg-gradient-to-br from-pink-900/20 to-pink-900/20 border-pink-500/30 p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-xl font-bold">
                S
              </div>
              <div>
                <div className="font-semibold">Stormy Succubus</div>
              </div>
            </div>
            <p className="text-gray-300 italic">"IronSyde is probably the single most useful tool I have found for adult entertainment work ever. It's just wonderfully amazing, and I didn't know how I ever managed to do this job without it"</p>
          </Card>

          <Card className="bg-gradient-to-br from-pink-900/20 to-pink-900/20 border-pink-500/30 p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-pink-500 rounded-full flex items-center justify-center text-xl font-bold">
                O
              </div>
              <div>
                <div className="font-semibold">Olivia Sinclair</div>
              </div>
            </div>
            <p className="text-gray-300 italic">"It certainly makes chatting faster and gives ideas on what to write next. So it kinda inspires you to write responses you wouldn't have thought about else... it's already a great helping hand🙏"</p>
          </Card>
        </div>
      </section>

      {/* Final CTA */}
      <section className="container mx-auto px-6 py-20 text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-6">
          Are You Ready to<br />Grow?
        </h2>
        <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
          Your hustle never stops. Run your Adult Content empire from your phone with the only mobile-first CRM built for creators.
        </p>
        <Button 
          size="lg" 
          className="bg-gradient-to-r from-pink-600 to-pink-600 hover:from-pink-700 hover:to-pink-700 text-lg px-8 py-6"
          onClick={() => window.location.href = isAuthenticated ? '/generate' : getLoginUrl()}
        >
          {isAuthenticated ? 'Generate Avatar' : 'Start Free Trial'}
        </Button>
        <p className="text-sm text-gray-500 mt-4">7-day free trial</p>
      </section>

      {/* FAQ */}
      <section className="container mx-auto px-6 py-20">
        <h2 className="text-4xl font-bold text-center mb-4">Frequently Asked Questions</h2>
        <p className="text-center text-gray-400 mb-12">
          Need personal help? Email us at <a href="mailto:hello@getironsyde.com" className="text-pink-400 hover:underline">hello@getironsyde.com</a>
        </p>
        
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible>
            <AccordionItem value="faq-1">
              <AccordionTrigger className="text-lg font-semibold">What is IronSyde?</AccordionTrigger>
              <AccordionContent className="text-gray-400">
                IronSyde is the only mobile-friendly AI-powered CRM designed specifically for Adult Content creators. We help you craft better messages, manage fan relationships, and track earnings - all from your phone, anywhere you are.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="faq-2">
              <AccordionTrigger className="text-lg font-semibold">How does IronSyde work?</AccordionTrigger>
              <AccordionContent className="text-gray-400">
                IronSyde learns your communication style and suggests personalized message ideas to help you respond to fans faster. You're always in control - we help you craft the perfect response, but you decide what to send. Our mobile CRM tracks fan behavior and engagement to help you build stronger relationships.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="faq-3">
              <AccordionTrigger className="text-lg font-semibold">How much does IronSyde cost?</AccordionTrigger>
              <AccordionContent className="text-gray-400">
                IronSyde offers flexible pricing starting at $36/month for individual creators. We also offer a 7-day free trial.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="faq-4">
              <AccordionTrigger className="text-lg font-semibold">Can IronSyde chat in other languages?</AccordionTrigger>
              <AccordionContent className="text-gray-400">
                Yes — IronSyde can suggest message ideas in English, Spanish, French, German, Portuguese, Italian, Dutch, and many other languages to help you connect with fans worldwide.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="faq-5">
              <AccordionTrigger className="text-lg font-semibold">Is IronSyde safe to use?</AccordionTrigger>
              <AccordionContent className="text-gray-400">
                Absolutely. IronSyde is designed with security in mind and follows platform terms of service. We use bank-grade encryption and never store your login credentials. We only suggest messages - you're always in control of what gets sent to your fans.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10">
        <div className="container mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex gap-8">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Access Labs</a>
              <a href="#features" className="text-gray-400 hover:text-white transition-colors">Features</a>
              <a href="#pricing" className="text-gray-400 hover:text-white transition-colors">Pricing</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Docs</a>
            </div>
          </div>
          <div className="text-center mt-8 text-gray-500 text-sm">
            <p className="mb-2">© IronSyde 2025. All rights reserved.</p>
            <div className="flex justify-center gap-4">
              <a href="#" className="hover:text-white transition-colors">Acceptable Use</a>
              <span>•</span>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              <span>•</span>
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

