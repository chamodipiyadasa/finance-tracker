'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { motion } from 'framer-motion';
import { Wallet, Shield, BarChart3 } from 'lucide-react';
import Image from 'next/image';

export default function HomePage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary-300 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-950 via-dark-900 to-dark-950">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-dark-950/80 backdrop-blur-xl" style={{ borderBottom: '1px solid rgba(233, 223, 158, 0.15)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <Image src="/logo.png" alt="Piggy Bank!" width={40} height={40} className="w-10 h-10" />
              <span className="text-2xl" style={{ fontFamily: "'Titan One', cursive", color: '#e9df9e' }}>Piggy Bank!</span>
            </div>
            <button
              onClick={() => router.push('/login')}
              className="btn-primary"
            >
              Sign In
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              <span style={{ color: '#e9df9e' }}>Take Control of Your</span>
              <br />
              <span style={{ background: 'linear-gradient(135deg, #f9cdd5 0%, #e9df9e 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Financial Future</span>
            </h1>
            <p className="text-lg md:text-xl text-base-400 max-w-2xl mx-auto mb-8">
              A premium financial tracking experience designed to help you save more,
              spend smarter, and achieve your financial goals.
            </p>
            <button
              onClick={() => router.push('/login')}
              className="btn-primary text-lg px-8 py-4"
            >
              Get Started
            </button>
          </motion.div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            {[
              {
                icon: Wallet,
                title: 'Smart Expense Tracking',
                description: 'Categorize and track every expense with intelligent insights and beautiful visualizations.',
                color: 'from-primary-300 to-primary-400',
              },
              {
                icon: BarChart3,
                title: 'Visual Analytics',
                description: 'Trading-style charts and dashboards that make understanding your finances intuitive.',
                color: 'from-accent-400 to-accent-500',
              },
              {
                icon: Shield,
                title: 'Budget Protection',
                description: 'Set budgets and receive alerts to keep your spending on track.',
                color: 'from-base-300 to-base-400',
              },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="glass-card-hover p-8"
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6`}>
                  <feature.icon className="w-7 h-7 text-dark-900" />
                </div>
                <h3 className="text-xl font-semibold text-base-200 mb-3">{feature.title}</h3>
                <p className="text-base-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>

          {/* Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="glass-card p-8 rounded-3xl overflow-hidden"
          >
            <div className="aspect-video bg-gradient-to-br from-dark-800 to-dark-900 rounded-2xl flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 rounded-full bg-primary-300/20 flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="w-10 h-10 text-primary-300" />
                </div>
                <p className="text-base-400">Premium Dashboard Experience</p>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-primary-300/20 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-base-400">
          <p>&copy; 2024 Piggy Bank! Built with ❤️ for better financial health.</p>
        </div>
      </footer>
    </div>
  );
}
