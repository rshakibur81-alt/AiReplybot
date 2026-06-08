'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, useAnimation, useInView } from 'framer-motion';
import { useRef } from 'react';
import {
  Brain,
  Bot,
  MessageSquare,
  Shield,
  Zap,
  Layers,
  ChevronRight,
  Star,
  Menu,
  X,
  Check,
  Play,
  MessageCircle,
  Clock,
  Smartphone,
  Globe,
  BarChart3,
  Sparkles,
} from 'lucide-react';

// ─── Animation Wrapper Component ───
function AnimateIn({
  children,
  delay = 0,
  direction = 'up',
  className = '',
}: {
  children: React.ReactNode;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  className?: string;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  const directionOffset = {
    up: { y: 60 },
    down: { y: -60 },
    left: { x: 60 },
    right: { x: -60 },
  };

  return (
    <motion.div
      ref={ref}
      initial={{
        opacity: 0,
        ...directionOffset[direction],
      }}
      animate={
        isInView
          ? { opacity: 1, x: 0, y: 0 }
          : {}
      }
      transition={{
        duration: 0.7,
        delay,
        ease: [0.25, 0.4, 0.25, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── Floating Particles Background ───
function ParticlesBackground() {
  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 4 + 1,
    duration: Math.random() * 10 + 10,
    delay: Math.random() * 5,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-purple-500/10"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

// ─── Navbar ───
function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '#features', label: 'Features' },
    { href: '#pricing', label: 'Pricing' },
    { href: '/login', label: 'Login' },
  ];

  return (
    <motion.header
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-background/80 backdrop-blur-xl border-b border-white/5'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="h-9 w-9 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-lg shadow-purple-500/20"
            >
              <Bot className="h-5 w-5 text-white" />
            </motion.div>
            <span className="text-xl font-bold tracking-tight">
              Reply<span className="text-gradient">Mind</span> AI
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/register"
              className="inline-flex items-center justify-center h-10 px-5 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 text-white text-sm font-semibold shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-105 transition-all duration-300"
            >
              Get Started Free
              <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-muted-foreground hover:text-foreground"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      <motion.div
        initial={false}
        animate={mobileOpen ? { height: 'auto', opacity: 1 } : { height: 0, opacity: 0 }}
        className="md:hidden overflow-hidden bg-background/95 backdrop-blur-xl border-b border-white/5"
      >
        <div className="px-4 py-4 space-y-3">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="block py-2 text-sm text-muted-foreground hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/register"
            onClick={() => setMobileOpen(false)}
            className="block text-center py-3 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 text-white text-sm font-semibold"
          >
            Get Started Free
          </Link>
        </div>
      </motion.div>
    </motion.header>
  );
}

// ─── Hero Section ───
function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-20">
      {/* Background Effects */}
      <ParticlesBackground />
      <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 via-transparent to-background" />

      {/* Gradient Orbs */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-purple-500/10 rounded-full blur-[128px]" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-blue-500/10 rounded-full blur-[128px]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-purple-500/20 bg-purple-500/10 text-sm text-purple-300 mb-6"
            >
              <Sparkles className="h-4 w-4" />
              <span>AI-Powered Messenger Automation</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1]"
            >
              Your Facebook Page{' '}
              <span className="text-gradient">Never Sleeps</span>
              <br />
              <span className="text-muted-foreground">AI Replies 24/7</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="mt-6 text-lg md:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 leading-relaxed"
            >
              Automate customer replies with human-like AI. Sell more, work less. 
              Connect your Facebook page and let ReplyMind handle your messages 
              intelligently.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="mt-8 flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start"
            >
              <Link
                href="/register"
                className="group inline-flex items-center justify-center h-12 px-8 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-105 transition-all duration-300"
              >
                Start Free Trial
                <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <button className="inline-flex items-center justify-center h-12 px-8 rounded-xl border border-white/10 bg-white/5 text-white font-medium hover:bg-white/10 transition-all duration-300">
                <Play className="mr-2 h-5 w-5" />
                Watch Demo
              </button>
            </motion.div>

            {/* Social Proof */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.5 }}
              className="mt-10 flex flex-wrap items-center gap-6 justify-center lg:justify-start"
            >
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full border-2 border-background bg-gradient-to-br from-purple-400 to-blue-400"
                  />
                ))}
              </div>
              <div className="text-sm text-muted-foreground">
                <span className="text-foreground font-semibold">2,000+</span> businesses trust us
              </div>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                ))}
                <span className="text-sm text-muted-foreground ml-1">4.9/5</span>
              </div>
            </motion.div>
          </div>

          {/* Right - Mockup */}
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative"
          >
            <div className="relative mx-auto max-w-md">
              {/* Glow behind mockup */}
              <div className="absolute -inset-10 bg-gradient-to-r from-purple-500/20 via-violet-500/20 to-blue-500/20 rounded-[2rem] blur-3xl" />

              {/* Chat Interface Mockup */}
              <div className="relative rounded-2xl border border-white/10 bg-card/80 backdrop-blur-sm overflow-hidden shadow-2xl glow">
                {/* Header */}
                <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5 bg-white/5">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/50" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                    <div className="w-3 h-3 rounded-full bg-green-500/50" />
                  </div>
                  <div className="flex-1 text-center">
                    <span className="text-xs text-muted-foreground font-medium">Facebook Messenger</span>
                  </div>
                  <Smartphone className="h-4 w-4 text-muted-foreground" />
                </div>

                {/* Chat Content */}
                <div className="p-4 space-y-4">
                  {/* Incoming Message */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 }}
                    className="flex gap-2 items-start"
                  >
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 flex-shrink-0" />
                    <div className="bg-white/10 rounded-2xl rounded-tl-sm px-4 py-2.5 max-w-[80%]">
                      <p className="text-sm text-foreground/90">
                        Hi! I'm interested in your products. Do you have any discounts available?
                      </p>
                      <span className="text-[10px] text-muted-foreground mt-1 block">12:30 PM</span>
                    </div>
                  </motion.div>

                  {/* AI Typing Indicator */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5 }}
                    className="flex gap-2 items-start"
                  >
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                      <Bot className="h-3.5 w-3.5 text-white" />
                    </div>
                    <div className="bg-purple-500/20 rounded-2xl rounded-tl-sm px-4 py-3 max-w-[80%]">
                      <div className="flex gap-1.5">
                        <motion.div
                          animate={{ y: [0, -5, 0] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                          className="w-2 h-2 rounded-full bg-purple-400"
                        />
                        <motion.div
                          animate={{ y: [0, -5, 0] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                          className="w-2 h-2 rounded-full bg-purple-400"
                        />
                        <motion.div
                          animate={{ y: [0, -5, 0] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                          className="w-2 h-2 rounded-full bg-purple-400"
                        />
                      </div>
                    </div>
                  </motion.div>

                  {/* Auto Reply */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 2.2 }}
                    className="flex gap-2 items-start"
                  >
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                      <Bot className="h-3.5 w-3.5 text-white" />
                    </div>
                    <div className="bg-purple-500/20 rounded-2xl rounded-tl-sm px-4 py-2.5 max-w-[80%] border border-purple-500/20">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Sparkles className="h-3 w-3 text-purple-400" />
                        <span className="text-[10px] text-purple-400 font-medium">AI Reply</span>
                      </div>
                      <p className="text-sm text-foreground/90">
                        Hi there! 👋 Yes, we're running a special promotion — 
                        get 20% off your first order with code 
                        <span className="text-purple-400 font-semibold"> WELCOME20</span>! 
                        What are you looking for? 😊
                      </p>
                      <span className="text-[10px] text-muted-foreground mt-1 block flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Auto-replied • Just now
                      </span>
                    </div>
                  </motion.div>

                  {/* AI Badge */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2.8 }}
                    className="flex items-center justify-center gap-2 pt-1"
                  >
                    <div className="h-px flex-1 bg-white/5" />
                    <span className="text-[10px] text-purple-400/60 flex items-center gap-1">
                      <Brain className="h-3 w-3" />
                      Powered by Google Gemini AI
                    </span>
                    <div className="h-px flex-1 bg-white/5" />
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ─── Features Section ───
const features = [
  {
    icon: Brain,
    title: 'Human-like AI Replies',
    description:
      'Google Gemini AI generates natural, context-aware responses that sound just like you. Your customers won\'t know they\'re talking to AI.',
    gradient: 'from-purple-500 to-violet-500',
  },
  {
    icon: MessageSquare,
    title: 'Product Catalog Management',
    description:
      'Automatically share product details, prices, and availability. Let AI handle product inquiries with your catalog data.',
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    icon: Zap,
    title: '24/7 Auto-Reply',
    description:
      'Never miss a message again. ReplyMind works around the clock, responding to customer queries instantly at any hour.',
    gradient: 'from-amber-500 to-orange-500',
  },
  {
    icon: BarChart3,
    title: 'Real-time Message Logs',
    description:
      'Monitor all conversations in real-time with a beautiful dashboard. Review AI replies, customer messages, and analytics.',
    gradient: 'from-emerald-500 to-green-500',
  },
  {
    icon: Globe,
    title: 'Custom AI Instructions',
    description:
      'Train the AI with your brand voice, custom responses, and business rules. Tailor replies to match your unique style.',
    gradient: 'from-pink-500 to-rose-500',
  },
  {
    icon: Layers,
    title: 'Multi-page Support',
    description:
      'Connect and manage multiple Facebook pages from a single dashboard. Perfect for agencies and businesses with multiple brands.',
    gradient: 'from-indigo-500 to-purple-500',
  },
];

function FeaturesSection() {
  return (
    <section id="features" className="relative py-24 md:py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-500/3 to-transparent" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimateIn className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-purple-500/20 bg-purple-500/10 text-sm text-purple-300 mb-4">
            <Sparkles className="h-4 w-4" />
            <span>Powerful Features</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold">
            Everything You Need to{' '}
            <span className="text-gradient">Automate</span> Messaging
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Powerful tools to help you manage, automate, and optimize your Facebook 
            Messenger customer interactions.
          </p>
        </AnimateIn>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <AnimateIn key={feature.title} delay={index * 0.1}>
              <motion.div
                whileHover={{ y: -5, scale: 1.02 }}
                className="group relative rounded-2xl border border-white/5 bg-card/50 backdrop-blur-sm p-6 hover:border-white/10 transition-all duration-300"
              >
                {/* Gradient glow on hover */}
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 blur-xl transition-opacity duration-500`} />

                <div className={`relative w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} p-2.5 flex items-center justify-center mb-4 shadow-lg`}>
                  <feature.icon className="h-6 w-6 text-white" />
                </div>

                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            </AnimateIn>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Pricing Section ───
const plans = [
  {
    name: 'Free',
    price: '৳0',
    period: '/month',
    description: 'Perfect for getting started',
    replies: '500',
    pages: '1',
    support: 'Community support',
    features: [
      '500 AI replies per month',
      '1 Facebook page',
      'Keyword triggers',
      'Basic analytics',
      'Community support',
    ],
    cta: 'Get Started',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '৳999',
    period: '/month',
    description: 'Best for growing businesses',
    replies: '5,000',
    pages: '3',
    support: 'Priority support',
    popular: true,
    features: [
      '5,000 AI replies per month',
      '3 Facebook pages',
      'Advanced keyword + AI triggers',
      'Real-time analytics dashboard',
      'Custom AI instructions',
      'Priority email support',
      'Product catalog integration',
    ],
    cta: 'Start Free Trial',
    highlighted: true,
  },
  {
    name: 'Premium',
    price: '৳2,499',
    period: '/month',
    description: 'For high-volume businesses',
    replies: 'Unlimited',
    pages: '10',
    support: 'Dedicated support',
    features: [
      'Unlimited AI replies',
      'Up to 10 Facebook pages',
      'All Pro features',
      'Advanced regex triggers',
      'API access',
      'Dedicated account manager',
      'Custom integrations',
      'SLA guarantee',
    ],
    cta: 'Contact Sales',
    highlighted: false,
  },
];

function PricingSection() {
  return (
    <section id="pricing" className="relative py-24 md:py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-500/3 to-transparent" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[100px]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimateIn className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-purple-500/20 bg-purple-500/10 text-sm text-purple-300 mb-4">
            <Star className="h-4 w-4" />
            <span>Simple Pricing</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold">
            Choose the{' '}
            <span className="text-gradient">Perfect Plan</span> for You
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Start free and upgrade as you grow. No hidden fees, no surprises.
          </p>
        </AnimateIn>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <AnimateIn key={plan.name} delay={index * 0.15}>
              <motion.div
                whileHover={{ y: -8 }}
                className={`relative rounded-2xl border p-8 transition-all duration-300 ${
                  plan.highlighted
                    ? 'border-purple-500/50 bg-purple-500/5 shadow-xl shadow-purple-500/10'
                    : 'border-white/5 bg-card/50'
                }`}
              >
                {/* Popular badge */}
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <div className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 text-xs font-semibold text-white shadow-lg">
                      <Sparkles className="h-3 w-3" />
                      Most Popular
                    </div>
                  </div>
                )}

                {/* Plan Header */}
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>
                  <div className="flex items-baseline justify-center gap-0.5">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-sm text-muted-foreground">{plan.period}</span>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-6 p-4 rounded-xl bg-white/5">
                  <div className="text-center">
                    <div className="text-lg font-bold text-purple-400">{plan.replies}</div>
                    <div className="text-xs text-muted-foreground">Replies/mo</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-400">{plan.pages}</div>
                    <div className="text-xs text-muted-foreground">Pages</div>
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm">
                      <Check className={`h-4 w-4 mt-0.5 flex-shrink-0 ${
                        plan.highlighted ? 'text-purple-400' : 'text-green-400'
                      }`} />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Link
                  href="/register"
                  className={`block text-center py-3 rounded-xl font-semibold transition-all duration-300 ${
                    plan.highlighted
                      ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-105'
                      : 'border border-white/10 text-white hover:bg-white/5'
                  }`}
                >
                  {plan.cta}
                </Link>
              </motion.div>
            </AnimateIn>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Footer ───
function Footer() {
  const footerLinks = [
    { href: '#features', label: 'Features' },
    { href: '#pricing', label: 'Pricing' },
    { href: '/login', label: 'Login' },
    { href: '/register', label: 'Sign Up' },
    { href: '#', label: 'Privacy Policy' },
    { href: '#', label: 'Terms of Service' },
  ];

  return (
    <footer className="relative border-t border-white/5 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-bold">
                Reply<span className="text-gradient">Mind</span> AI
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              AI-powered Facebook Messenger automation. Never miss a customer message again.
            </p>
          </div>

          {/* Links */}
          <div className="md:col-span-2">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
              {['Product', 'Company', 'Legal'].map((category) => (
                <div key={category}>
                  <h4 className="text-sm font-semibold mb-4">{category}</h4>
                  <ul className="space-y-2.5">
                    {footerLinks
                      .filter((_, i) => {
                        if (category === 'Product') return i < 2;
                        if (category === 'Company') return i >= 2 && i < 4;
                        return i >= 4;
                      })
                      .map((link) => (
                        <li key={link.label}>
                          <Link
                            href={link.href}
                            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                          >
                            {link.label}
                          </Link>
                        </li>
                      ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} ReplyMind AI. All rights reserved.
          </p>
          <p className="text-sm text-muted-foreground flex items-center gap-1.5">
            Powered by{' '}
            <span className="inline-flex items-center gap-1 text-purple-400">
              <Brain className="h-3.5 w-3.5" />
              Google Gemini AI
            </span>
            {' & '}
            <MessageCircle className="h-3.5 w-3.5 text-blue-400" />
            Facebook Messenger API
          </p>
        </div>
      </div>
    </footer>
  );
}

// ─── Main Page ───
export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <PricingSection />
      <Footer />
    </div>
  );
}