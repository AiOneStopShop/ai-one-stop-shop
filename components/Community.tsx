'use client'

import { motion } from 'framer-motion'
import { UserGroupIcon, ChatBubbleLeftRightIcon, CalendarIcon, TrophyIcon } from '@heroicons/react/24/outline'

const communityFeatures = [
  {
    id: 1,
    title: 'AI Enthusiasts Forum',
    description: 'Connect with like-minded individuals, share experiences, and learn from each other',
    icon: UserGroupIcon,
    members: '15K+',
    color: 'bg-blue-500'
  },
  {
    id: 2,
    title: 'Expert Q&A Sessions',
    description: 'Get answers from AI experts and industry professionals',
    icon: ChatBubbleLeftRightIcon,
    sessions: '50+',
    color: 'bg-green-500'
  },
  {
    id: 3,
    title: 'Monthly AI Challenges',
    description: 'Participate in exciting AI competitions and showcase your skills',
    icon: TrophyIcon,
    challenges: '12',
    color: 'bg-yellow-500'
  },
  {
    id: 4,
    title: 'Live Workshops',
    description: 'Join interactive workshops and hands-on learning sessions',
    icon: CalendarIcon,
    workshops: '25+',
    color: 'bg-purple-500'
  }
]

const testimonials = [
  {
    id: 1,
    name: 'Sarah Chen',
    role: 'AI Researcher',
    content: 'The community here is incredible! I\'ve learned so much from fellow AI enthusiasts and the expert sessions are invaluable.',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face'
  },
  {
    id: 2,
    name: 'Marcus Rodriguez',
    role: 'Startup Founder',
    content: 'This platform helped me discover the perfect AI tools for my business. The community support is amazing!',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'
  },
  {
    id: 3,
    name: 'Emily Watson',
    role: 'Data Scientist',
    content: 'The knowledge hub and community features have accelerated my AI learning journey significantly.',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face'
  }
]

export default function Community() {
  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Join Our AI Community
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Connect with AI enthusiasts, learn from experts, and be part of the future of artificial intelligence
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {communityFeatures.map((feature, index) => (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className={`w-16 h-16 ${feature.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                <feature.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                {feature.description}
              </p>
              <div className="text-2xl font-bold ai-gradient">
                {feature.members || feature.sessions || feature.challenges || feature.workshops}
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
            What Our Community Says
          </h3>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="card"
            >
              <div className="flex items-center mb-4">
                <img
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full mr-4"
                />
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    {testimonial.name}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {testimonial.role}
                  </p>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-400 italic">
                "{testimonial.content}"
              </p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <div className="bg-gradient-to-r from-brand-purple to-brand-blue rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">
              Ready to Join the AI Revolution?
            </h3>
            <p className="text-xl mb-6 opacity-90">
              Connect with thousands of AI enthusiasts and start your journey today
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-brand-purple font-medium py-3 px-6 rounded-lg hover:bg-gray-100 transition-colors">
                Join Community
              </button>
              <button className="border-2 border-white text-white font-medium py-3 px-6 rounded-lg hover:bg-white hover:text-brand-purple transition-colors">
                Learn More
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
