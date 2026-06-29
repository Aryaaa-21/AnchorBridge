import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { ArrowRight, ShieldCheck, Milestone, Scale, Zap, Star } from 'lucide-react';
import { motion } from 'framer-motion';

export const Landing: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useStore();

  const handleCTA = () => {
    // Quick login as guest client to explore
    login('Demo User', 'client');
    navigate('/dashboard');
  };

  const features = [
    {
      icon: Milestone,
      title: 'Milestone-Based Locking',
      description: 'Break contracts down into manageable phases. Funds are locked securely in Soroban escrow and released sequentially upon client approval.',
    },
    {
      icon: ShieldCheck,
      title: 'Stellar Soroban Escrow',
      description: 'Auditable, decentralized, open-source smart contracts. No single central point of failure, ensuring your deposits remain under cryptographic vault security.',
    },
    {
      icon: Scale,
      title: 'Fair Arbitration Engine',
      description: 'If deliverables don\'t meet criteria, raise disputes instantly. Stakeholders submit cryptographic evidence, resolved via transparent multi-sig keys or arbitrator networks.',
    },
    {
      icon: Zap,
      title: 'Freighter Wallet Native',
      description: 'Interact directly using your Freighter extension. Signing transactions, verifying milestones, and releasing payments takes seconds with zero gas-inflation spikes.',
    },
  ];

  const testimonials = [
    {
      quote: "Depositing milestone payments in Soroban smart contracts has cut our security deposit friction to zero. Bob delivered on time, and releasing funds was instant.",
      author: "Alice Cooper",
      role: "CTO, Alice Labs Corp",
      avatar: "A"
    },
    {
      quote: "As a smart contract engineer, I require absolute transparency. Knowing the contract locks the escrow budget before I write code gives me complete peace of mind.",
      author: "Eve Dev",
      role: "Lead Solidity & Rust Developer",
      avatar: "E"
    },
    {
      quote: "The arbitration protocol is highly professional. AnchorBridge solved our milestone disagreement transparently, releasing funds based on verifiable specs.",
      author: "Mark Marcus",
      role: "Founder, Luna Finance",
      avatar: "M"
    }
  ];

  const stats = [
    { value: '45.8M+', label: 'XLM Escrowed' },
    { value: '18,500+', label: 'Milestones Completed' },
    { value: '99.8%', label: 'Successful Release Rate' },
    { value: '< 0.5%', label: 'Disputed Escrows' },
  ];

  const faqs = [
    {
      q: 'How does the escrow release mechanism work?',
      a: 'When starting a project, the client deposits the total budget into a Soroban smart contract. The contract separates the funds into individual milestone pools. Once the freelancer completes a milestone and submits deliverables, the client reviews and approves it, triggering the contract to release that milestone\'s funds.',
    },
    {
      q: 'What happens in case of a dispute?',
      a: 'Either party can trigger a dispute state on a active milestone. This locks the escrowed funds for that milestone and opens a case where both sides can upload evidence. Trusted arbitrators review the submissions and execute a multisig release or refund based on the spec contract.',
    },
    {
      q: 'Is there a fee for using AnchorBridge?',
      a: 'We charge a flat 0.5% fee on successfully completed milestones to fund developers and maintain the arbitration platform. There are no registration or deposit fees.',
    },
  ];

  return (
    <div className="flex flex-col bg-bg-app transition-colors duration-300">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-24 md:pt-24 md:pb-36 earthy-gradient-hero">
        {/* Background Grid Pattern */}
        <div 
          className="absolute inset-0 bg-[linear-gradient(to_right,#5d240a08_1px,transparent_1px),linear-gradient(to_bottom,#5d240a08_1px,transparent_1px)] bg-[size:4rem_4rem] dark:bg-[linear-gradient(to_right,#f5efe703_1px,transparent_1px),linear-gradient(to_bottom,#f5efe703_1px,transparent_1px)]" 
          aria-hidden="true"
        />
        
        {/* Decorative ambient blobs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full bg-accent-brand/10 dark:bg-primary-brand/5 blur-[100px] pointer-events-none" />

        <div className="mx-auto max-width px-6 relative z-10 text-center">
          {/* Tagline Badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-brand/10 border border-accent-brand/20 text-accent-brand text-xs font-semibold uppercase tracking-wider mb-6"
          >
            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            <span>Trustless Milestone Escrow on Stellar</span>
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl md:text-6xl font-black tracking-tight text-primary-brand dark:text-text-dark font-sans leading-[1.1] max-w-4xl mx-auto mb-6"
          >
            Securing freelance collaboration with <span className="text-accent-brand">cryptographic escrow</span>
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-text-main text-sm md:text-base max-w-2xl mx-auto leading-relaxed mb-10 opacity-90"
          >
            AnchorBridge binds client deposits and freelancer deliverables to Soroban smart contracts. 
            Funds release milestone-by-milestone, establishing ironclad mutual trust without third-party fees.
          </motion.p>

          {/* Call to Actions */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto"
          >
            <button
              onClick={handleCTA}
              className="w-full sm:w-auto px-8 py-4 bg-primary-brand text-text-dark font-bold rounded-lg shadow-lg hover:opacity-95 transform active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer min-h-[48px]"
              aria-label="Launch Sandbox Dashboard"
            >
              <span>Launch Dashboard</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
            <Link
              to="/login"
              className="w-full sm:w-auto px-8 py-4 border border-primary-brand/35 dark:border-border-app text-text-main font-bold rounded-lg hover:bg-border-app/20 transition-all flex items-center justify-center gap-2 min-h-[48px]"
              aria-label="Sign in to your account"
            >
              Sign In
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Statistics Section */}
      <section id="stats" className="py-12 border-t border-b border-border-app bg-surface-app transition-colors duration-300" aria-label="Key Statistics">
        <div className="mx-auto max-width px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <p className="text-3xl md:text-4xl font-black text-primary-brand dark:text-text-dark font-mono">
                  {stat.value}
                </p>
                <p className="text-[10px] md:text-xs font-semibold uppercase tracking-wider text-text-muted mt-1">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 mx-auto max-width px-6" aria-labelledby="features-heading">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 id="features-heading" className="text-2xl md:text-4xl font-extrabold text-primary-brand dark:text-text-dark mb-4">
            Secured by design. Interactive by default.
          </h2>
          <p className="text-xs md:text-sm text-text-muted">
            AnchorBridge streamlines the billing workflow, providing clients and freelancers with peace of mind.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {features.map((feat, index) => (
            <motion.div 
              key={index} 
              whileHover={{ y: -4, borderColor: '#ac5c2c' }}
              transition={{ duration: 0.2 }}
              className="p-6 rounded-xl border border-border-app glass-card hover:border-accent-brand transition-all duration-300"
            >
              <div className="h-10 w-10 rounded-lg bg-accent-brand/10 text-accent-brand flex items-center justify-center mb-4">
                <feat.icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <h3 className="text-sm font-bold text-text-main mb-2 uppercase tracking-wide">{feat.title}</h3>
              <p className="text-xs text-text-muted leading-relaxed">{feat.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Workflow Section */}
      <section id="workflow" className="py-20 bg-surface-app border-t border-b border-border-app" aria-labelledby="workflow-heading">
        <div className="mx-auto max-width px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 id="workflow-heading" className="text-2xl md:text-4xl font-extrabold text-primary-brand dark:text-text-dark mb-4">
              How AnchorBridge Works
            </h2>
            <p className="text-xs md:text-sm text-text-muted">
              Get up and running with trustless milestones in 4 simple steps.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8 relative">
            <div className="hidden md:block absolute top-12 left-12 right-12 h-[1px] bg-border-app z-0" aria-hidden="true" />
            
            {[
              { step: '01', title: 'Connect Freighter', desc: 'Securely link your Stellar keypair via Freighter browser wallet extension.' },
              { step: '02', title: 'Define Milestones', desc: 'Client writes project contract scope, schedule, and funding tranches.' },
              { step: '03', title: 'Lock Escrow', desc: 'Client funds the contract. XLM is held securely in the Soroban state vault.' },
              { step: '04', title: 'Submit & Release', desc: 'Freelancer submits work. Client approves. Contract releases funds.' }
            ].map((w, index) => (
              <div key={index} className="flex flex-col items-center text-center relative z-10">
                <div className="h-12 w-12 rounded-full bg-primary-brand text-text-dark flex items-center justify-center font-mono font-bold text-xs mb-4 border border-border-app">
                  {w.step}
                </div>
                <h4 className="text-xs font-bold text-text-main mb-2 uppercase tracking-wide">{w.title}</h4>
                <p className="text-xs text-text-muted leading-relaxed px-4">{w.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 mx-auto max-width px-6" aria-labelledby="testimonials-heading">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 id="testimonials-heading" className="text-2xl md:text-4xl font-extrabold text-primary-brand dark:text-text-dark mb-4">
            Trusted by Builders & Backers
          </h2>
          <p className="text-xs md:text-sm text-text-muted">
            See how decentralized developers and organizations align incentives with AnchorBridge.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, index) => (
            <div key={index} className="p-6 rounded-xl border border-border-app glass-panel flex flex-col justify-between space-y-4">
              <div className="flex items-center gap-0.5 text-[#E8A317]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <p className="text-xs text-text-main italic leading-relaxed">
                "{t.quote}"
              </p>
              <div className="flex items-center gap-3 pt-2 border-t border-border-app/20">
                <div className="h-8 w-8 rounded-full bg-accent-brand text-text-dark flex items-center justify-center font-bold text-xs">
                  {t.avatar}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-text-main">{t.author}</h4>
                  <p className="text-[10px] text-text-muted">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 mx-auto max-width px-6" aria-labelledby="faq-heading">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 id="faq-heading" className="text-2xl md:text-4xl font-extrabold text-primary-brand dark:text-text-dark mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-xs md:text-sm text-text-muted">
            Got questions about trustless Soroban escrows? We have answers.
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-6">
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              className="p-6 rounded-xl border border-border-app glass-panel"
            >
              <h3 className="text-xs font-bold text-text-main mb-2 uppercase tracking-wide">{faq.q}</h3>
              <p className="text-xs text-text-muted leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA Hero */}
      <section className="py-20 border-t border-border-app bg-gradient-to-b from-transparent to-surface-app/40" aria-label="Call to Action">
        <div className="mx-auto max-width px-6 text-center">
          <h2 className="text-2xl md:text-3xl font-extrabold text-primary-brand dark:text-text-dark mb-4">
            Ready to secure your next project?
          </h2>
          <p className="text-xs text-text-muted max-w-xl mx-auto mb-8">
            Join thousands of decentralized freelancers and teams locking in mutual trust with Stellar Soroban.
          </p>
          <button 
            onClick={handleCTA}
            className="px-8 py-4 bg-primary-brand text-text-dark font-bold rounded-lg shadow-lg hover:opacity-90 transform active:scale-98 transition-all flex items-center justify-center gap-2 mx-auto cursor-pointer min-h-[48px]"
            aria-label="Launch Free Sandbox Dashboard"
          >
            <span>Launch Free Sandbox</span>
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border-app py-12 bg-dark-bg text-text-dark transition-colors duration-300">
        <div className="mx-auto max-width px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-6 w-6 text-accent-brand" aria-hidden="true" />
            <span className="font-bold text-xs tracking-wider uppercase">AnchorBridge</span>
          </div>
          
          <div className="flex items-center gap-6 text-[10px] text-text-muted font-semibold uppercase tracking-wider">
            <a href="#features" className="hover:text-text-dark transition-colors">Features</a>
            <a href="#workflow" className="hover:text-text-dark transition-colors">Workflow</a>
            <a href="#faq" className="hover:text-text-dark transition-colors">FAQ</a>
            <span className="text-border-app" aria-hidden="true">|</span>
            <span className="normal-case font-normal text-text-muted/80">© 2026 AnchorBridge. Powered by Soroban.</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
