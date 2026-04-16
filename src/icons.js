import {
  Sparkles, BookOpen, Zap, Video, Wrench, Target, MessageCircle,
  Bot, MessageSquare, TrendingUp, Brain, FileText, Shield, Star,
  Rocket, Globe, Bell, DollarSign, BarChart2, Users, Lightbulb,
  Award, Flame, Layers, Settings, Heart, Coffee,
} from 'lucide-react';

// Registro completo de iconos disponibles para seleccionar en el admin
export const ICONS = {
  Sparkles,
  BookOpen,
  Zap,
  Video,
  Wrench,
  Target,
  MessageCircle,
  Bot,
  MessageSquare,
  TrendingUp,
  Brain,
  FileText,
  Shield,
  Star,
  Rocket,
  Globe,
  Bell,
  DollarSign,
  BarChart2,
  Users,
  Lightbulb,
  Award,
  Flame,
  Layers,
  Settings,
  Heart,
  Coffee,
};

/**
 * Devuelve el componente Lucide correspondiente al nombre.
 * Si no existe, devuelve FileText como fallback.
 */
export function getIcon(name) {
  return ICONS[name] || FileText;
}

// Lista ordenada para el selector del formulario admin
export const ICON_OPTIONS = Object.keys(ICONS).sort();
