export const dashboardStats = [
  {
    label: 'Total Products',
    value: '48',
    trend: '+6 this month',
    tone: 'primary',
  },
  {
    label: 'Active Warranties',
    value: '31',
    trend: '64% protected',
    tone: 'success',
  },
  {
    label: 'Expiring Soon',
    value: '7',
    trend: 'Next 30 days',
    tone: 'warning',
  },
  {
    label: 'Expired Warranties',
    value: '10',
    trend: 'Needs review',
    tone: 'danger',
  },
] as const;

export const products = [
  {
    id: 'macbook-air-m2',
    name: 'MacBook Air M2',
    brand: 'Apple',
    category: 'Laptop',
    purchaseDate: '2025-02-15',
    warrantyDuration: '24 months',
    status: 'Active',
    expiresIn: '11 months left',
  },
  {
    id: 'sony-wh1000xm5',
    name: 'WH-1000XM5',
    brand: 'Sony',
    category: 'Audio',
    purchaseDate: '2024-11-03',
    warrantyDuration: '12 months',
    status: 'Expiring Soon',
    expiresIn: '19 days left',
  },
  {
    id: 'samsung-qled-q80',
    name: 'QLED Q80 55"',
    brand: 'Samsung',
    category: 'Television',
    purchaseDate: '2023-08-28',
    warrantyDuration: '24 months',
    status: 'Expired',
    expiresIn: 'Expired 3 months ago',
  },
  {
    id: 'dyson-v15',
    name: 'V15 Detect',
    brand: 'Dyson',
    category: 'Home Appliance',
    purchaseDate: '2025-01-08',
    warrantyDuration: '24 months',
    status: 'Active',
    expiresIn: '14 months left',
  },
] as const;

export const features = [
  {
    title: 'Centralized warranty hub',
    description:
      'Keep products, receipts, serial numbers, and warranty timelines in one organized workspace.',
  },
  {
    title: 'Smart renewal visibility',
    description:
      'Surface expiring warranties before they lapse so users can act early and avoid missed coverage.',
  },
  {
    title: 'Claim-ready records',
    description:
      'Prepare for support calls and claims with structured product history and purchase proof references.',
  },
] as const;

export const categories = [
  'All Categories',
  'Laptop',
  'Audio',
  'Television',
  'Home Appliance',
] as const;
