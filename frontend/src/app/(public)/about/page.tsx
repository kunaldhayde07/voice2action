'use client';

import { motion } from 'framer-motion';
import {
  Target,
  Heart,
  Globe,
  Users,
  Zap,
  Shield,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';
import { PublicShell } from '@/components/layout/AppShell';
import { ROUTES } from '@/lib/constants';

const TEAM = [
  { name: 'Alex Rivera',  role: 'Founder & CEO',         avatar: 'AR', bg: 'from-blue-500 to-blue-700'   },
  { name: 'Maya Patel',   role: 'CTO',                   avatar: 'MP', bg: 'from-purple-500 to-purple-700'},
  { name: 'James Liu',    role: 'Head of Design',        avatar: 'JL', bg: 'from-pink-500 to-pink-700'   },
  { name: 'Sara Ahmed',   role: 'Community Lead',        avatar: 'SA', bg: 'from-green-500 to-green-700' },
];

const VALUES = [
  {
    icon: Heart,
    title: 'Community First',
    description: 'Every feature is built with citizens and their needs at the center.',
    color: 'text-red-500',
    bg: 'bg-red-50 dark:bg-red-900/20',
  },
  {
    icon: Shield,
    title: 'Transparency',
    description: 'Open resolution tracking so citizens know their voices are heard.',
    color: 'text-blue-500',
    bg: 'bg-blue-50 dark:bg-blue-900/20',
  },
  {
    icon: Zap,
    title: 'Real Impact',
    description: 'We measure success by issues resolved, not just issues reported.',
    color: 'text-yellow-500',
    bg: 'bg-yellow-50 dark:bg-yellow-900/20',
  },
  {
    icon: Globe,
    title: 'Open Access',
    description: 'Free for all citizens. Democracy should never have a paywall.',
    color: 'text-green-500',
    bg: 'bg-green-50 dark:bg-green-900/20',
  },
];

export default function AboutPage() {
  return (
    <PublicShell>
      {/* Hero */}
      <section className="py-24 bg-gradient-to-br from-blue-600 to-indigo-700 text-white text-center">
        <div className="max-w-3xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-2xl mb-6">
              <Target className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-5xl font-black mb-4">About Voice2Action</h1>
            <p className="text-xl text-blue-100 leading-relaxed">
              We believe every citizen deserves a direct line to change in their
              community. Voice2Action bridges the gap between people and the
              authorities who serve them.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20 bg-white dark:bg-gray-950">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <p className="text-blue-600 font-semibold text-sm uppercase tracking-wider mb-3">
                Our Mission
              </p>
              <h2 className="text-4xl font-black text-gray-900 dark:text-white mb-5">
                Empowering citizens through technology
              </h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                Voice2Action was born out of frustration — the frustration of
                reporting a pothole for the third time and seeing nothing happen.
                We built a platform that makes civic engagement effortless and
                ensures that reports don&apos;t just disappear into a void.
              </p>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                By combining real-time data, democratic voting, and intelligent
                prioritization, we ensure the most critical issues get the
                attention they deserve.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-2 gap-4"
            >
              {[
                { value: '50K+', label: 'Issues Reported',  color: 'from-blue-500 to-blue-600'   },
                { value: '85%',  label: 'Resolution Rate',  color: 'from-green-500 to-green-600' },
                { value: '200+', label: 'Cities Active',    color: 'from-purple-500 to-purple-600'},
                { value: '2M+',  label: 'Citizens Helped',  color: 'from-orange-500 to-orange-600'},
              ].map(({ value, label, color }) => (
                <div
                  key={label}
                  className={`bg-gradient-to-br ${color} rounded-3xl p-6 text-white text-center`}
                >
                  <p className="text-3xl font-black mb-1">{value}</p>
                  <p className="text-sm opacity-80">{label}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black text-gray-900 dark:text-white mb-4">
              Our Values
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {VALUES.map((value, idx) => {
              const Icon = value.icon;
              return (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 text-center"
                >
                  <div className={`w-12 h-12 ${value.bg} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                    <Icon className={`w-6 h-6 ${value.color}`} />
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                    {value.title}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                    {value.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 bg-white dark:bg-gray-950">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black text-gray-900 dark:text-white mb-4">
              The Team
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              Passionate about civic tech and community impact
            </p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {TEAM.map((member, idx) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6 text-center border border-gray-100 dark:border-gray-700"
              >
                <div
                  className={`w-16 h-16 bg-gradient-to-br ${member.bg} rounded-2xl flex items-center justify-center mx-auto mb-4 text-white text-xl font-black shadow-lg`}
                >
                  {member.avatar}
                </div>
                <p className="font-bold text-gray-900 dark:text-white text-sm">
                  {member.name}
                </p>
                <p className="text-xs text-gray-400 mt-1">{member.role}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-blue-600 text-center">
        <div className="max-w-xl mx-auto px-4">
          <h2 className="text-3xl font-black text-white mb-4">
            Join the movement
          </h2>
          <p className="text-blue-100 mb-6">
            Together we can make every community a better place to live.
          </p>
          <Link
            href={ROUTES.REGISTER}
            className="inline-flex items-center gap-2 bg-white hover:bg-blue-50 text-blue-700 font-bold px-8 py-4 rounded-2xl transition-colors"
          >
            Get Started <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </PublicShell>
  );
}