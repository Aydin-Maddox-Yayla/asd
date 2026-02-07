
export interface BotCommand {
  id: string;
  trigger: string;
  description: string;
  action: string;
}

export type BotPersonality = 'freundlich' | 'formell' | 'humorvoll' | 'sarkastisch' | 'minimalistisch';
export type InteractionStyle = 'reaktiv' (antwortet nur auf Befehle) | 'proaktiv' (grüßt User, sendet News, etc.);

export interface BotConfig {
  name: string;
  platform: 'Discord' | 'Telegram' | 'Slack' | 'Twitch';
  personality: BotPersonality;
  interactionStyle: string;
  features: string;
  commands: BotCommand[];
  language: 'JavaScript' | 'TypeScript' | 'Python';
}

export interface GenerationResult {
  code: string;
  readme: string;
  packageJson: string;
}
