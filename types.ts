
export interface BotCommand {
  id: string;
  trigger: string;
  description: string;
  action: string;
}

export type BotPersonality = 'freundlich' | 'formell' | 'humorvoll' | 'sarkastisch' | 'minimalistisch';

// Fix: Corrected syntax for InteractionStyle union type and moved descriptions to comments
export type InteractionStyle = 'reaktiv' | 'proaktiv'; // reaktiv (antwortet nur auf Befehle) | proaktiv (grüßt User, sendet News, etc.)

export interface BotConfig {
  name: string;
  platform: 'Discord' | 'Telegram' | 'Slack' | 'Twitch';
  personality: BotPersonality;
  // Fix: Use the InteractionStyle type instead of plain string
  interactionStyle: InteractionStyle;
  features: string;
  commands: BotCommand[];
  language: 'JavaScript' | 'TypeScript' | 'Python';
}

export interface GenerationResult {
  code: string;
  readme: string;
  packageJson: string;
}