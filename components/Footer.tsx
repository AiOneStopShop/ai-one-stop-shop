'use client'

import { motion } from 'framer-motion'
import { SparklesIcon } from '@heroicons/react/24/outline'
import { Twitter, Linkedin, Instagram, Youtube, Github, Mail } from 'lucide-react'

const socialLinks = [
  {
    name: 'Twitter',
    href: 'https://twitter.com/yourusername',
    icon: Twitter,
    color: 'hover:text-blue-400'
  },
  {
    name: 'LinkedIn',
    href: 'https://linkedin.com/in/yourusername',
    icon: Linkedin,
    color: 'hover:text-blue-600'
  },
  {
    name: 'Instagram',
    href: 'https://instagram.com/yourusername',
    icon: Instagram,
    color: 'hover:text-pink-500'
  },
  {
    name: 'YouTube',
    href: 'https://youtube.com/@yourusername',
    icon: Youtube,
    color: 'hover:text-red-500'
  },
  {
    name: 'GitHub',
    href: 'https://github.com/yourusername',
    icon: Github,
    color: 'hover:text-gray-400'
  },
  {
    name: 'Email',
    href: 'mailto:hello@aionestop.shop',
    icon: Mail,
    color: 'hover:text-green-500'
  }
]

const quickLinks = [
  { name: 'AI Tools', href: '/tools' },
  { name: 'AI Agents', href: '/agents' },
  { name: 'Toolkit Builder', href: '/toolkit' },
  { name: 'Knowledge Hub', href: '/knowledge' },
  { name: 'Community', href: '/community' },
  { name: 'About', href: '/about' }
]

const categories = [
  { name: 'AI Assistants', href: '/tools?category=AI%20Assistant' },
  { name: 'Image Generation', href: '/tools?category=Image%20Generation' },
  { name: 'Video Creation', href: '/tools?category=Video%20Creation' },
  { name: 'Text & Writing', href: '/tools?category=Text%20%26%20Writing' },
  { name: 'Code & Development', href: '/tools?category=Code%20%26%20Development' },
  { name: 'Data & Analytics', href: '/tools?category=Data%20%26%20Analytics' }
]

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-brand-purple to-brand-blue rounded-full flex items-center justify-center mr-3">
                <SparklesIcon className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold">AIOneStop</span>
                <span className="text-xs text-brand-orange font-medium -mt-1">shop</span>
              </div>
            </div>
            <p className="text-gray-400 mb-6">
              The ultimate AI storefront for tools, knowledge, and community. 
              Discover, learn, and master AI with our curated collection.
            </p>
            {/* Social Media Links */}
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`text-gray-400 transition-colors duration-200 ${social.color}`}
                  aria-label={social.name}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors duration-200"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Tool Categories */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Tool Categories</h3>
            <ul className="space-y-2">
              {categories.map((category) => (
                <li key={category.name}>
                  <a
                    href={category.href}
                    className="text-gray-400 hover:text-white transition-colors duration-200"
                  >
                    {category.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter Signup */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Stay Updated</h3>
            <p className="text-gray-400 mb-4">
              Get the latest AI tool updates and insights delivered to your inbox.
            </p>
            <div className="flex">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-l-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-purple"
              />
              <button className="px-4 py-2 bg-brand-purple hover:bg-brand-blue transition-colors duration-200 rounded-r-lg">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-400 text-sm mb-4 md:mb-0">
              © 2024 AIOneStop.shop. All rights reserved.
            </div>
            <div className="flex space-x-6 text-sm">
              <a href="/privacy" className="text-gray-400 hover:text-white transition-colors">
                Privacy Policy
              </a>
              <a href="/terms" className="text-gray-400 hover:text-white transition-colors">
                Terms of Service
              </a>
              <a href="/contact" className="text-gray-400 hover:text-white transition-colors">
                Contact
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
