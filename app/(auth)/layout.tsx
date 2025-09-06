'use client';

import Link from 'next/link';
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from '@/components/ui/carousel';
import { useState, useEffect } from 'react';
import Autoplay from 'embla-carousel-autoplay';
import { SciraLogo } from '@/components/logos/scira-logo';

const testimonials = [
  {
    content:
      '"Scira @sciraai лучше справляется с поиском информации в X, чем сам Grok на своей платформе! Я задал 3 разных запроса для поиска данных о своем аккаунте, и Scira справился намного лучше с невероятно точными ответами!"',
    author: 'Chris Universe',
    handle: '@chrisuniverseb',
    link: 'https://x.com/chrisuniverseb/status/1943025911043100835',
  },
  {
    content: '"scira dot ai отлично справляется с поиском в недрах reddit"',
    author: 'nyaaier',
    handle: '@nyaaier',
    link: 'https://x.com/nyaaier/status/1932810453107065284',
  },
  {
    content:
      "Привет @sciraai, из любопытства я поискал информацию о себе, используя Gemini 2.5 Pro в экстремальном режиме, чтобы посмотреть, какие результаты он может выдать. И он создал это 👇🏻 Это не просто лучшее, это невероятно. И самое лучшее - это на 10000% точно.",
    author: 'Aniruddha Dak',
    handle: '@aniruddhadak',
    link: 'https://x.com/aniruddhadak/status/1917140602107445545',
  },
  {
    content:
      '"ничего не читал весь семестр, а теперь с @sciraai готовлюсь к промежуточным экзаменам!! Буквально так хорошо получать все связанные диаграммы, пункты и даже темы с сайта, который мой профессор использует для обучения 🙌"',
    author: 'Rajnandinit',
    handle: '@itsRajnandinit',
    link: 'https://x.com/itsRajnandinit/status/1897896134837682288',
  },
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!api) return;

    setCurrent(api.selectedScrollSnap());

    api.on('select', () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  return (
    <div className="flex items-center justify-between h-screen bg-background">
      <div className="hidden lg:flex lg:w-1/2 h-full bg-muted/30 flex-col">
        <div className="flex-1 flex flex-col justify-between p-12">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2">
              <SciraLogo className="size-8" />
              <span className="text-lg font-medium">Vega AI</span>
            </Link>
          </div>

          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-semibold text-foreground mb-3">ИИ поиск, который действительно понимает вас</h2>
              <p className="text-muted-foreground">Никакой рекламы. Только реальные ответы. От новейших ИИ моделей.</p>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                Что говорят пользователи
              </h3>

              <Carousel
                className="w-full"
                opts={{ loop: true }}
                setApi={setApi}
                plugins={[
                  Autoplay({
                    delay: 4000,
                    stopOnInteraction: true,
                    stopOnMouseEnter: true,
                  }),
                ]}
              >
                <CarouselContent>
                  {testimonials.map((testimonial, index) => (
                    <CarouselItem key={index}>
                      <Link
                        href={testimonial.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block group h-full"
                      >
                        <blockquote className="relative h-full flex flex-col bg-background/50 backdrop-blur-sm border border-border/50 rounded-lg p-6 transition-all duration-200 hover:bg-background/70">
                          <div className="text-sm text-muted-foreground group-hover:text-foreground transition-colors flex-1 text-balance">
                            {testimonial.content}
                          </div>
                          <footer className="mt-3">
                            <div className="flex items-center gap-2">
                              <cite className="text-sm font-medium not-italic text-foreground">
                                {testimonial.author}
                              </cite>
                              <span className="text-xs text-muted-foreground">{testimonial.handle}</span>
                            </div>
                          </footer>
                        </blockquote>
                      </Link>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <div className="flex items-center justify-center gap-1 mt-4">
                  {testimonials.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => api?.scrollTo(index)}
                      className={`w-1.5 h-1.5 rounded-full transition-colors ${
                        index === current ? 'bg-foreground' : 'bg-muted-foreground/30'
                      }`}
                      aria-label={`Перейти к отзыву ${index + 1}`}
                    />
                  ))}
                </div>
              </Carousel>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <a
                href="https://git.new/scira"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors"
              >
                Открытый код
              </a>
              <span>•</span>
              <span>Живой поиск</span>
              <span>•</span>
              <span>Более 1М поисковых запросов</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Представлено на{' '}
              <a
                href="https://vega.chat"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors"
              >
                Vercel
              </a>{' '}
              •{' '}
              <a
                href="https://vega.chat"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors"
              >
                #1 Продукт недели на Peerlist
              </a>
            </p>
          </div>
        </div>
      </div>
      <div className="w-full lg:w-1/2 h-full flex flex-col items-center justify-center px-4 md:px-8">{children}</div>
    </div>
  );
}
