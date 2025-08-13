# AI One Stop Shop 🚀

The ultimate AI storefront for tools, knowledge, and community. Your one-stop destination for everything AI.

## 🌟 Features

- **AI Tools Directory**: Curated collection of the best AI tools with affiliate links
- **Knowledge Hub**: Expert tutorials, guides, and learning resources
- **Community Platform**: Connect with AI enthusiasts and experts
- **Modern UI/UX**: Beautiful, responsive design with dark mode support
- **Performance Optimized**: Built with Next.js 14 and optimized for speed

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, Framer Motion
- **Icons**: Heroicons, Lucide React
- **Deployment**: Vercel (recommended)
- **Database**: Airtable (for content management)
- **Version Control**: GitHub
- **Containerization**: Docker

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/ai-one-stop-shop.git
   cd ai-one-stop-shop
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
ai-one-stop-shop/
├── app/                    # Next.js 14 App Router
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Homepage
│   └── tools/             # Tools page
├── components/            # React components
│   ├── Header.tsx         # Navigation header
│   ├── Hero.tsx           # Hero section
│   ├── FeaturedTools.tsx  # Featured tools showcase
│   ├── Categories.tsx     # Tool categories
│   ├── KnowledgeHub.tsx   # Learning resources
│   ├── Community.tsx      # Community features
│   ├── Newsletter.tsx     # Email signup
│   └── Loading.tsx        # Loading component
├── public/                # Static assets
├── package.json           # Dependencies and scripts
├── tailwind.config.js     # Tailwind configuration
├── tsconfig.json          # TypeScript configuration
├── next.config.js         # Next.js configuration
├── Dockerfile             # Docker configuration
└── README.md              # Project documentation
```

## 🎨 Customization

### Colors and Theme

The project uses a custom color palette defined in `tailwind.config.js`:

- **Primary**: Blue shades for main actions
- **AI**: Cyan/blue shades for AI-specific elements
- **Dark**: Gray shades for dark mode

### Adding New Tools

1. Update the `featuredTools` array in `components/FeaturedTools.tsx`
2. Add tool images to the `public/` directory
3. Update affiliate links as needed

### Content Management

For production, consider integrating with:
- **Airtable**: For managing tools, categories, and content
- **CMS**: For blog posts and knowledge articles
- **Database**: For user accounts and community features

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect your GitHub repository to Vercel**
2. **Configure environment variables** (if needed)
3. **Deploy automatically** on every push

### Docker Deployment

1. **Build the Docker image**
   ```bash
   npm run docker:build
   ```

2. **Run the container**
   ```bash
   npm run docker:run
   ```

### Environment Variables

Create a `.env.local` file for local development:

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_AIRTABLE_API_KEY=your_airtable_key
NEXT_PUBLIC_AIRTABLE_BASE_ID=your_base_id
```

## 📈 Monetization Strategy

### Affiliate Marketing
- Partner with AI tool providers
- Earn commissions on tool subscriptions
- Track conversions and optimize

### Premium Features
- Advanced tool comparisons
- Exclusive community access
- Premium content and courses

### Sponsored Content
- Featured tool placements
- Sponsored articles and reviews
- Newsletter sponsorships

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run docker:build` - Build Docker image
- `npm run docker:run` - Run Docker container

### Code Style

- Use TypeScript for type safety
- Follow ESLint configuration
- Use Tailwind CSS for styling
- Implement responsive design
- Add proper accessibility attributes

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Icons from [Heroicons](https://heroicons.com/)
- Animations with [Framer Motion](https://www.framer.com/motion/)

## 📞 Support

For support, email support@aionestopshop.com or join our community.

---

**Made with ❤️ for the AI community**
