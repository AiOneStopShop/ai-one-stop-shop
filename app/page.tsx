'use client'

import { Suspense, useState } from 'react'
import { motion } from 'framer-motion'
import { SparklesIcon } from '@heroicons/react/24/outline'
import Header from '@/components/Header'
import Hero from '@/components/Hero'
import PersonaGuide from '@/components/PersonaGuide'
import FeaturedTools from '@/components/FeaturedTools'
import FeaturedAgents from '@/components/FeaturedAgents'
import Categories from '@/components/Categories'
import KnowledgeHub from '@/components/KnowledgeHub'
import Community from '@/components/Community'
import Newsletter from '@/components/Newsletter'
import Footer from '@/components/Footer'
import Loading from '@/components/Loading'

export default function Home() {
  const [selectedPersona, setSelectedPersona] = useState<any>(null)

  return (
    <>
      <Header />
      <main className="min-h-screen">
        <Hero />
        
        <PersonaGuide 
          onPersonaSelect={setSelectedPersona}
          selectedPersona={selectedPersona}
        />
        
        <Suspense fallback={<Loading />}>
          <FeaturedTools />
        </Suspense>
        
        <Suspense fallback={<Loading />}>
          <FeaturedAgents />
        </Suspense>
        
        {/* Toolkit Builder CTA */}
        <section className="py-20 bg-gradient-to-r from-brand-purple to-brand-blue">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Build Your Perfect AI Toolkit
              </h2>
              <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                Choose your budget tier and let us help you create the ideal combination of AI tools and agents for your specific needs
              </p>
              <a
                href="/toolkit"
                className="bg-white text-brand-purple font-medium py-3 px-8 rounded-lg hover:bg-gray-100 transition-colors inline-flex items-center"
              >
                <SparklesIcon className="w-5 h-5 mr-2" />
                Start Building
              </a>
            </motion.div>
          </div>
        </section>
        
        <Categories />
        
        <Suspense fallback={<Loading />}>
          <KnowledgeHub />
        </Suspense>
        
        <Community />
        <Newsletter />
        <Footer />
      </main>
    </>
  )
}

