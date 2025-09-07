'use client';

import { Brain, Search, FileText, ShieldCheck, ArrowUpRight, Bot, X, GraduationCap, Eye } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useRouter } from 'next/navigation';
import { GithubLogo, XLogo } from '@phosphor-icons/react';
import { Badge } from '@/components/ui/badge';
import {
  ProAccordion,
  ProAccordionItem,
  ProAccordionTrigger,
  ProAccordionContent,
} from '@/components/ui/pro-accordion';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useGitHubStars } from '@/hooks/use-github-stars';
import { models } from '@/ai/providers';
import { VercelLogo } from '@/components/logos/vercel-logo';
import { ExaLogo } from '@/components/logos/exa-logo';
import { ElevenLabsLogo } from '@/components/logos/elevenlabs-logo';
import { LOOKOUT_LIMITS } from '@/app/lookout/constants';
import { PRICING } from '@/lib/constants';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';

import { ThemeSwitcher } from '@/components/theme-switcher';
import { SciraLogo } from '@/components/logos/scira-logo';

export default function AboutPage() {
  const router = useRouter();
  const [showTermsDialog, setShowTermsDialog] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showCryptoAlert, setShowCryptoAlert] = useState(true);
  const { data: githubStars, isLoading: isLoadingStars } = useGitHubStars();

  useEffect(() => {
    const hasAcceptedTerms = localStorage.getItem('hasAcceptedTerms');
    if (!hasAcceptedTerms) {
      setShowTermsDialog(true);
    }

    const hasDismissedCryptoAlert = localStorage.getItem('hasDismissedCryptoAlert');
    if (hasDismissedCryptoAlert) {
      setShowCryptoAlert(false);
    }
  }, []);

  const handleAcceptTerms = () => {
    if (acceptedTerms) {
      setShowTermsDialog(false);
      localStorage.setItem('hasAcceptedTerms', 'true');
    }
  };

  const handleDismissCryptoAlert = () => {
    setShowCryptoAlert(false);
    localStorage.setItem('hasDismissedCryptoAlert', 'true');
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const query = formData.get('query')?.toString();
    if (query) {
      router.push(`/?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Crypto Disclaimer Alert */}
      {showCryptoAlert && (
        <div className="sticky top-0 z-50 border-b border-border bg-amber-50 dark:bg-amber-950/20">
          <Alert className="border-0 rounded-none bg-transparent">
            <AlertDescription className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
                <ShieldCheck className="h-4 w-4" />
                <span className="text-sm font-medium">
                  Vega не связана ни с какими криптовалютными токенам или монетами, фондовыми компаниями или владельцами валют. Мы — исключительно AI-чат и поиск!
                </span>
              </div>
              <button
                onClick={handleDismissCryptoAlert}
                className="text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-200 transition-colors"
                aria-label="Dismiss alert"
              >
                <X className="h-4 w-4" />
              </button>
            </AlertDescription>
          </Alert>
        </div>
      )}
      {/* Terms Dialog */}
      <Dialog open={showTermsDialog} onOpenChange={setShowTermsDialog}>
        <DialogContent className="sm:max-w-[500px] p-0 bg-background border border-border">
          <div className="p-6 border-b border-border">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-primary">
                <FileText className="size-5" />
                Условия и конфиденциальность
              </DialogTitle>
              <DialogDescription className="text-muted-foreground mt-2">
                Пожалуйста, ознакомьтесь с нашими Условиями сервиса и Политикой обработки персональных данных.
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="px-6 py-5 space-y-5 max-h-[300px] overflow-y-auto">
            <div className="space-y-2">
              <h3 className="text-sm font-medium flex items-center gap-2">
                <ShieldCheck className="size-4 text-primary" />
                Условия обслуживания
              </h3>
              <p className="text-xs text-muted-foreground">
                Используя Vega, вы соглашаетесь с нашими Условиями сервиса, которые определяют правила использования нашей платформы.
              </p>
              <Link href="/terms" className="text-xs text-primary hover:underline inline-flex items-center">
                Прочитать полные Условия сервиса
                <ArrowUpRight className="size-3 ml-1" />
              </Link>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium flex items-center gap-2">
                <ShieldCheck className="size-4 text-primary" />
                Политика обработки персональных данных
              </h3>
              <p className="text-xs text-muted-foreground">
                Наша Политика конфиденциальности описывает, как мы собираем, используем и защищаем вашу личную информацию.
              </p>
              <Link href="/privacy-policy" className="text-xs text-primary hover:underline inline-flex items-center">
                Прочитать полную Политику обработки персональных данных
                <ArrowUpRight className="size-3 ml-1" />
              </Link>
            </div>
          </div>

          <div className="px-6 pt-1 pb-4">
            <div className="flex items-start space-x-3 p-3 rounded-md bg-accent/50 border border-border">
              <Checkbox
                id="terms"
                checked={acceptedTerms}
                onCheckedChange={() => setAcceptedTerms(!acceptedTerms)}
                className="mt-0.5"
              />
              <label htmlFor="terms" className="text-sm font-medium cursor-pointer">
                Я согласен с Условиями обслуживания и Политикой обработки персональных данных
              </label>
            </div>
          </div>

          <DialogFooter className="p-6 pt-2">
            <Button onClick={handleAcceptTerms} disabled={!acceptedTerms} className="w-full">
              Продолжить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Navigation */}
      <header className="sticky top-0 z-50 backdrop-blur-lg bg-background/80 border-b border-border/50">
        <div className="container max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative">
                <SciraLogo className="size-8 transition-transform group-hover:scale-110" />
              </div>
              <span className="text-xl font-bold tracking-tight">Vega</span>
            </Link>

            {/* Desktop Navigation */}
            <NavigationMenu className="hidden md:flex">
              <NavigationMenuList>
                <NavigationMenuItem>
                  <Link href="/" passHref>
                    <NavigationMenuLink className={navigationMenuTriggerStyle()}>Поиск</NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link href="/pricing" passHref>
                    <NavigationMenuLink className={navigationMenuTriggerStyle()}>Цены</NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link href="/terms" passHref>
                    <NavigationMenuLink className={navigationMenuTriggerStyle()}>Условия</NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link href="/privacy-policy" passHref>
                    <NavigationMenuLink className={navigationMenuTriggerStyle()}>Конфиденциальность</NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>

            {/* Right Side Actions */}
            <div className="flex items-center gap-4">
              <Link
                href="https://git.new/scira"
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                <GithubLogo className="h-4 w-4" />
                <span className="hidden sm:inline">
                  {!isLoadingStars && githubStars && (
                    <Badge variant="secondary" className="ml-1 text-xs">
                      {githubStars > 1000 ? `${(githubStars / 1000).toFixed(1)}k` : githubStars}
                    </Badge>
                  )}
                </span>
              </Link>

              <div className="w-px h-6 bg-border hidden sm:block" />

              <ThemeSwitcher />

              <div className="w-px h-6 bg-border hidden sm:block" />

              <Button
                size="sm"
                className="bg-primary text-primary-foreground hover:bg-primary/90 font-medium"
                onClick={() => router.push('/')}
              >
                Попробовать бесплатно
              </Button>
            </div>
          </div>
        </div>
      </header>
      {/* Hero Section */}
      <section className="py-24 px-4">
        <div className="container max-w-4xl mx-auto text-center space-y-12">
          <div className="space-y-6">
            <div className="flex items-center justify-center gap-3 mb-8">
              <SciraLogo className="size-12" />
              <h1 className="text-4xl font-bold">Vega</h1>
            </div>

            <h2 className="text-2xl md:text-3xl font-semibold text-foreground max-w-3xl mx-auto">
              Поисковая система с открытым исходным кодом на базе AI
            </h2>

            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Чистая, минималистичная поисковая система с возможностями RAG и поискового обоснования. Получайте точные, актуальные ответы из надежных источников.
            </p>
          </div>

          {/* Search Interface */}
          <div className="max-w-2xl mx-auto">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <input
                  type="text"
                  name="query"
                  placeholder="Спросите что угодно..."
                  className="w-full h-14 px-6 pr-20 text-base rounded-lg bg-background border-2 border-border focus:border-primary focus:outline-none transition-colors placeholder:text-muted-foreground"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-2 h-10 px-5 rounded-md bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
                >
                  Поиск
                </button>
              </div>
            </form>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="https://t.me/getmyai"
              className="inline-flex h-11 items-center gap-2 px-6 rounded-lg bg-foreground text-background hover:bg-foreground/90 transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              <GithubLogo className="h-4 w-4" />
              <span className="font-medium">Посмотреть исходный код</span>
              {!isLoadingStars && githubStars && (
                <Badge variant="secondary" className="ml-2">
                  {githubStars.toLocaleString()}
                </Badge>
              )}
            </Link>
            <Link
              href="/"
              className="inline-flex h-11 items-center gap-2 px-6 rounded-lg border-2 border-border hover:border-primary hover:bg-accent transition-colors"
            >
              <span className="font-medium">Попробовать сейчас</span>
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
      {/* Stats Section */}
      <section className="py-16 px-4 border-y border-border">
        <div className="container max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="space-y-2">
              <div className="text-3xl font-bold">1M+</div>
              <p className="text-muted-foreground">Ответов на вопросы</p>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold">100K+</div>
              <p className="text-muted-foreground">Активных пользователей</p>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold">
                {isLoadingStars ? (
                  <span className="animate-pulse">...</span>
                ) : (
                  `${githubStars?.toLocaleString() || '9,000'}+`
                )}
              </div>
              <p className="text-muted-foreground">Звезд на GitHub</p>
            </div>
          </div>
        </div>
      </section>
      {/* Awards Section */}
      <section className="py-16 px-4">
        <div className="container max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-semibold mb-4">Признание и награды</h2>
            <p className="text-muted-foreground">Признано ведущими платформами и сообществами</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="bg-card border border-border rounded-lg p-8 text-center">
              <div className="mb-4">
                <Image
                  src="https://cdn.prod.website-files.com/657b3d8ca1cab4015f06c850/680a4d679063da73487739e0_No1prgold-caps-removebg-preview.png"
                  alt="Tiny Startups #1 Product"
                  width={64}
                  height={64}
                  className="size-16 object-contain mx-auto"
                />
              </div>
              <h3 className="font-semibold mb-1">Продукт №1 недели</h3>
              <p className="text-sm text-muted-foreground">Tiny Startups</p>
            </div>

            <div className="bg-card border border-border rounded-lg p-8 text-center">
              <div className="mb-4">
                <Image
                  src="/Winner-Medal-Weekly.svg"
                  alt="Peerlist #1 Project"
                  width={64}
                  height={64}
                  className="h-16 w-16 object-contain mx-auto"
                />
              </div>
              <h3 className="font-semibold mb-1">Проект №1 недели</h3>
              <p className="text-sm text-muted-foreground">Peerlist</p>
            </div>
          </div>

          <div className="text-center">
            <a
              href="https://openalternative.co/scira?utm_source=openalternative&utm_medium=badge&utm_campaign=embed&utm_content=tool-scira"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block"
            >
              <Image
                src="https://openalternative.co/scira/badge.svg?theme=dark&width=200&height=50"
                width={200}
                height={50}
                alt="Vega badge"
                className="mx-auto"
              />
            </a>
          </div>
        </div>
      </section>
      {/* Features Section */}
      <section className="py-20 px-4 bg-muted/30">
        
        <div className="container max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-2xl font-semibold mb-4">Ключевые особенности</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Built with modern AI technology to provide accurate and reliable search results
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Brain className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Продвинутые модели ИИ</h3>
              <p className="text-muted-foreground">
                Использует несколько передовых моделей ИИ для точного понимания и ответа на сложные вопросы.
              </p>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Search className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Поиск в реальном времени</h3>
              <p className="text-muted-foreground">
                Объединяет RAG и поисковое обоснование для получения актуальной информации из надежных источников.
              </p>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Bot className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Открытый исходный код</h3>
              <p className="text-muted-foreground">
                Полностью открытый исходный код и прозрачность. Участвуйте в разработке или размещайте свой собственный экземпляр.
              </p>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Eye className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Автоматизация Vega</h3>
              <p className="text-muted-foreground">
                Планируйте автоматические поиски для отслеживания тенденций и получения регулярных обновлений по важным для вас темам.
              </p>
            </div>
          </div>
        </div>
      </section>
      {/* Technology Stack */}
      <section className="py-20 px-4">
        <div className="container max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-2xl font-semibold mb-4">Создано с лидерами индустрии</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Работает на передовых технологиях от ведущих компаний
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-card border border-border rounded-lg p-8 text-center">
              <div className="mb-6 flex justify-center">
                <VercelLogo />
              </div>
              <h3 className="text-lg font-semibold mb-2">Vercel AI SDK</h3>
              <p className="text-muted-foreground text-sm">Продвинутый фреймворк ИИ, обеспечивающий интеллектуальные ответы</p>
            </div>

            <div className="bg-card border border-border rounded-lg p-8 text-center">
              <div className="mb-6 flex justify-center">
                <ExaLogo />
              </div>
              <h3 className="text-lg font-semibold mb-2">Exa Search</h3>
              <p className="text-muted-foreground text-sm">Поисковое обоснование в реальном времени с надежными источниками</p>
            </div>

            <div className="bg-card border border-border rounded-lg p-8 text-center">
              <div className="mb-6 flex justify-center">
                <ElevenLabsLogo />
              </div>
              <h3 className="text-lg font-semibold mb-2">ElevenLabs Voice</h3>
              <p className="text-muted-foreground text-sm">Естественный синтез голоса с человеческим качеством</p>
            </div>
          </div>
        </div>
      </section>
      {/* Featured on Vercel Section */}
      <section className="py-16 px-4 border-y border-border">
        <div className="container max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold">Представлено в блоге Vercel</h2>
              <p className="text-muted-foreground leading-relaxed">
                Признаны за наше инновационное использование технологии ИИ и вклад в сообщество разработчиков через
                Vercel AI SDK.
              </p>
              <Link
                href="https://vercel.com/blog/ai-sdk-4-1"
                className="inline-flex items-center gap-2 font-medium text-primary hover:text-primary/80 transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                Прочитать статью
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="relative aspect-video rounded-lg overflow-hidden border border-border">
              <Image src="/vercel-featured.png" alt="Featured on Vercel Blog" fill className="object-cover" />
            </div>
          </div>
        </div>
      </section>
      {/* Models Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-2xl font-semibold mb-4">Доступные модели ИИ</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Выбирайте из множества моделей, каждая из которых оптимизирована для разных задач
            </p>
          </div>

          <div className="bg-card rounded-lg border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-border">
                    <TableHead className="font-semibold">Модель</TableHead>
                    <TableHead className="font-semibold">Описание</TableHead>
                    <TableHead className="font-semibold">Категория</TableHead>
                    <TableHead className="font-semibold">Возможности</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {models.map((model: any) => (
                    <TableRow key={model.value} className="border-b border-border/50">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{model.label}</span>
                          {model.pro && (
                            <Badge variant="secondary" className="text-xs">
                              Pro
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{model.description}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {model.category}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          {model.vision && (
                            <Badge variant="outline" className="text-xs">
                              Vision
                            </Badge>
                          )}
                          {model.reasoningText && (
                            <Badge variant="outline" className="text-xs">
                              Reasoning
                            </Badge>
                          )}
                          {model.pdf && (
                            <Badge variant="outline" className="text-xs">
                              PDF
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </section>
      {/* Pricing Section */}
      <section className="py-20 px-4">
        <div className="container max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-2xl font-medium mb-4 tracking-tight">Цены</h2>
            <p className="text-muted-foreground/80 max-w-lg mx-auto">Простое, прозрачное ценообразование для всех</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Free Plan */}
            <div className="bg-background/50 border border-border/50 rounded-xl p-8 hover:border-border/80 transition-colors flex flex-col">
              <div className="mb-8">
                <h3 className="text-xl font-medium mb-2">Бесплатно</h3>
                <p className="text-muted-foreground/70 mb-4">Начните с основных функций</p>
                <div className="space-y-1">
                  <div className="flex items-baseline">
                    <span className="text-3xl font-light tracking-tight">$0</span>
                    <span className="text-muted-foreground/70 ml-2">/month</span>
                  </div>
                  <div className="flex items-baseline">
                    <span className="text-2xl font-medium text-muted-foreground/60">₹0</span>
                    <span className="text-muted-foreground/60 ml-2 text-sm">/month</span>
                  </div>
                </div>
              </div>

              <ul className="space-y-3 flex-1 mb-8">
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary/60 mt-2 flex-shrink-0"></div>
                  <span className="text-muted-foreground">10 поисков в день</span>
                
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary/60 mt-2 flex-shrink-0"></div>
                  <span className="text-muted-foreground">5 экстремальных поисков в месяц</span>
                
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary/60 mt-2 flex-shrink-0"></div>
                  <span className="text-muted-foreground">Базовые модели ИИ</span>
                
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary/60 mt-2 flex-shrink-0"></div>
                  <span className="text-muted-foreground">История поиска</span>
                
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary/60 mt-2 flex-shrink-0"></div>
                  <span className="text-muted-foreground">Нет доступа к Lookout</span>
                
                </li>
              </ul>

              <Button
                variant="outline"
                className="w-full border-border/60 hover:border-border"
                onClick={() => router.push('/')}
              >
                Начать
              </Button>
            
            </div>

            {/* Ultra Plan */}
            <div className="bg-background border border-primary/50 rounded-xl p-8 relative hover:border-primary/70 transition-colors flex flex-col">
              <div className="absolute -top-px left-8 right-8 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent"></div>

              <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-medium">Ультра</h3>
                  
                  <span className="text-xs font-medium text-orange-600/80 bg-orange-600/10 px-2.5 py-1 rounded-full">
                    Премиум
                  </span>
                
                </div>
                <p className="text-muted-foreground/70 mb-4">Максимальная мощность для профессионалов</p>
                
                <div className="space-y-1">
                  <div className="flex items-baseline">
                    <span className="text-3xl font-light tracking-tight">₹{PRICING.ULTRA_MONTHLY_INR}</span>
                    <span className="text-muted-foreground/70 ml-2">/месяц</span>
                  </div>
                  <div className="flex items-baseline">
                    <span className="text-2xl font-medium text-muted-foreground/60">${PRICING.ULTRA_MONTHLY}</span>
                    <span className="text-muted-foreground/60 ml-2 text-sm">USD</span>
                  </div>
                </div>
              </div>

              <ul className="space-y-3 flex-1 mb-8">
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-2 flex-shrink-0"></div>
                  <span className="text-muted-foreground">Все в Pro</span>
                
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-2 flex-shrink-0"></div>
                  <span className="text-muted-foreground">Премиум модели ИИ (GPT-5, Claude Opus)</span>
                
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-2 flex-shrink-0"></div>
                  <span className="text-muted-foreground">Расширенные возможности рассуждения</span>
                
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-2 flex-shrink-0"></div>
                  <span className="text-muted-foreground">Более быстрое время ответа</span>
                
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-2 flex-shrink-0"></div>
                  <span className="text-muted-foreground">Премиум поддержка</span>
                
                </li>
              </ul>

              <Button className="w-full bg-orange-600 hover:bg-orange-700" onClick={() => router.push('/pricing')}>
                Обновить до Ультра
              </Button>
            
            </div>

            {/* Pro Plan */}
            <div className="bg-background border border-primary/30 rounded-xl p-8 relative hover:border-primary/50 transition-colors flex flex-col">
              <div className="absolute -top-px left-8 right-8 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent"></div>

              <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-medium">Pro</h3>
                  
                  <span className="text-xs font-medium text-primary/80 bg-primary/10 px-2.5 py-1 rounded-full">
                    Популярный
                  </span>
                
                </div>
                <p className="text-muted-foreground/70 mb-4">Все, что вам нужно для серьезной работы</p>
                
                <div className="space-y-1">
                  <div className="flex items-baseline">
                    <span className="text-3xl font-light tracking-tight">₹{PRICING.PRO_MONTHLY_INR}</span>
                    <span className="text-muted-foreground/70 ml-2">/месяц</span>
                  </div>
                  <div className="flex items-baseline">
                    <span className="text-2xl font-medium text-muted-foreground/60">${PRICING.PRO_MONTHLY}</span>
                    <span className="text-muted-foreground/60 ml-2 text-sm">USD</span>
                  </div>
                </div>
              </div>

              <ul className="space-y-3 flex-1 mb-8">
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                  <span className="text-muted-foreground">Неограниченное количество поисков</span>
                
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                  <span className="text-muted-foreground">Продвинутые модели ИИ</span>
                
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                  <span className="text-muted-foreground">Анализ PDF-документов</span>
                
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                  <span className="text-muted-foreground">Приоритетная поддержка</span>
                
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                  <span className="text-muted-foreground">
                    Автоматизация Vega ({LOOKOUT_LIMITS.TOTAL_LOOKOUTS} автоматических поисков)
                  </span>
                
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                  <span className="text-muted-foreground">До {LOOKOUT_LIMITS.DAILY_LOOKOUTS} ежедневных проверок</span>
                
                </li>
              </ul>

              <Button className="w-full" onClick={() => router.push('/pricing')}>
                Обновить до Pro
              </Button>
            
            </div>
          </div>

          {/* Student Discount */}
          <div className="max-w-2xl mx-auto bg-muted/20 border border-border/40 rounded-xl p-6 mt-8">
            
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-primary/5 rounded-lg flex items-center justify-center flex-shrink-0">
                <GraduationCap className="h-5 w-5 text-primary/70" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium mb-2">Цены для студентов</h3>
                
                <p className="text-muted-foreground/80 mb-4 text-sm">
                  Студенты могут получить доступ к Pro функциям за ₹500/месяц ($5/месяц). Свяжитесь с нами для подтверждения студенческого статуса.
                </p>
                
                <a
                  href="mailto:mail@vega.chat?subject=Student%20Discount%20Request"
                  className="inline-flex items-center justify-center h-9 px-4 rounded-md border border-border/60 bg-background hover:bg-accent/50 text-sm font-medium transition-colors"
                >
                  Подать заявку на студенческую скидку
                </a>
              
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* FAQ Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-2xl font-semibold mb-4">Часто задаваемые вопросы</h2>
            
            <p className="text-muted-foreground max-w-2xl mx-auto">Найдите ответы на часто задаваемые вопросы о Vega</p>
          
          </div>

          <ProAccordion type="single" collapsible className="w-full">
            <ProAccordionItem value="item-1">
              
              <ProAccordionTrigger>Что такое Vega?</ProAccordionTrigger>
              
              <ProAccordionContent>
                Vega — это поисковая система с открытым исходным кодом на базе ИИ, которая использует RAG (Retrieval-Augmented Generation) и
                поисковое обоснование для предоставления точных, актуальных ответов из надежных источников.
              </ProAccordionContent>
            
            </ProAccordionItem>

            <ProAccordionItem value="item-2">
              
              <ProAccordionTrigger>В чем разница между планами Free и Pro?</ProAccordionTrigger>
              
              <ProAccordionContent>
                Бесплатный план предлагает ограниченное количество ежедневных поисков с базовыми моделями ИИ, в то время как план Pro ($15/месяц)
                предоставляет неограниченное количество поисков, доступ ко всем моделям ИИ, анализ PDF-документов и приоритетную поддержку.
              </ProAccordionContent>
            
            </ProAccordionItem>

            <ProAccordionItem value="item-3">
              
              <ProAccordionTrigger>Есть ли скидка для студентов?</ProAccordionTrigger>
              
              <ProAccordionContent>
                Да, студенты могут получить скидку $10 на план Pro, что снижает его стоимость до $5/месяц. Отправьте электронное письмо на mail@vega.chat с вашим
                подтверждением студенческого статуса и кратким описанием того, как вы используете Vega.
              </ProAccordionContent>
            
            </ProAccordionItem>

            <ProAccordionItem value="item-4">
              
              <ProAccordionTrigger>Могу ли я отменить подписку в любое время?</ProAccordionTrigger>
              
              <ProAccordionContent>
                Да, вы можете отменить подписку Pro в любое время. Ваши преимущества будут действовать до конца текущего расчетного периода.
                текущего расчетного периода.
              </ProAccordionContent>
            
            </ProAccordionItem>

            <ProAccordionItem value="item-5">
              
              <ProAccordionTrigger>Какие модели ИИ использует Vega?</ProAccordionTrigger>
              
              <ProAccordionContent>
                Vega использует ряд передовых моделей ИИ, включая Grok, Claude, OpenAI GPT, Gemini и другие, чтобы предоставлять
                наилучшие ответы на различные типы запросов.
              </ProAccordionContent>
            
            </ProAccordionItem>

            <ProAccordionItem value="item-6">
              
              <ProAccordionTrigger>Как Vega обеспечивает точность информации?</ProAccordionTrigger>
              
              <ProAccordionContent>
                Vega сочетает технологию RAG с поисковым обоснованием для получения информации из надежных источников и
                проверки ее перед предоставлением ответов. Каждый ответ включает указание источника для прозрачности.
              </ProAccordionContent>
            
            </ProAccordionItem>
          </ProAccordion>

          <div className="text-center mt-12">
            
            <p className="text-muted-foreground">
              Есть еще вопросы?{' '}
              <a href="mailto:mail@vega.chat" className="text-primary hover:text-primary/80 transition-colors">
                Свяжитесь с нами
              </a>
            
            </p>
          </div>
        </div>
      </section>
      {/* Footer */}
      <footer className="border-t border-border py-12 px-4">
        
        <div className="container max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <SciraLogo className="size-8" />
              <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} Vega. Все права защищены.</p>
            
            </div>

            <div className="flex items-center gap-6">
              <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Условия
              </Link>
              
              <Link
                href="/privacy-policy"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Политика конфиденциальности
              </Link>
              
              <div className="flex items-center gap-2">
                <Link
                  href="https://x.com/sciraai"
                  className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <XLogo className="h-4 w-4" />
                </Link>
                
                <Link
                  href="https://git.new/scira"
                  className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <GithubLogo className="h-4 w-4" />
                </Link>
              
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
