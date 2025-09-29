# Strawberry Dips Business App  
  
A modern e-commerce platform for chocolate-covered strawberries business, inspired by Purpink.co.ke  
  
## Features  
  
- **Product Catalog**: Strawberry varieties, chocolate types, sizes  
- **Gift Builder**: Custom combinations and personalization  
- **Order Management**: Recipient details, delivery scheduling  
- **Payment Processing**: Stripe integration  
- **Admin Dashboard**: Order fulfillment, inventory management  
- **Responsive Design**: Mobile-first approach 
  
## Quick Start  
  
1. **Install dependencies**: \`pnpm install\`  
2. **Set up Supabase**:  
   - Create a new project at [supabase.com](https://supabase.com)  
   - Copy the URL and anon key to \`.env.local\`  
   - Run the SQL schema from \`database.sql\`  
3. **Set up Stripe**:  
   - Create account at [stripe.com](https://stripe.com)  
   - Copy keys to \`.env.local\`  
4. **Start development**: \`pnpm dev\` 
  
## Deployment  
  
### Option 1: Vercel (Recommended)  
1. Push code to GitHub  
2. Connect to [Vercel](https://vercel.com)  
3. Add environment variables  
4. Deploy!  
  
### Option 2: GoDaddy WordPress Integration  
- Keep marketing pages on WordPress  
- Point \`app.domain.com\` to Vercel  
- Use WordPress for content, app for ordering 
  
## ?? Project Status  
  
? **Core Setup Complete**  
- Next.js 15 with TypeScript and Tailwind CSS  
- Supabase integration ready  
- Stripe payment processing  
- Component structure created  
- Database schema defined  
  
? **Components Created**  
- Hero section with branding  
- Product grid with mock data  
- Product cards with pricing  
- Header with navigation  
- Admin dashboard structure 
