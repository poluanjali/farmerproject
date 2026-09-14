import { SampleFieldItem } from './types';

export const SAMPLE_FIELD_ITEMS: SampleFieldItem[] = [
  {
    id: 'paddy-blight',
    title: 'Paddy / Rice Leaf Blight (धान झुलसा / వరి తెగులు)',
    category: 'crop',
    description: 'Yellowing leaves with brown spindle-shaped lesions and leaf margin dry-up.',
    imageUrl: '/samples/paddy-blight.jpg',
    promptHint: 'Check leaf spots and yellowing on this paddy crop. What disease is this and how much pesticide to spray?',
  },
  {
    id: 'tomato-leaf',
    title: 'Tomato Leaf Spot & Whitefly (टमाटर पत्ती रोग / టమాటా ఆకు తెగులు)',
    category: 'crop',
    description: 'Curling foliage with yellow halo spots and early pest infestation signs.',
    imageUrl: '/samples/tomato-leaf.jpg',
    promptHint: 'Tomato leaves are curling and showing spots. Tell me safe pesticide dosage and organic cure.',
  },
  {
    id: 'cotton-pest',
    title: 'Cotton Foliage & Bollworm Watch (कपास फसल / పత్తి)',
    category: 'crop',
    description: 'Cotton leaves with chewing damage and sucking pest symptoms.',
    imageUrl: '/samples/cotton-crop.jpg',
    promptHint: 'Cotton crop showing small pest bites and leaf curling. What is the pest control schedule?',
  },
  {
    id: 'black-cotton-soil',
    title: 'Black Cotton Soil / Regur (काली मिट्टी / నల్లరేగడి నేల)',
    category: 'soil',
    description: 'Dark, deep clay-rich soil with moisture retention fissures, ideal for cotton & pulses.',
    imageUrl: '/samples/black-soil.jpg',
    promptHint: 'Analyze this black soil. What is its fertility and which crops are best suited for cultivation?',
  },
  {
    id: 'red-loam-soil',
    title: 'Red Loamy Soil (लाल बलुई मिट्टी / ఎర్ర నేల)',
    category: 'soil',
    description: 'Iron-rich porous red loamy soil, good aeration, suitable for groundnut & millets.',
    imageUrl: '/samples/red-soil.jpg',
    promptHint: 'This is red soil from my field. Tell me how to improve moisture and what can I cultivate now?',
  },
  {
    id: 'healthy-wheat',
    title: 'Wheat Crop Health Check (गेहूं फसल / గోధుమ)',
    category: 'crop',
    description: 'Green wheat canopy checking for rust signs, nutrient balance, and grain development.',
    imageUrl: '/samples/wheat-crop.jpg',
    promptHint: 'Verify if this wheat crop is healthy or needs micronutrient spray before flowering.',
  },
];
