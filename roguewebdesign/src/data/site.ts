// Business details used across the site. Anything set to null shows as a
// clearly marked placeholder until Euan fills it in.

export const site = {
  name: 'roguewebdesign',
  owner: 'Euan Rogers',
  // Confirm the real domain before launch: it feeds the sitemap, canonical URLs and social cards.
  url: 'https://roguewebdesign.co.uk',
  region: 'Kent',
  tagline: 'Websites for Kent tradespeople',
  description:
    'roguewebdesign is Euan Rogers, a freelance web designer in Kent building fast, good-looking websites for roofers, plumbers, electricians, landscapers and other trades. Sites from £300.',
  priceFrom: 300,
  email: null as string | null, // e.g. 'hello@roguewebdesign.co.uk'
  phone: null as string | null, // e.g. '07123 456789'
  socials: [] as { label: string; href: string }[], // e.g. [{ label: 'Instagram', href: 'https://instagram.com/...' }]
  replyPromise: 'I reply to every enquiry within one working day.',
  photo: null as string | null, // path to a photo of Euan in src/assets, once there is one
};

export const nav = [
  { label: 'Work', href: '/work/' },
  { label: 'Services', href: '/services/' },
  { label: 'About', href: '/about/' },
  { label: 'Contact', href: '/contact/' },
];

export const trades = [
  'Roofers',
  'Plumbers',
  'Electricians',
  'Landscapers',
  'Builders',
  'Plasterers',
  'Heating engineers',
  'Carpenters',
  'Painters and decorators',
  'Tilers',
];
