// Projects shown on the home page and the Work page. Each one also gets its
// own case study page at /work/<slug>/.
//
// To add a project: drop a screenshot (roughly 2400 x 1500) into src/assets/work/,
// import it below and add an entry to the list. Set `concept: false` for real
// client work.

import type { ImageMetadata } from 'astro';
import vanguard from '../assets/work/vanguard-roofing.jpg';
import apex from '../assets/work/apex-heating.jpg';
import hartley from '../assets/work/hartley-electrical.jpg';
import taylor from '../assets/work/taylor-landscapes.jpg';

export interface Project {
  slug: string;
  name: string;
  trade: string;
  area: string;
  concept: boolean;
  image: ImageMetadata;
  imageAlt: string;
  /** Brand colour of the project, used for hover and page accents. */
  accent: string;
  /** Text colour that passes contrast on the accent. */
  onAccent: string;
  headline: string;
  summary: string;
  brief: string;
  decisions: { title: string; body: string }[];
  palette: string[];
  type: string;
}

export const projects: Project[] = [
  {
    slug: 'vanguard-roofing',
    name: 'Vanguard Roofing',
    trade: 'Roofing',
    area: 'Canterbury and east Kent',
    concept: true,
    image: vanguard,
    imageAlt:
      'Vanguard Roofing home page: an orange emergency call bar, a dark header and the headline "Roofs that outlast the weather" over a photo of a roofer laying tiles.',
    accent: '#F28C28',
    onAccent: '#0E0E0C',
    headline: 'Built for the call that comes in during a storm.',
    summary: 'A roofer site that puts the emergency number first and the free survey a close second.',
    brief:
      'People look for a roofer in two moods: calmly planning a new roof, or panicking because water is coming through the ceiling. The site had to serve both without making either one hunt.',
    decisions: [
      {
        title: 'Emergency bar on every page',
        body: 'A bright strip across the top with the 24-hour number. Someone with a leak never has to scroll to find it.',
      },
      {
        title: 'Two clear next steps',
        body: 'Book a free survey or call now. Nothing else competes with those two buttons in the hero.',
      },
      {
        title: 'Type that means business',
        body: 'Tall condensed capitals give it weight and confidence, the way a roof should feel.',
      },
      {
        title: 'Proof next to the buttons',
        body: 'The review rating sits right where people decide whether to get in touch, not buried in the footer.',
      },
    ],
    palette: ['#F28C28', '#1C1D1F', '#F2EFE8'],
    type: 'Condensed grotesk headlines with a clean sans for body text',
  },
  {
    slug: 'apex-heating',
    name: 'Apex Heating & Plumbing',
    trade: 'Heating and plumbing',
    area: 'Maidstone and mid Kent',
    concept: true,
    image: apex,
    imageAlt:
      'Apex Heating & Plumbing home page: the serif headline "Warm house, fair price, tidy job." over a photo of an engineer with a customer, and a three-step boiler quote form overlapping the hero.',
    accent: '#1F4A42',
    onAccent: '#F2EFE8',
    headline: 'A boiler quote before the kettle boils.',
    summary: 'A warm, trustworthy heating site with a three-question quote tool built into the hero.',
    brief:
      'Boiler replacements are big-ticket jobs, and most people want a rough price before they will let anyone round. The site needed to feel friendly and local while doing the qualifying work up front.',
    decisions: [
      {
        title: 'Quote tool in the hero',
        body: 'Three quick questions, no home visit needed. It turns a browsing visitor into a lead without a phone call.',
      },
      {
        title: 'A headline people would actually say',
        body: '"Warm house, fair price, tidy job." It is what customers care about, in their words.',
      },
      {
        title: 'Warm colours, real people',
        body: 'Deep green and burnt orange on cream, with a photo of an engineer talking to a customer rather than a boiler on a white background.',
      },
    ],
    palette: ['#1F4A42', '#D66A2A', '#F4EEE4'],
    type: 'A soft editorial serif for headlines with a friendly sans for body text',
  },
  {
    slug: 'hartley-electrical',
    name: 'Hartley Electrical',
    trade: 'Electrical',
    area: 'Ashford and Kent',
    concept: true,
    image: hartley,
    imageAlt:
      'Hartley Electrical home page: the headline "Electrical work priced before we start, not after." beside a guide price sheet listing consumer units, EV chargers, rewires and certificates.',
    accent: '#2B50F0',
    onAccent: '#FFFFFF',
    headline: 'Prices on the page, not after the job.',
    summary: 'An electrician site that answers the first question everyone has: what will it cost?',
    brief:
      'Customers worry about surprise bills. The idea was to take that worry away before anything else, by showing guide prices on the home page like a proper rate sheet.',
    decisions: [
      {
        title: 'Guide price sheet in the hero',
        body: 'Common jobs with "from" prices including VAT, set out like a printed rate card.',
      },
      {
        title: 'Send a photo, get a price',
        body: 'A second call to action for people who would rather not talk on the phone.',
      },
      {
        title: 'Accreditations in plain sight',
        body: 'Registrations, insurance and years trading in a strip under the hero, because that is what people check next.',
      },
      {
        title: 'Technical, not cold',
        body: 'Monospaced labels and a dotted grid nod to technical drawings, balanced with plenty of white space.',
      },
    ],
    palette: ['#2B50F0', '#0F1B33', '#FFFFFF'],
    type: 'A tight modern grotesk for headlines with monospaced labels',
  },
  {
    slug: 'taylor-landscapes',
    name: 'Taylor Landscapes',
    trade: 'Garden design and build',
    area: 'Sevenoaks, Tonbridge and west Kent',
    concept: true,
    image: taylor,
    imageAlt:
      'Taylor Landscapes home page: the serif headline "Gardens built to be lived in" over a full-width photo of a curved stone wall and planted borders.',
    accent: '#2F4A3C',
    onAccent: '#F2EFE8',
    headline: 'Let the gardens do the talking.',
    summary: 'A landscaping site where the photography carries the sale and the copy stays out of the way.',
    brief:
      'Landscaping is bought with the eyes. The job was to give the work as much room as possible and make booking a design visit feel like the obvious next step.',
    decisions: [
      {
        title: 'Full-bleed photography',
        body: 'The hero is the garden. The text sits over it with just enough shading to stay readable.',
      },
      {
        title: 'Named, local and personal',
        body: 'The intro names the owner, the crew and the towns they work in, so it reads like a local firm rather than a franchise.',
      },
      {
        title: 'Services at a glance',
        body: 'Patios, pergolas, planting and full rebuilds listed along the bottom of the hero, so visitors know straight away if it fits their job.',
      },
    ],
    palette: ['#2F4A3C', '#D0782E', '#F4F0E8'],
    type: 'A condensed high-contrast serif for headlines with a rounded sans for body text',
  },
];
