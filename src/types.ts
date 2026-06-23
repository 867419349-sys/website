/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface TimelineItem {
  id: string;
  period: string;
  organization: string;
  role: string;
  description: string;
}

export interface HighlightItem {
  id: string;
  title: string;
  description: string;
}

export interface SkillBadge {
  name: string;
  group: string;
}

export interface SkillCategory {
  id: string;
  category: string;
  skills: string[];
  badges: SkillBadge[];
}

export interface ArticleItem {
  id: string;
  title: string;
  date: string;
  category: string;
  image: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}
