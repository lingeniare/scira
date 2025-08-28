export const frequencyOptions = [
  { value: 'once', label: 'Однократно' },
  { value: 'daily', label: 'Ежедневно' },
  { value: 'weekly', label: 'Еженедельно' },
  { value: 'monthly', label: 'Ежемесячно' },
];

export const timezoneOptions = [
  // UTC
  { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },

  // North America
  { value: 'America/New_York', label: 'Eastern Time (New York)' },
  { value: 'America/Chicago', label: 'Central Time (Chicago)' },
  { value: 'America/Denver', label: 'Mountain Time (Denver)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (Los Angeles)' },
  { value: 'America/Anchorage', label: 'Alaska Time (Anchorage)' },
  { value: 'Pacific/Honolulu', label: 'Hawaii Time (Honolulu)' },
  { value: 'America/Toronto', label: 'Eastern Time (Toronto)' },
  { value: 'America/Vancouver', label: 'Pacific Time (Vancouver)' },
  { value: 'America/Mexico_City', label: 'Central Time (Mexico City)' },

  // Europe
  { value: 'Europe/London', label: 'Greenwich Mean Time (London)' },
  { value: 'Europe/Paris', label: 'Central European Time (Paris)' },
  { value: 'Europe/Berlin', label: 'Central European Time (Berlin)' },
  { value: 'Europe/Rome', label: 'Central European Time (Rome)' },
  { value: 'Europe/Madrid', label: 'Central European Time (Madrid)' },
  { value: 'Europe/Amsterdam', label: 'Central European Time (Amsterdam)' },
  { value: 'Europe/Brussels', label: 'Central European Time (Brussels)' },
  { value: 'Europe/Vienna', label: 'Central European Time (Vienna)' },
  { value: 'Europe/Zurich', label: 'Central European Time (Zurich)' },
  { value: 'Europe/Stockholm', label: 'Central European Time (Stockholm)' },
  { value: 'Europe/Helsinki', label: 'Eastern European Time (Helsinki)' },
  { value: 'Europe/Moscow', label: 'Moscow Standard Time (Moscow)' },
  { value: 'Europe/Istanbul', label: 'Turkey Time (Istanbul)' },
  { value: 'Europe/Athens', label: 'Eastern European Time (Athens)' },

  // Asia
  { value: 'Asia/Tokyo', label: 'Japan Standard Time (Tokyo)' },
  { value: 'Asia/Shanghai', label: 'China Standard Time (Shanghai)' },
  { value: 'Asia/Hong_Kong', label: 'Hong Kong Time (Hong Kong)' },
  { value: 'Asia/Singapore', label: 'Singapore Standard Time (Singapore)' },
  { value: 'Asia/Seoul', label: 'Korea Standard Time (Seoul)' },
  { value: 'Asia/Bangkok', label: 'Indochina Time (Bangkok)' },
  { value: 'Asia/Jakarta', label: 'Western Indonesia Time (Jakarta)' },
  { value: 'Asia/Manila', label: 'Philippine Standard Time (Manila)' },
  { value: 'Asia/Kuala_Lumpur', label: 'Malaysia Time (Kuala Lumpur)' },
  { value: 'Asia/Taipei', label: 'Taipei Standard Time (Taipei)' },
  { value: 'Asia/Kolkata', label: 'India Standard Time (Kolkata/Mumbai)' },
  { value: 'Asia/Dubai', label: 'Gulf Standard Time (Dubai)' },
  { value: 'Asia/Riyadh', label: 'Arabia Standard Time (Riyadh)' },
  { value: 'Asia/Tehran', label: 'Iran Standard Time (Tehran)' },
  { value: 'Asia/Jerusalem', label: 'Israel Standard Time (Jerusalem)' },

  // Australia & Oceania
  { value: 'Australia/Sydney', label: 'Australian Eastern Time (Sydney)' },
  { value: 'Australia/Melbourne', label: 'Australian Eastern Time (Melbourne)' },
  { value: 'Australia/Brisbane', label: 'Australian Eastern Time (Brisbane)' },
  { value: 'Australia/Perth', label: 'Australian Western Time (Perth)' },
  { value: 'Australia/Adelaide', label: 'Australian Central Time (Adelaide)' },
  { value: 'Australia/Darwin', label: 'Australian Central Time (Darwin)' },
  { value: 'Pacific/Auckland', label: 'New Zealand Time (Auckland)' },
  { value: 'Pacific/Fiji', label: 'Fiji Time (Fiji)' },

  // Africa
  { value: 'Africa/Cairo', label: 'Eastern European Time (Cairo)' },
  { value: 'Africa/Johannesburg', label: 'South Africa Standard Time (Johannesburg)' },
  { value: 'Africa/Lagos', label: 'West Africa Time (Lagos)' },
  { value: 'Africa/Nairobi', label: 'East Africa Time (Nairobi)' },
  { value: 'Africa/Casablanca', label: 'Western European Time (Casablanca)' },

  // South America
  { value: 'America/Sao_Paulo', label: 'Brasilia Time (São Paulo)' },
  { value: 'America/Buenos_Aires', label: 'Argentina Time (Buenos Aires)' },
  { value: 'America/Santiago', label: 'Chile Time (Santiago)' },
  { value: 'America/Lima', label: 'Peru Time (Lima)' },
  { value: 'America/Bogota', label: 'Colombia Time (Bogotá)' },
  { value: 'America/Caracas', label: 'Venezuela Time (Caracas)' },
];

export const allExampleLookouts = [
  {
    title: 'Ежедневная сводка новостей ИИ',
    prompt:
      'Суммируйте самые важные разработки в области ИИ и технологий за последние 24 часа, включая запуски новых продуктов, раунды финансирования и прорывные исследовательские работы. Сосредоточьтесь на практических применениях и влиянии на индустрию. Включите любые крупные объявления от OpenAI, Google, Microsoft, Meta и развивающихся ИИ-стартапов.',
    frequency: 'daily',
    time: '09:00',
    timezone: 'America/New_York',
  },
  {
    title: 'Еженедельный анализ криптовалютного рынка',
    prompt:
      'Предоставьте комплексный анализ криптовалютного рынка за прошедшую неделю. Включите движения цен основных монет (BTC, ETH, SOL), значимые новостные события, регулятивные обновления и новые тренды в DeFi и NFT. Выделите любые крупные институциональные принятия, регулятивные изменения или события, влияющие на рынок.',
    frequency: 'weekly',
    time: '18:00',
    timezone: 'UTC',
    dayOfWeek: '0', // Sunday
  },
  {
    title: 'Ежемесячный отчет по климатическим технологиям',
    prompt:
      'Исследуйте и суммируйте последние разработки в области климатических технологий и устойчивости. Охватите новые проекты возобновляемой энергии, инновации в области улавливания углерода, раунды финансирования зеленых технологий и изменения политики, влияющие на сектор климатических технологий. Включите обновления по темпам принятия чистой энергии и прорывным технологиям.',
    frequency: 'monthly',
    time: '10:00',
    timezone: 'Europe/London',
  },
  {
    title: 'Ежедневная сводка фондового рынка',
    prompt:
      'Предоставьте комплексную сводку сегодняшних показателей фондового рынка. Включите движения основных индексов (S&P 500, NASDAQ, DOW), заметные объявления о доходах, значимые корпоративные новости и любые экономические индикаторы, которые повлияли на рынки. Сосредоточьтесь на практических выводах для инвесторов.',
    frequency: 'daily',
    time: '16:30',
    timezone: 'America/New_York',
  },
  {
    title: 'Еженедельная сводка финансирования стартапов',
    prompt:
      'Составьте подробный отчет о всех значимых раундах финансирования стартапов за прошедшую неделю. Включите раунды Series A, B, C и заметное посевное финансирование. Сосредоточьтесь на развивающихся секторах, таких как ИИ, финтех, здравоохранение и климатические технологии. Предоставьте выводы о трендах финансирования и настроениях инвесторов.',
    frequency: 'weekly',
    time: '11:00',
    timezone: 'America/Los_Angeles',
    dayOfWeek: '1', // Monday
  },
  {
    title: 'Ежедневные поглощения и слияния в сфере технологий',
    prompt:
      'Отслеживайте и сообщайте о любых поглощениях технологических компаний, слияниях или стратегических партнерствах, объявленных за последние 24 часа. Включите стоимость сделок, стратегическое обоснование и потенциальное влияние на рынок. Охватите как публичные компании, так и заметные частные транзакции.',
    frequency: 'daily',
    time: '14:00',
    timezone: 'Europe/Berlin',
  },
  {
    title: 'Еженедельные новости игровой индустрии',
    prompt:
      'Суммируйте самые важные события в игровой индустрии за прошедшую неделю. Включите новые релизы игр, поглощения студий, обновления платформ, новости киберспорта и новые игровые технологии, такие как VR/AR. Сосредоточьтесь на трендах индустрии и крупных бизнес-событиях.',
    frequency: 'weekly',
    time: '20:00',
    timezone: 'Asia/Tokyo',
    dayOfWeek: '5', // Friday
  },
  {
    title: 'Ежемесячный анализ рынка SaaS',
    prompt:
      'Предоставьте углубленный анализ трендов рынка SaaS за прошедший месяц. Включите запуски новых продуктов, изменения цен, консолидацию рынка и новые категории SaaS. Проанализируйте метрики роста, тренды привлечения клиентов и изменения в конкурентной среде.',
    frequency: 'monthly',
    time: '08:00',
    timezone: 'America/Chicago',
  },
  {
    title: 'Ежедневные регулятивные и политические обновления',
    prompt:
      'Отслеживайте и суммируйте важные регулятивные и политические изменения, влияющие на технологический сектор за последние 24 часа. Включите обновления по законам о конфиденциальности данных, антимонопольным расследованиям, регулированию ИИ и международной торговой политике, влияющей на технологические компании.',
    frequency: 'daily',
    time: '07:00',
    timezone: 'America/New_York',
  },
  {
    title: 'Еженедельные инциденты кибербезопасности',
    prompt:
      'Составьте комплексный отчет о значимых инцидентах кибербезопасности, утечках и уязвимостях, обнаруженных за прошедшую неделю. Включите оценку воздействия, затронутые компании, векторы атак и рекомендуемые меры безопасности. Сосредоточьтесь на извлеченных уроках и стратегиях предотвращения.',
    frequency: 'weekly',
    time: '15:30',
    timezone: 'UTC',
    dayOfWeek: '3', // Wednesday
  },
  {
    title: 'Ежемесячные тренды технологий недвижимости',
    prompt:
      'Проанализируйте последние тренды в технологиях недвижимости за прошедший месяц. Охватите инновации PropTech, технологии виртуальных туров, применение блокчейна в недвижимости и тренды цифровизации рынка. Включите финансовую активность и запуски крупных платформ.',
    frequency: 'monthly',
    time: '12:00',
    timezone: 'America/Los_Angeles',
  },
  {
    title: 'Ежедневные новости инноваций в здравоохранении',
    prompt:
      'Отслеживайте и сообщайте о прорывных инновациях в здравоохранении, одобрениях медицинских устройств, развитии телемедицины и финансировании цифрового здравоохранения за последние 24 часа. Включите регулятивные одобрения, результаты клинических испытаний и новые тренды в области здравоохранения.',
    frequency: 'daily',
    time: '11:30',
    timezone: 'America/New_York',
  },
];

/**
 * Get random examples from the full list
 */
export function getRandomExamples(count: number = 3) {
  const shuffled = [...allExampleLookouts].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

/**
 * Get 3 random examples for display
 */
export const exampleLookouts = getRandomExamples(3);

export const LOOKOUT_LIMITS = {
  TOTAL_LOOKOUTS: 10,
  DAILY_LOOKOUTS: 5,
} as const;

export const DEFAULT_FORM_VALUES = {
  FREQUENCY: 'daily',
  TIME: '09:00',
  TIMEZONE: 'UTC',
  DAY_OF_WEEK: '0', // Sunday
} as const;

export const dayOfWeekOptions = [
  { value: '0', label: 'Воскресенье' },
  { value: '1', label: 'Понедельник' },
  { value: '2', label: 'Вторник' },
  { value: '3', label: 'Среда' },
  { value: '4', label: 'Четверг' },
  { value: '5', label: 'Пятница' },
  { value: '6', label: 'Суббота' },
];
