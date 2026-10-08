import ikiminaImg from '../assets/projects/ikimina.png';
import hotelBarImg from '../assets/projects/hotel-bar.png';
import schoolImg from '../assets/projects/school.png';
import auditImg from '../assets/projects/audit.png';
import ecommerceImg from '../assets/projects/ecommerce.png';
import financialImg from '../assets/projects/financial.png';

export const projectCategories = [
  'All',
  'Management Systems',
  'Hospitality',
  'Education',
  'Finance',
  'E-commerce',
];

export const projects = [
  {
    id: 'ikimina',
    image: ikiminaImg,
    name: 'Ikimina Management System',
    category: 'Finance',
    short:
      'A complete savings-group (Ikimina/SACCO) platform managing members, contributions, loans, penalties and reports for multiple organizations.',
    accent: ['#7c3aed', '#ec4899'],
    icon: 'coins',
  },
  {
    id: 'hotel-bar',
    image: hotelBarImg,
    name: 'Hotel, Bar & Restaurant Management System',
    category: 'Hospitality',
    short:
      'An offline-capable desktop system covering rooms, reservations, bar & restaurant sales, stock and reporting for hospitality businesses.',
    accent: ['#0891b2', '#22d3ee'],
    icon: 'building',
  },
  {
    id: 'school',
    image: schoolImg,
    name: 'School Management System',
    category: 'Education',
    short:
      'Student registration, academics, marks, discipline and reporting in one platform designed for schools of any size.',
    accent: ['#7c3aed', '#a78bfa'],
    icon: 'academic',
  },
  {
    id: 'audit',
    image: auditImg,
    name: 'Audit Management System',
    category: 'Management Systems',
    short:
      'Plan audits, track findings and recommendations, and generate professional audit reports with full traceability.',
    accent: ['#0f766e', '#2dd4bf'],
    icon: 'clipboard',
  },
  {
    id: 'ecommerce',
    image: ecommerceImg,
    name: 'E-commerce Platform',
    category: 'E-commerce',
    short:
      'A modern online store with product catalog, cart, orders and payment-ready checkout, built for growing businesses.',
    accent: ['#c026d3', '#f472b6'],
    icon: 'cart',
  },
  {
    id: 'financial',
    image: financialImg,
    name: 'Financial Management System',
    category: 'Finance',
    short:
      'Income, expenses, budgeting and financial reporting with clear dashboards that give managers full visibility.',
    accent: ['#d97706', '#fbbf24'],
    icon: 'chart',
  },
];
