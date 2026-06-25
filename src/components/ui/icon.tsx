import {
  Award, Baby, Blocks, BookOpen, BookText, Brain, Calculator, CalendarDays,
  CircleDot, Dices, Drama, Eye, FlaskConical, Globe2, Goal, GraduationCap,
  Handshake, HeartHandshake, Languages, Laptop, Layers, Medal, Music, Palette,
  Scale, ShieldCheck, SpellCheck, Sparkles, Target,
  Users, BookMarked, Trophy, Heart, Star, Lightbulb, Rocket, Compass, Shapes,
  PencilRuler, Microscope, Music2, Flag, Sun, Smile, type LucideProps,
} from "lucide-react";
import type { ComponentType } from "react";

const registry: Record<string, ComponentType<LucideProps>> = {
  Award, Baby, Blocks, BookOpen, BookText, Brain, Calculator, CalendarDays,
  CircleDot, Dices, Drama, Eye, FlaskConical, Globe2, Goal, GraduationCap,
  Handshake, HeartHandshake, Languages, Laptop, Layers, Medal, Music, Palette,
  Scale, ShieldCheck, SpellCheck, Sparkles, Target,
  Users, BookMarked, Trophy, Heart, Star, Lightbulb, Rocket, Compass, Shapes,
  PencilRuler, Microscope, Music2, Flag, Sun, Smile,
};

export const ICON_NAMES = Object.keys(registry);

export function Icon({ name, ...props }: { name?: string | null } & Omit<LucideProps, "name">) {
  const Cmp = (name && registry[name]) || Sparkles;
  return <Cmp {...props} />;
}
