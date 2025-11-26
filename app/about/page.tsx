'use client';

import Layout from '@/components/Layout';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-10 animate-fade-in">
        {/* Header */}
        <div className="text-center py-6">
          <h1 className="text-4xl font-bold mb-2" style={{ color: '#F5A623' }}>
            Showtime Sound & Lighting
          </h1>
          <p className="text-2xl italic" style={{ color: '#EEEEEE' }}>
            "Run the Show. Light the Way."
          </p>
          <p className="text-sm mt-2" style={{ color: '#AAAAAA' }}>
            Precision. Reliability. Excellence—Every Event, Every Time.
          </p>
        </div>

        {/* Mission */}
        <div className="p-6 rounded-xl" style={{ background: 'rgba(40, 44, 52, 0.9)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ background: 'rgba(245, 166, 35, 0.15)' }}>
              <span className="text-2xl">🎯</span>
            </div>
            <h2 className="text-3xl font-semibold" style={{ color: '#F5A623', fontFamily: 'Inter, system-ui, sans-serif', textTransform: 'none', letterSpacing: 'normal' }}>Our Mission</h2>
          </div>
          <p className="text-base leading-relaxed" style={{ color: '#EEEEEE' }}>
            Showtime Sound & Lighting delivers flawless audio, video, and lighting experiences by combining expert technicians, reliable equipment, and a culture built on integrity and customer care. Our mission is to ensure every event—no matter the size—runs smoothly, professionally, and with excellence.
          </p>
        </div>

        {/* Vision */}
        <div className="p-6 rounded-xl" style={{ background: 'rgba(40, 44, 52, 0.9)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ background: 'rgba(0, 212, 255, 0.15)' }}>
              <span className="text-2xl">🌟</span>
            </div>
            <h2 className="text-3xl font-semibold" style={{ color: '#00D4FF', fontFamily: 'Inter, system-ui, sans-serif', textTransform: 'none', letterSpacing: 'normal' }}>Our Vision</h2>
          </div>
          <p className="text-base leading-relaxed" style={{ color: '#EEEEEE' }}>
            To become the most trusted and innovative event-production partner in our region, known for reliability, technical mastery, and service that earns lifelong customers.
          </p>
          <p className="mt-3 text-base leading-relaxed" style={{ color: '#EEEEEE' }}>
            We aim to empower our team with the tools and systems needed to grow, perform at their best, and continuously raise the standard of live event support.
          </p>
        </div>

        {/* Core Values */}
        <div className="p-6 rounded-xl" style={{ background: 'rgba(40, 44, 52, 0.9)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ background: 'rgba(16, 185, 129, 0.15)' }}>
              <span className="text-2xl">💙</span>
            </div>
            <h2 className="text-3xl font-semibold" style={{ color: '#10B981', fontFamily: 'Inter, system-ui, sans-serif', textTransform: 'none', letterSpacing: 'normal' }}>Our Core Values</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                num: '1',
                title: 'CUSTOMER FIRST',
                desc: 'We treat every event as if it\'s our own. Every interaction, every detail, every show—our customers deserve the best.',
                color: '#F5A623'
              },
              {
                num: '2',
                title: 'RELIABILITY ABOVE ALL',
                desc: 'Events can\'t be rescheduled. Neither can we. We show up prepared, early, and ready for anything.',
                color: '#00D4FF'
              },
              {
                num: '3',
                title: 'CRAFTSMANSHIP & EXPERTISE',
                desc: 'We take pride in our technical skill and the quality of the work we deliver. Clean setups, smart signal flow, safe rigging, sharp visuals, and exceptional sound.',
                color: '#A855F7'
              },
              {
                num: '4',
                title: 'TEAMWORK MAKES THE SHOW',
                desc: 'No event succeeds alone. We support each other, communicate clearly, and step in wherever needed.',
                color: '#10B981'
              },
              {
                num: '5',
                title: 'OWNERSHIP & ACCOUNTABILITY',
                desc: 'If we say we\'ll do it, we do it. We take responsibility for our work, our gear, and the success of every show.',
                color: '#EAB308'
              },
              {
                num: '6',
                title: 'CONTINUOUS IMPROVEMENT',
                desc: 'We learn, we adapt, we grow. New technology, better workflows, better tools—the show never stands still, and neither do we.',
                color: '#F5A623'
              },
              {
                num: '7',
                title: 'RESPECT FOR PEOPLE & EQUIPMENT',
                desc: 'We respect our customers, our teammates, our contract workers, and our gear. The way we treat our tools and each other defines who we are.',
                color: '#00D4FF'
              },
            ].map((value, index) => (
              <div
                key={index}
                className="p-5 rounded-lg"
                style={{ background: 'rgba(50, 54, 62, 0.8)', borderLeft: `4px solid ${value.color}` }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl font-bold" style={{ color: value.color }}>{value.num}.</span>
                  <h3 className="text-lg font-semibold" style={{ color: value.color, fontFamily: 'Inter, system-ui, sans-serif', textTransform: 'none', letterSpacing: '0.01em' }}>{value.title}</h3>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: '#DDDDDD' }}>{value.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* The Showtime Promise */}
        <div className="p-6 rounded-xl" style={{ background: 'rgba(45, 48, 56, 0.95)', border: '1px solid rgba(245, 166, 35, 0.3)' }}>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ background: 'rgba(245, 166, 35, 0.2)' }}>
              <span className="text-2xl">💡</span>
            </div>
            <h2 className="text-3xl font-semibold" style={{ color: '#F5A623', fontFamily: 'Inter, system-ui, sans-serif', textTransform: 'none', letterSpacing: 'normal' }}>The Showtime Promise</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
            {[
              'We plan ahead.',
              'We communicate clearly.',
              'We keep our commitments.',
              'We never cut corners.',
              'We always deliver a clean, professional, reliable experience.',
            ].map((promise, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-4 rounded-lg"
                style={{ background: 'rgba(35, 38, 45, 0.9)' }}
              >
                <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#10B981' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-base" style={{ color: '#EEEEEE' }}>{promise}</span>
              </div>
            ))}
          </div>

          <div className="text-center pt-6" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <p className="text-lg font-medium" style={{ color: '#EEEEEE' }}>
              Every technician, operator, and team member represents the Showtime brand.
            </p>
            <p className="mt-2 text-lg" style={{ color: '#F5A623' }}>
              Every event is an opportunity to prove why customers trust us.
            </p>
          </div>
        </div>

        {/* Back Button */}
        <div className="text-center pb-6">
          <Link href="/" className="btn btn-secondary">
            Back to Dashboard
          </Link>
        </div>
      </div>
    </Layout>
  );
}
