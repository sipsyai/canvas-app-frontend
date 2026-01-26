/**
 * Icon Mapping Utility
 *
 * Maps icon names stored in the database to Lucide React icons.
 * Used for displaying object icons in the application runtime.
 */

import {
  Target,
  User,
  Building2,
  Users,
  Box,
  Ticket,
  Mail,
  Phone,
  Calendar,
  Clock,
  Star,
  Heart,
  Tag,
  Tags,
  Zap,
  Activity,
  TrendingUp,
  BarChart3,
  PieChart,
  Settings,
  Briefcase,
  Truck,
  Archive,
  Bookmark,
  Package,
  Boxes,
  Database,
  Server,
  FolderOpen,
  FileText,
  Layers,
  Grid3x3,
  Layout,
  UserCircle,
  Building,
  ShoppingCart,
  ShoppingBag,
  CreditCard,
  Wallet,
  DollarSign,
  MapPin,
  Package2,
  type LucideIcon,
} from 'lucide-react';

/**
 * Map of icon name strings to Lucide React components.
 * Keys are lowercase to enable case-insensitive lookups.
 */
const ICON_MAP: Record<string, LucideIcon> = {
  // People & Organizations
  target: Target,
  user: User,
  usercircle: UserCircle,
  users: Users,
  building: Building,
  building2: Building2,
  briefcase: Briefcase,

  // Objects & Items
  box: Box,
  boxes: Boxes,
  package: Package,
  package2: Package2,
  archive: Archive,
  truck: Truck,

  // Data & Storage
  database: Database,
  server: Server,
  layers: Layers,
  grid3x3: Grid3x3,
  layout: Layout,

  // Files & Folders
  folderopen: FolderOpen,
  filetext: FileText,

  // Commerce
  shoppingcart: ShoppingCart,
  shoppingbag: ShoppingBag,
  creditcard: CreditCard,
  wallet: Wallet,
  dollarsign: DollarSign,

  // Communication
  mail: Mail,
  phone: Phone,
  ticket: Ticket,

  // Time & Location
  calendar: Calendar,
  clock: Clock,
  mappin: MapPin,

  // Favorites & Tags
  star: Star,
  heart: Heart,
  bookmark: Bookmark,
  tag: Tag,
  tags: Tags,

  // Analytics
  zap: Zap,
  activity: Activity,
  trendingup: TrendingUp,
  barchart3: BarChart3,
  piechart: PieChart,

  // System
  settings: Settings,
};

/**
 * Get a Lucide icon component by name.
 * Falls back to Box icon if the name is not found.
 *
 * @param iconName - The icon name from the database (case-insensitive)
 * @returns The corresponding Lucide icon component
 */
export function getObjectIcon(iconName?: string | null): LucideIcon {
  if (!iconName) return Box;

  // Normalize: lowercase and remove non-alphanumeric characters
  const normalizedName = iconName.toLowerCase().replace(/[^a-z0-9]/g, '');

  return ICON_MAP[normalizedName] || Box;
}

/**
 * List of all available icon names for use in pickers/selectors.
 */
export const AVAILABLE_ICONS = Object.keys(ICON_MAP);
