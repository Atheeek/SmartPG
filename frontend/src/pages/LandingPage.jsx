import React, { useState, useEffect } from 'react';
import {
  Building2, Users, DollarSign, Calendar, BarChart3, FileText, CheckCircle2, ArrowRight,
  Shield, Zap, Lock, TrendingUp, Clock, Database, Smartphone, Menu, X
} from 'lucide-react';

function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [menuItemsVisible, setMenuItemsVisible] = useState(false);

    useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      // Stagger the animation of menu items
      const timer = setTimeout(() => setMenuItemsVisible(true), 150);
      return () => clearTimeout(timer);
    } else {
      document.body.style.overflow = '';
      setMenuItemsVisible(false);
    }
  }, [mobileMenuOpen]);

 
  const handleNavClick = (e, target) => {
    e.preventDefault();
    const element = document.getElementById(target);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  
    const menuSections = ['features', 'benefits', 'pricing'];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      {/* --- START: IMPROVED NAVIGATION --- */}
<nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
  <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
    <div className="flex items-center gap-2">
      <Building2 className="w-8 h-8 text-blue-600" />
      <span className="text-2xl font-bold text-gray-900">PropManager</span>
    </div>

    {/* Desktop Menu */}
    <div className="hidden md:flex items-center gap-8">
      {['features', 'benefits', 'pricing'].map((section) => (
        <a
          key={section}
          href={`#${section}`}
          onClick={(e) => handleNavClick(e, section)}
          className="text-gray-600 hover:text-gray-900 transition-colors font-semibold"
        >
          {section.charAt(0).toUpperCase() + section.slice(1)}
        </a>
      ))}
      <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-md">
        Get Started
      </button>
    </div>

    {/* Mobile Hamburger Button */}
    <button
      onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
      className="md:hidden p-2 rounded-md text-gray-700 hover:text-blue-600 focus:outline-none"
      aria-label="Toggle menu"
    >
      {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
    </button>
  </div>

  {/* --- Enhanced Mobile Dropdown Menu --- */}
  <div
    className={`
      md:hidden absolute top-full left-0 w-full bg-white shadow-lg overflow-hidden transition-all duration-300 ease-in-out
      ${mobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}
    `}
  >
    <div className="flex flex-col px-6 py-4 space-y-4">
      {['features', 'benefits', 'pricing'].map((section) => (
        <a
          key={section}
          href={`#${section}`}
          onClick={(e) => handleNavClick(e, section)}
          className="text-gray-700 hover:text-blue-600 transition-colors text-lg font-medium"
        >
          {section.charAt(0).toUpperCase() + section.slice(1)}
        </a>
      ))}
      <button className="mt-2 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium w-full">
        Get Started
      </button>
    </div>
  </div>
</nav>
{/* --- END: IMPROVED NAVIGATION --- */}


      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-sm font-medium mb-6">
              <Zap className="w-4 h-4" />
              <span>Complete Property Management Solution</span>
            </div>
            <h1 className="text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Manage Properties,<br />Tenants & Finances<br />
              <span className="text-blue-600">All in One Place</span>
            </h1>
            <p className="text-xl text-gray-600 mb-10 leading-relaxed">
              A powerful, commercial-grade SaaS platform designed for property owners.
              Automate rent collection, track expenses, and gain insights with real-time analytics.
            </p>
            <div className="flex items-center justify-center gap-4">
             <div className="flex flex-wrap justify-center gap-4 mt-6">
   <button className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-semibold text-base sm:text-lg shadow-md hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2">
    Start Free Trial
    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
  </button>


  <button className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-white text-gray-900 rounded-lg hover:bg-gray-50 transition-all font-semibold text-base sm:text-lg border-2 border-gray-200 shadow-sm hover:shadow-md">
    Watch Demo
  </button>
</div>


            </div>
          </div>


          {/* Hero Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-20">
            {[
              { icon: Building2, label: 'Properties', value: '10,000+' },
              { icon: Users, label: 'Active Tenants', value: '50,000+' },
              { icon: DollarSign, label: 'Processed', value: '$100M+' },
              { icon: Clock, label: 'Time Saved', value: '95%' }
            ].map((stat, idx) => (
              <div key={idx} className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-2xl border border-gray-100 hover:shadow-lg transition-all">
                <stat.icon className="w-8 h-8 text-blue-600 mb-3" />
                <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* Core Features */}
      <section id="features" className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-gray-900 mb-4">Powerful Features</h2>
            <p className="text-xl text-gray-600">Everything you need to manage your properties efficiently</p>
          </div>


          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: 'Secure Authentication',
                description: 'Enterprise-grade security with encrypted owner authentication and role-based access control.'
              },
              {
                icon: Clock,
                title: 'Automated Dues Generation',
                description: 'Smart cron jobs automatically generate anniversary-based dues. Set it once, forget it forever.'
              },
              {
                icon: Database,
                title: 'Global State Management',
                description: 'Real-time synchronization across all pages. Changes reflect instantly everywhere.'
              },
              {
                icon: Building2,
                title: 'Complete Property CRUD',
                description: 'Manage properties, rooms, beds, and expenses with intuitive interfaces and bulk operations.'
              },
              {
                icon: Zap,
                title: 'Bulk Add Wizard',
                description: 'Set up entire properties in minutes with our intelligent bulk-add workflow.'
              },
              {
                icon: Users,
                title: 'Tenant Lifecycle Management',
                description: 'Handle everything: onboarding with back-filled dues, transfers, edits, and vacations.'
              },
              {
                icon: BarChart3,
                title: 'Historical Analytics Dashboard',
                description: 'Powerful insights into financial performance and tenant activity across any time period.'
              },
              {
                icon: DollarSign,
                title: 'Financial Ledger',
                description: 'Complete payment tracking with mark-as-paid functionality and monthly statements.'
              },
              {
                icon: FileText,
                title: 'Expense Management',
                description: 'Log, categorize, and track all business expenses with detailed reporting.'
              },
              {
                icon: TrendingUp,
                title: 'Advanced Filtering',
                description: 'Global filters for properties and time periods. Find exactly what you need, instantly.'
              },
              {
                icon: Smartphone,
                title: 'Fully Responsive',
                description: 'Beautiful, professional UI that works flawlessly on desktop, tablet, and mobile.'
              },
              {
                icon: CheckCircle2,
                title: 'Production Ready',
                description: 'Battle-tested, stable platform ready for commercial use from day one.'
              }
            ].map((feature, idx) => (
              <div key={idx} className="bg-white p-8 rounded-2xl border border-gray-100 hover:shadow-xl transition-all duration-300 group hover:-translate-y-1">
                <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
                  <feature.icon className="w-7 h-7 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* Screenshot Showcase */}
      <section className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-gray-900 mb-4">See It In Action</h2>
            <p className="text-xl text-gray-600">Beautiful, intuitive interfaces designed for efficiency</p>
          </div>


          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            {/* Dashboard Screenshot */}
            <div className="group">
              <div className="relative overflow-hidden rounded-2xl shadow-2xl mb-4 transform transition-all duration-500 hover:scale-105 hover:shadow-3xl" style={{ perspective: '1000px' }}>
                <div className="aspect-[4/3] bg-gradient-to-br from-blue-500 via-blue-600 to-cyan-500 p-6 relative" style={{ transform: 'rotateX(2deg) rotateY(-2deg)' }}>
                  <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-3 h-3 rounded-full bg-red-400"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                      <div className="w-3 h-3 rounded-full bg-green-400"></div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <div className="flex-1 h-16 bg-white/20 backdrop-blur-md rounded-lg"></div>
                        <div className="flex-1 h-16 bg-white/20 backdrop-blur-md rounded-lg"></div>
                        <div className="flex-1 h-16 bg-white/20 backdrop-blur-md rounded-lg"></div>
                      </div>
                      <div className="h-32 bg-white/20 backdrop-blur-md rounded-lg flex items-end p-3 gap-1">
                        {[40, 60, 45, 70, 55, 80, 65].map((height, i) => (
                          <div key={i} className="flex-1 bg-white/40 rounded-t" style={{ height: `${height}%` }}></div>
                        ))}
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="h-12 bg-white/20 backdrop-blur-md rounded-lg"></div>
                        <div className="h-12 bg-white/20 backdrop-blur-md rounded-lg"></div>
                      </div>
                    </div>
                  </div>
                  <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Analytics Dashboard</h3>
              <p className="text-gray-600">Real-time insights and historical data</p>
            </div>


            {/* Properties Screenshot */}
            <div className="group">
              <div className="relative overflow-hidden rounded-2xl shadow-2xl mb-4 transform transition-all duration-500 hover:scale-105 hover:shadow-3xl" style={{ perspective: '1000px' }}>
                <div className="aspect-[4/3] bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-500 p-6 relative" style={{ transform: 'rotateX(2deg)' }}>
                  <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-3 h-3 rounded-full bg-red-400"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                      <div className="w-3 h-3 rounded-full bg-green-400"></div>
                    </div>
                    <div className="space-y-3">
                      <div className="h-10 bg-white/20 backdrop-blur-md rounded-lg"></div>
                      <div className="grid grid-cols-3 gap-2">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                          <div key={i} className="aspect-square bg-white/20 backdrop-blur-md rounded-lg p-2">
                            <div className="w-full h-3 bg-white/30 rounded mb-1"></div>
                            <div className="w-2/3 h-2 bg-white/20 rounded"></div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="absolute -top-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Property Management</h3>
              <p className="text-gray-600">Visual floor plans and room hierarchy</p>
            </div>


            {/* Tenants Screenshot */}
            <div className="group">
              <div className="relative overflow-hidden rounded-2xl shadow-2xl mb-4 transform transition-all duration-500 hover:scale-105 hover:shadow-3xl" style={{ perspective: '1000px' }}>
                <div className="aspect-[4/3] bg-gradient-to-br from-violet-500 via-purple-600 to-fuchsia-500 p-6 relative" style={{ transform: 'rotateX(2deg) rotateY(2deg)' }}>
                  <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-3 h-3 rounded-full bg-red-400"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                      <div className="w-3 h-3 rounded-full bg-green-400"></div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <div className="h-10 flex-1 bg-white/20 backdrop-blur-md rounded-lg"></div>
                        <div className="h-10 w-20 bg-white/20 backdrop-blur-md rounded-lg"></div>
                      </div>
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="flex gap-3 items-center p-2 bg-white/20 backdrop-blur-md rounded-lg">
                          <div className="w-10 h-10 bg-white/30 rounded-full"></div>
                          <div className="flex-1 space-y-1">
                            <div className="h-3 bg-white/30 rounded w-3/4"></div>
                            <div className="h-2 bg-white/20 rounded w-1/2"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Tenant Directory</h3>
              <p className="text-gray-600">Complete tenant management center</p>
            </div>
          </div>
        </div>
      </section>


      {/* Pages & Modules */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-gray-900 mb-4">Complete Platform</h2>
            <p className="text-xl text-gray-600">Every page and module you need for professional property management</p>
          </div>


          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                title: 'Dashboard',
                description: 'Comprehensive analytics with historical financial and tenant activity data. Monitor performance across any time period.',
                features: ['Revenue tracking', 'Occupancy rates', 'Payment trends', 'Custom date ranges']
              },
              {
                title: 'Properties Management',
                description: 'Hierarchical floor plan view with complete property, room, and bed organization. Visual and intuitive.',
                features: ['Property list', 'Floor plan view', 'Room hierarchy', 'Bulk operations']
              },
              {
                title: 'Tenant Directory',
                description: 'Searchable, filterable directory with active/vacated tabs. Find any tenant in seconds.',
                features: ['Advanced search', 'Status filters', 'Quick actions', 'Export data']
              },
              {
                title: 'Tenant Profiles',
                description: '360-degree tenant view with complete payment history, documents, and communication logs.',
                features: ['Payment history', 'Document storage', 'Contact info', 'Activity timeline']
              },
              {
                title: 'Payments Ledger',
                description: 'True financial ledger showing all transactions with stats, mark-as-paid functionality, and reconciliation.',
                features: ['Monthly statements', 'Payment tracking', 'Quick actions', 'Financial reports']
              },
              {
                title: 'Expenses Module',
                description: 'Complete expense logging and management with categories, receipts, and detailed reporting.',
                features: ['Expense logging', 'Receipt uploads', 'Categorization', 'Expense reports']
              }
            ].map((page, idx) => (
              <div key={idx} className="bg-gradient-to-br from-gray-50 to-white p-8 rounded-2xl border border-gray-100 hover:shadow-xl transition-all">
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{page.title}</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">{page.description}</p>
                <div className="space-y-2">
                  {page.features.map((feature, fidx) => (
                    <div key={fidx} className="flex items-center gap-2 text-gray-700">
                      <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* Benefits */}
      <section id="benefits" className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-gray-900 mb-4">Why Choose PropManager?</h2>
            <p className="text-xl text-gray-600">Built for property owners who demand excellence</p>
          </div>


          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              {[
                {
                  title: 'Save 95% of Your Time',
                  description: 'Automate rent collection, due generation, and payment tracking. Focus on growing your business, not paperwork.'
                },
                {
                  title: 'Never Miss a Payment',
                  description: 'Automated reminders, clear payment status, and one-click reconciliation ensure you always get paid on time.'
                },
                {
                  title: 'Make Data-Driven Decisions',
                  description: 'Historical analytics and financial insights help you optimize pricing, reduce vacancies, and maximize ROI.'
                },
                {
                  title: 'Scale Effortlessly',
                  description: 'Whether you manage 5 properties or 500, our platform grows with you. No limits, no compromises.'
                }
              ].map((benefit, idx) => (
                <div key={idx} className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                      {idx + 1}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{benefit.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>


            <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-12 rounded-3xl text-white shadow-2xl">
              <h3 className="text-3xl font-bold mb-6">Ready to Transform Your Property Management?</h3>
              <p className="text-blue-100 text-lg mb-8 leading-relaxed">
                Join thousands of property owners who have automated their operations and increased their revenue with PropManager.
              </p>
              <div className="space-y-4 mb-8">
                {[
                  'No credit card required',
                  '14-day free trial',
                  'Full access to all features',
                  'Cancel anytime'
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <CheckCircle2 className="w-6 h-6 flex-shrink-0" />
                    <span className="text-lg">{item}</span>
                  </div>
                ))}
              </div>
              <button className="w-full py-4 bg-white text-blue-600 rounded-xl hover:bg-blue-50 transition-all font-bold text-lg shadow-lg hover:shadow-xl">
                Start Your Free Trial
              </button>
            </div>
          </div>
        </div>
      </section>


      {/* Pricing */}
      <section id="pricing" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-gray-900 mb-4">Simple, Transparent Pricing</h2>
            <p className="text-xl text-gray-600">Choose the plan that fits your portfolio</p>
          </div>


          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
               name: 'Starter',
    price: '499',
    description: 'Ideal for small PG owners managing a few properties.',
    features: [
      'Manage up to 3 properties and 30 tenants',
      'Secure owner authentication',
      'Automated dues generation',
      'Complete property, room & bed management',
      'Tenant lifecycle management',
      'Expense tracking & financial ledger',
      'Mobile-friendly dashboard',
      'Email support'
    ]
  },
  {
    name: 'Professional',
    price: '999',
    description: 'Best for mid-size PG businesses with multiple properties.',
    features: [
      'Manage up to 15 properties and 150 tenants',
      'All Starter features',
      'Bulk Add Wizard for quick setup',
      'Advanced filtering & analytics dashboard',
      'Priority email & chat support',
      'Custom branding (logo & name)',
      'Automated expense management reports',
      'API access for integration with accounting tools'
    ],
    popular: true
  },
  {
    name: 'Enterprise',
    price: '2499',
    description: 'For PG chains and large-scale property management firms.',
    features: [
      'Unlimited properties & tenants',
      'All Professional features',
      'Dedicated support & onboarding',
      'Advanced financial ledger & statements',
      'Historical analytics & insights',
      'White-label option with your own domain',
      'Role-based staff accounts with permissions',
      'Custom integrations (ERP, HR, CRM)',
      'SLA-backed uptime & premium training'
                ]
              }
            ].map((plan, idx) => (
              <div key={idx} className={`relative p-8 rounded-3xl border-2 transition-all hover:shadow-2xl hover:-translate-y-1 ${
                plan.popular
                  ? 'border-blue-600 bg-gradient-to-b from-blue-50 to-white shadow-xl'
                  : 'border-gray-200 bg-white'
              }`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-blue-600 text-white rounded-full text-sm font-bold">
                    Most Popular
                  </div>
                )}
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-gray-600 mb-6">{plan.description}</p>
                <div className="mb-6">
                  <span className="text-5xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-gray-600">/month</span>
                </div>
                <button className={`w-full py-3 rounded-xl font-semibold transition-all mb-8 ${
                  plan.popular
                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg'
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                }`}>
                  Get Started
                </button>
                <div className="space-y-3">
                  {plan.features.map((feature, fidx) => (
                    <div key={fidx} className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-5xl font-bold text-white mb-6">Ready to Get Started?</h2>
          <p className="text-2xl text-blue-100 mb-10 leading-relaxed">
            Join thousands of property owners who have already transformed their business with PropManager.
          </p>
         <div className="flex flex-wrap justify-center items-center gap-4 mt-6">
  {/* Button 1 */}
  <button className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-white text-blue-600 rounded-xl hover:bg-blue-50 transition-all font-bold text-base sm:text-lg shadow-md hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2">
    Start Free Trial
    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
  </button>


  {/* Button 2 */}
  <button className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-blue-500 text-white rounded-xl hover:bg-blue-400 transition-all font-bold text-base sm:text-lg border-2 border-blue-400 shadow-md hover:shadow-lg">
    Schedule Demo
  </button>
</div>


          <p className="text-blue-200 mt-6">No credit card required • 14-day free trial • Cancel anytime</p>
        </div>
      </section>


      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Building2 className="w-6 h-6 text-blue-500" />
                <span className="text-xl font-bold text-white">PropManager</span>
              </div>
              <p className="text-sm leading-relaxed">
                The complete property management platform for modern landlords.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Roadmap</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Compliance</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>© 2025 PropManager. All rights reserved. Built for property owners who demand excellence.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
