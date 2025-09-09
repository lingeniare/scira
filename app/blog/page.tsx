'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { GithubLogo, XLogo } from '@phosphor-icons/react';
import { Badge } from '@/components/ui/badge';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import { ThemeSwitcher } from '@/components/theme-switcher';
import { SciraLogo } from '@/components/logos/scira-logo';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useGitHubStars } from '@/hooks/use-github-stars';
import { ChevronRight, Home, BookOpen } from 'lucide-react';

// Типы для постов
interface BlogPost {
  id: string
  date: string
  content: string
}

// Статические посты (добавляй новые сюда)
const posts: BlogPost[] = [
  {
    id: '3',
    date: '15 янв 2025',
    content: 'Сегодня запустил новый проект на Next.js 15. Невероятно, как быстро можно создать полноценное приложение с современным стеком. TypeScript + Tailwind делают разработку просто магической. Каждый день учусь чему-то новому в мире веб-разработки.'
  },
  {
    id: '2', 
    date: '14 янв 2025',
    content: 'Минимализм в дизайне — это не просто тренд, а философия. Убираешь всё лишнее и остаётся только суть. Как в коде: чем меньше строк, тем лучше читаемость. Простота — высшая форма сложности, как говорил да Винчи.'
  },
  {
    id: '1',
    date: '13 янв 2025', 
    content: 'Начинаю вести микроблог прямо в коде. Никаких баз данных, никаких сложностей — просто мысли в файле. Иногда самые простые решения оказываются самыми элегантными. Код как поэзия: каждая строчка должна иметь смысл.'
  }
]

export default function BlogPage() {
  const router = useRouter();
  const { data: githubStars, isLoading: isLoadingStars } = useGitHubStars();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
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
                  <Link href="/blog" passHref>
                    <NavigationMenuLink className={navigationMenuTriggerStyle()}>Блог</NavigationMenuLink>
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

      {/* Breadcrumb */}
      <div className="border-b border-border/50 bg-muted/30">
        <div className="container max-w-6xl mx-auto px-4 py-4">
          <nav className="flex items-center justify-center" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2 text-sm">
              <li>
                <Link 
                  href="/" 
                  className="flex items-center text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Home className="h-4 w-4 mr-1" />
                  Главная
                </Link>
              </li>
              <li className="flex items-center">
                <ChevronRight className="h-4 w-4 text-muted-foreground/60 mx-2" />
                <span className="font-medium text-foreground flex items-center">
                  <BookOpen className="h-4 w-4 mr-1" />
                  Блог
                </span>
              </li>
            </ol>
          </nav>
        </div>
      </div>

      {/* Заголовок страницы */}
      <div className="py-20 px-4 text-center relative overflow-hidden">
        {/* Декоративный фон */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-3xl mx-auto relative">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            <span>Новые статьи каждую неделю</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text">
            Блог
          </h1>
          
          <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            Мысли, идеи и обновления от команды Scira. Узнавайте о последних разработках в области ИИ и технологий поиска.
          </p>
          
          {/* Декоративные элементы */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <div className="w-12 h-px bg-gradient-to-r from-transparent to-primary/50" />
            <div className="w-2 h-2 bg-primary/60 rounded-full" />
            <div className="w-12 h-px bg-gradient-to-l from-transparent to-primary/50" />
          </div>
        </div>
      </div>

      {/* Лента постов */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="grid gap-8">
          {posts.map((post, index) => (
            <article key={post.id} className="group" style={{ animationDelay: `${index * 100}ms` }}>
              <div className="bg-card border border-border rounded-xl p-8 hover:shadow-xl hover:shadow-primary/10 transition-all duration-500 hover:border-primary/30 hover:-translate-y-1 relative overflow-hidden">
                {/* Декоративный градиент */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/50 via-accent/50 to-primary/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* Дата поста */}
                <div className="flex items-center mb-6">
                  <time className="text-sm font-medium text-primary bg-primary/10 px-4 py-2 rounded-full border border-primary/20 group-hover:bg-primary/20 transition-colors duration-300">
                    {post.date}
                  </time>
                  <div className="flex-1 ml-6 h-px bg-gradient-to-r from-border via-primary/20 to-transparent group-hover:from-primary/30 transition-colors duration-300"></div>
                </div>
                
                {/* Текст поста */}
                <div className="text-foreground leading-relaxed text-base space-y-4 relative">
                  <p className="group-hover:text-foreground/90 transition-colors duration-300">{post.content}</p>
                </div>
                
                {/* Декоративный элемент */}
                <div className="mt-8 pt-6 border-t border-border/50 group-hover:border-primary/20 transition-colors duration-300">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-sm text-muted-foreground group-hover:text-foreground/80 transition-colors duration-300">
                      <div className="w-3 h-3 bg-primary/60 rounded-full group-hover:bg-primary group-hover:scale-110 transition-all duration-300"></div>
                      <span className="font-medium">Пост #{post.id}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-12 h-px bg-gradient-to-r from-transparent to-primary/30 group-hover:to-primary/60 transition-colors duration-300"></div>
                      <div className="w-2 h-2 bg-primary/40 rounded-full group-hover:bg-primary/80 group-hover:scale-125 transition-all duration-300"></div>
                    </div>
                  </div>
                </div>
                
                {/* Hover эффект */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-xl" />
              </div>
            </article>
          ))}
        </div>

        {/* Подвал секции */}
        <div className="py-16 text-center">
          <div className="inline-flex items-center text-sm text-muted-foreground">
            <div className="w-12 h-px bg-gradient-to-r from-transparent to-border mr-4"></div>
            <span className="font-medium">Конец ленты</span>
            <div className="w-12 h-px bg-gradient-to-l from-transparent to-border ml-4"></div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-card via-card/95 to-muted/20 border-t border-border/50 mt-20 relative overflow-hidden">
        {/* Декоративные элементы */}
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        <div className="absolute top-4 right-8 w-32 h-32 bg-gradient-to-br from-primary/5 to-accent/5 rounded-full blur-3xl" />
        <div className="absolute bottom-8 left-8 w-24 h-24 bg-gradient-to-tr from-accent/5 to-primary/5 rounded-full blur-2xl" />
        
        <div className="max-w-6xl mx-auto px-4 py-16 relative">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Логотип и описание */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 group">
                <div className="p-2 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors duration-300">
                  <SciraLogo className="w-8 h-8 text-primary group-hover:scale-110 transition-transform duration-300" />
                </div>
                <span className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors duration-300">Vega</span>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Современные решения для веб-разработки. Создаем будущее вместе с инновационными технологиями.
              </p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-2 h-2 bg-primary/60 rounded-full animate-pulse" />
                <span>Всегда в движении</span>
              </div>
            </div>
            
            {/* Навигация */}
            <div className="space-y-6">
              <h3 className="font-bold text-foreground text-lg relative">
                Навигация
                <div className="absolute -bottom-2 left-0 w-8 h-0.5 bg-gradient-to-r from-primary to-accent rounded-full" />
              </h3>
              <nav className="space-y-3">
                <Link href="/" className="group flex items-center gap-3 text-muted-foreground hover:text-primary transition-all duration-300">
                  <div className="w-1.5 h-1.5 bg-primary/40 rounded-full group-hover:bg-primary group-hover:scale-125 transition-all duration-300" />
                  <span className="group-hover:translate-x-1 transition-transform duration-300">Главная</span>
                </Link>
                <Link href="/blog" className="group flex items-center gap-3 text-primary font-medium">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full scale-125" />
                  <span className="translate-x-1">Блог</span>
                </Link>
                <Link href="/terms" className="group flex items-center gap-3 text-muted-foreground hover:text-primary transition-all duration-300">
                  <div className="w-1.5 h-1.5 bg-primary/40 rounded-full group-hover:bg-primary group-hover:scale-125 transition-all duration-300" />
                  <span className="group-hover:translate-x-1 transition-transform duration-300">Условия</span>
                </Link>
                <Link href="/privacy-policy" className="group flex items-center gap-3 text-muted-foreground hover:text-primary transition-all duration-300">
                  <div className="w-1.5 h-1.5 bg-primary/40 rounded-full group-hover:bg-primary group-hover:scale-125 transition-all duration-300" />
                  <span className="group-hover:translate-x-1 transition-transform duration-300">Конфиденциальность</span>
                </Link>
              </nav>
            </div>
            
            {/* Социальные сети */}
            <div className="space-y-6">
              <h3 className="font-bold text-foreground text-lg relative">
                Социальные сети
                <div className="absolute -bottom-2 left-0 w-8 h-0.5 bg-gradient-to-r from-accent to-primary rounded-full" />
              </h3>
              <div className="flex gap-4">
                <Link href="https://x.com/sciraai" target="_blank" rel="noopener noreferrer" className="group p-3 rounded-xl bg-muted/50 hover:bg-primary/10 border border-border/50 hover:border-primary/30 transition-all duration-300 hover:scale-105">
                   <XLogo className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors duration-300" />
                 </Link>
                 <Link href="https://git.new/scira" target="_blank" rel="noopener noreferrer" className="group p-3 rounded-xl bg-muted/50 hover:bg-primary/10 border border-border/50 hover:border-primary/30 transition-all duration-300 hover:scale-105">
                   <GithubLogo className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors duration-300" />
                 </Link>
              </div>
              <div className="text-sm text-muted-foreground">
                Следите за нашими обновлениями
              </div>
            </div>
          </div>
          
          {/* Подвал */}
          <div className="border-t border-border/30 mt-12 pt-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-muted-foreground text-sm flex items-center gap-2">
                <span>© {new Date().getFullYear()} Vega. Все права защищены.</span>
                <div className="w-1 h-1 bg-primary/60 rounded-full" />
                <span className="text-xs">Сделано с ❤️</span>
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}