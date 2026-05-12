'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import {
  MapPin,
  ThumbsUp,
  Bell,
  Shield,
  ArrowRight,
  CheckCircle2,
  Users,
  BarChart3,
  Zap,
  Map,
  Star,
  ChevronDown,
} from 'lucide-react';
import { PublicShell } from '@/components/layout/AppShell';
import { ROUTES } from '@/lib/constants';
import { cn } from '@/lib/utils';

// ─── Animation Variants ───────────────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
};

// ─── Section Wrapper ──────────────────────────────────────────────────────────

function AnimatedSection({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      variants={stagger}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── Hero Section ─────────────────────────────────────────────────────────────

function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-900">
      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          className="absolute -top-40 -left-40 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ scale: [1.2, 1, 1.2], rotate: [90, 0, 90] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
          className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ x: [0, 50, 0], y: [0, -30, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl"
        />
      </div>

      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '50px 50px',
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-24 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-sm font-medium mb-8"
        >
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          🚀 Now live — Join the civic revolution
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-tight mb-6"
        >
          Your Voice,{' '}
          <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
            Real Action.
          </span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.5 }}
          className="text-xl text-blue-100/80 max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Report local civic issues, vote on what matters most, and watch
          authorities take action — all in one powerful platform.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
        >
          <Link
            href={ROUTES.REGISTER}
            className="group inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-4 rounded-2xl text-lg shadow-xl shadow-blue-500/30 transition-all duration-200 hover:shadow-blue-500/50 hover:-translate-y-0.5"
          >
            Get Started Free
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href={ROUTES.ISSUES}
            className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-bold px-8 py-4 rounded-2xl text-lg border border-white/20 transition-all duration-200 hover:-translate-y-0.5"
          >
            <Map className="w-5 h-5" />
            View Live Issues
          </Link>
        </motion.div>

        {/* Stats strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65 }}
          className="inline-flex flex-wrap justify-center gap-8 px-8 py-4 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10"
        >
          {[
            { value: '10K+', label: 'Issues Reported' },
            { value: '50K+', label: 'Votes Cast'      },
            { value: '85%',  label: 'Resolution Rate' },
            { value: '200+', label: 'Cities Active'   },
          ].map(({ value, label }) => (
            <div key={label} className="text-center">
              <p className="text-2xl font-black text-white">{value}</p>
              <p className="text-xs text-blue-300">{label}</p>
            </div>
          ))}
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/40"
        >
          <ChevronDown className="w-6 h-6" />
        </motion.div>
      </div>
    </section>
  );
}

// ─── Features Section ─────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: MapPin,
    title: 'Smart Location Detection',
    description:
      'Auto-detect your GPS location. Address fills instantly using OpenStreetMap reverse geocoding.',
    color: 'from-blue-500 to-blue-600',
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    iconColor: 'text-blue-600',
  },
  {
    icon: ThumbsUp,
    title: 'Community Voting',
    description:
      'Vote on issues that matter. Priority scores update in real-time, surfacing the most critical problems.',
    color: 'from-purple-500 to-purple-600',
    bg: 'bg-purple-50 dark:bg-purple-900/20',
    iconColor: 'text-purple-600',
  },
  {
    icon: Bell,
    title: 'Real-time Notifications',
    description:
      'Get instant alerts when someone votes your issue, when status changes, or when it gets resolved.',
    color: 'from-orange-500 to-orange-600',
    bg: 'bg-orange-50 dark:bg-orange-900/20',
    iconColor: 'text-orange-600',
  },
  {
    icon: Map,
    title: 'Interactive Civic Map',
    description:
      'See all issues plotted on a live map. Color-coded markers show status at a glance.',
    color: 'from-green-500 to-green-600',
    bg: 'bg-green-50 dark:bg-green-900/20',
    iconColor: 'text-green-600',
  },
  {
    icon: Zap,
    title: 'AI Priority Engine',
    description:
      'Our algorithm calculates priority using votes, urgency, area density, and resolution time.',
    color: 'from-yellow-500 to-yellow-600',
    bg: 'bg-yellow-50 dark:bg-yellow-900/20',
    iconColor: 'text-yellow-600',
  },
  {
    icon: Shield,
    title: 'Duplicate Detection',
    description:
      'Before submitting, we check for similar issues nearby. Vote on existing ones instead of duplicating.',
    color: 'from-teal-500 to-teal-600',
    bg: 'bg-teal-50 dark:bg-teal-900/20',
    iconColor: 'text-teal-600',
  },
];

function FeaturesSection() {
  return (
    <section className="py-24 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4">
        <AnimatedSection className="text-center mb-16">
          <motion.p
            variants={fadeUp}
            className="text-blue-600 font-semibold text-sm uppercase tracking-wider mb-3"
          >
            Powerful Features
          </motion.p>
          <motion.h2
            variants={fadeUp}
            className="text-4xl font-black text-gray-900 dark:text-white mb-4"
          >
            Everything you need to drive change
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto"
          >
            Built for citizens who want action, not just awareness.
          </motion.p>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <AnimatedSection key={feature.title}>
                <motion.div
                  variants={fadeUp}
                  whileHover={{ y: -4, transition: { duration: 0.15 } }}
                  className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-700 shadow-card hover:shadow-soft transition-all"
                >
                  <div
                    className={cn(
                      'w-12 h-12 rounded-2xl flex items-center justify-center mb-4',
                      feature.bg
                    )}
                  >
                    <Icon className={cn('w-6 h-6', feature.iconColor)} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              </AnimatedSection>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─── How It Works Section ─────────────────────────────────────────────────────

const STEPS = [
  {
    step: '01',
    title: 'Report an Issue',
    description:
      'Snap a photo, detect your location automatically, select category and describe the problem.',
    icon: MapPin,
    color: 'bg-blue-600',
  },
  {
    step: '02',
    title: 'Community Votes',
    description:
      'Citizens vote on issues they care about. Higher votes = higher priority score for authorities.',
    icon: ThumbsUp,
    color: 'bg-purple-600',
  },
  {
    step: '03',
    title: 'Authorities Respond',
    description:
      'Admin reviews top-priority issues, assigns teams, and updates status in real-time.',
    icon: Shield,
    color: 'bg-green-600',
  },
  {
    step: '04',
    title: 'Issue Resolved',
    description:
      'You get notified when the issue is resolved. Earn reputation points for your contribution.',
    icon: CheckCircle2,
    color: 'bg-orange-500',
  },
];

function HowItWorksSection() {
  return (
    <section className="py-24 bg-white dark:bg-gray-950">
      <div className="max-w-6xl mx-auto px-4">
        <AnimatedSection className="text-center mb-16">
          <motion.p
            variants={fadeUp}
            className="text-blue-600 font-semibold text-sm uppercase tracking-wider mb-3"
          >
            How It Works
          </motion.p>
          <motion.h2
            variants={fadeUp}
            className="text-4xl font-black text-gray-900 dark:text-white mb-4"
          >
            From report to resolution in 4 steps
          </motion.h2>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            return (
              <AnimatedSection key={step.step}>
                <motion.div
                  variants={fadeUp}
                  className="relative text-center"
                >
                  {/* Connector line */}
                  {idx < STEPS.length - 1 && (
                    <div className="hidden lg:block absolute top-8 left-[60%] w-full h-px bg-gradient-to-r from-gray-200 to-transparent dark:from-gray-700 z-0" />
                  )}

                  <div className="relative z-10">
                    <div
                      className={cn(
                        'w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg',
                        step.color
                      )}
                    >
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-xs font-black text-gray-300 dark:text-gray-600 mb-2 tracking-widest">
                      STEP {step.step}
                    </div>
                    <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">
                      {step.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </motion.div>
              </AnimatedSection>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─── Social Proof Section ─────────────────────────────────────────────────────

const TESTIMONIALS = [
  {
    name: 'Sarah Chen',
    role: 'Community Organizer',
    avatar: 'SC',
    content:
      'Voice2Action helped us get 3 broken streetlights fixed in just 2 weeks. The voting system really gets authorities to prioritize!',
    rating: 5,
  },
  {
    name: 'Marcus Johnson',
    role: 'Local Resident',
    avatar: 'MJ',
    content:
      'I reported a massive pothole that had been ignored for months. After 47 votes, the city fixed it in a week. This platform works!',
    rating: 5,
  },
  {
    name: 'Priya Sharma',
    role: 'City Councilor',
    avatar: 'PS',
    content:
      'As an admin, the analytics dashboard helps us understand which areas need the most attention. Data-driven governance!',
    rating: 5,
  },
];

function TestimonialsSection() {
  return (
    <section className="py-24 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30">
      <div className="max-w-6xl mx-auto px-4">
        <AnimatedSection className="text-center mb-16">
          <motion.p
            variants={fadeUp}
            className="text-blue-600 font-semibold text-sm uppercase tracking-wider mb-3"
          >
            Community Stories
          </motion.p>
          <motion.h2
            variants={fadeUp}
            className="text-4xl font-black text-gray-900 dark:text-white"
          >
            Citizens making a difference
          </motion.h2>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, idx) => (
            <AnimatedSection key={t.name}>
              <motion.div
                variants={fadeUp}
                whileHover={{ y: -4 }}
                className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-700 shadow-card"
              >
                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 text-yellow-400 fill-yellow-400"
                    />
                  ))}
                </div>

                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-5">
                  &ldquo;{t.content}&rdquo;
                </p>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {t.name}
                    </p>
                    <p className="text-xs text-gray-400">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── CTA Section ──────────────────────────────────────────────────────────────

function CTASection() {
  return (
    <section className="py-24 bg-gradient-to-r from-blue-600 to-indigo-700 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -translate-x-32 -translate-y-32 blur-3xl" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/10 rounded-full translate-x-32 translate-y-32 blur-3xl" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-4 text-center">
        <AnimatedSection>
          <motion.div
            variants={fadeUp}
            className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6"
          >
            <Zap className="w-8 h-8 text-white" />
          </motion.div>

          <motion.h2
            variants={fadeUp}
            className="text-4xl font-black text-white mb-4"
          >
            Ready to make your city better?
          </motion.h2>

          <motion.p
            variants={fadeUp}
            className="text-blue-100 text-lg mb-8"
          >
            Join thousands of citizens already using Voice2Action to drive
            real change in their communities.
          </motion.p>

          <motion.div
            variants={fadeUp}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              href={ROUTES.REGISTER}
              className="group inline-flex items-center gap-2 bg-white hover:bg-blue-50 text-blue-700 font-bold px-8 py-4 rounded-2xl text-lg shadow-xl transition-all duration-200 hover:-translate-y-0.5"
            >
              Start Reporting Now
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href={ROUTES.MAP}
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-bold px-8 py-4 rounded-2xl text-lg border border-white/30 transition-all duration-200"
            >
              <Map className="w-5 h-5" />
              Explore Map
            </Link>
          </motion.div>
        </AnimatedSection>
      </div>
    </section>
  );
}

// ─── Landing Page ─────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <PublicShell>
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <CTASection />
    </PublicShell>
  );
}