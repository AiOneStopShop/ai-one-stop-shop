# 🌐 Custom Domain Setup Guide

## Setting up `aionestop.shop` with Vercel

### Step 1: Deploy to Vercel

1. **Go to Vercel Dashboard**
   - Visit [vercel.com](https://vercel.com)
   - Sign in with your GitHub account

2. **Import Your Repository**
   - Click "New Project"
   - Select "Import Git Repository"
   - Choose `AiOneStopShop/ai-one-stop-shop`
   - Click "Import"

3. **Configure Project**
   - Framework: Next.js (auto-detected)
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete

### Step 2: Add Custom Domain

1. **Go to Project Settings**
   - In your Vercel dashboard, select your project
   - Click "Settings" tab
   - Click "Domains" in the left sidebar

2. **Add Domain**
   - Enter: `aionestop.shop`
   - Click "Add"
   - Vercel will provide DNS configuration

### Step 3: Configure DNS

**Option A: Use Vercel's Nameservers (Recommended)**

1. **Get Vercel Nameservers**
   - In Vercel domain settings, you'll see nameservers like:
     ```
     ns1.vercel-dns.com
     ns2.vercel-dns.com
     ```

2. **Update at Domain Registrar**
   - Go to your domain registrar (where you bought aionestop.shop)
   - Find DNS/Nameserver settings
   - Replace existing nameservers with Vercel's nameservers
   - Save changes

**Option B: Use DNS Records**

If you prefer to keep your current nameservers, add these records:

```
Type: A
Name: @
Value: 76.76.19.19

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### Step 4: Verify Setup

1. **Wait for DNS Propagation**
   - DNS changes can take 24-48 hours
   - Usually works within 1-2 hours

2. **Test Your Domain**
   - Visit `https://aionestop.shop`
   - Should redirect to your AI One Stop Shop

3. **Check HTTPS**
   - Vercel automatically provides SSL certificates
   - Your site should be accessible via `https://`

### Step 5: Environment Variables

Add these to your Vercel project settings:

```env
NEXT_PUBLIC_SITE_URL=https://aionestop.shop
CUSTOM_KEY=your_custom_key
```

### Troubleshooting

**Domain Not Working?**
- Check DNS propagation: [whatsmydns.net](https://whatsmydns.net)
- Verify nameservers are correct
- Wait up to 48 hours for full propagation

**HTTPS Issues?**
- Vercel handles SSL automatically
- If issues persist, check domain configuration

**Redirect Issues?**
- Ensure both `aionestop.shop` and `www.aionestop.shop` are configured
- Check Vercel redirect settings

### Benefits of Custom Domain

✅ **Professional Branding** - Your own domain name
✅ **SEO Benefits** - Better search engine rankings
✅ **Trust & Credibility** - Professional appearance
✅ **Easy to Remember** - Simple, memorable URL
✅ **SSL Security** - Automatic HTTPS encryption
✅ **Analytics** - Track traffic and performance

### Next Steps After Domain Setup

1. **Update Social Media** - Use your new domain everywhere
2. **Set Up Analytics** - Connect Google Analytics
3. **Configure Email** - Set up professional email addresses
4. **SEO Optimization** - Submit to search engines
5. **Monitor Performance** - Track site speed and uptime

---

**Your AI One Stop Shop will be live at: https://aionestop.shop**

*Perfect domain name for your AI storefront! 🚀*
