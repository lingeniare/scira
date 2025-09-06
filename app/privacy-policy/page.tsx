'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import NextImage from 'next/image';
import { ExternalLink } from 'lucide-react';
import { SciraLogo } from '@/components/logos/scira-logo';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-b from-muted/30 to-transparent" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] bg-[size:24px_24px] opacity-20" />
        <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

        <div className="relative pt-24 pb-12 px-4">
          <motion.div
            className="container max-w-3xl mx-auto space-y-8"
            variants={container}
            initial="hidden"
            animate="show"
          >
            {/* Logo */}
            <motion.div variants={item} className="text-center">
              <Link href="/" className="inline-flex items-center gap-3 font-be-vietnam-pro font-bold">
                <div className="relative w-14 h-14 rounded-full bg-background/90 shadow-sm flex items-center justify-center border">
                  <SciraLogo className="size-8 opacity-90" />
                </div>
              </Link>
            </motion.div>

            <motion.div variants={item} className="text-center">
              <h1 className="text-4xl font-bold tracking-tight">Политика конфиденциальности</h1>
              <p className="text-muted-foreground mt-3">Последнее обновление: 05 сентября 2025</p>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="py-16 px-4">
        <div className="container max-w-3xl mx-auto prose dark:prose-invert prose-neutral prose-headings:font-be-vietnam-pro prose-p:text-muted-foreground prose-a:text-foreground prose-a:no-underline hover:prose-a:text-foreground/80 prose-headings:tracking-tight">
          <p className="text-lg">
            Мы в Vega уважаем вашу конфиденциальность и обязуемся защищать ваши персональные данные.
            Настоящая Политика конфиденциальности объясняет, как мы собираем, используем и защищаем вашу информацию, когда вы используете нашей гибридной системой, на базе искусственного интеллекта.
          </p>

          <h2>Какую информацию мы собираем</h2>
          <p>Мы можем собирать следующие типы информации:</p>
          <ul>
            <li>
              <strong>Данные учетной записи:</strong> Адрес электронной почты (Email), который вы предоставляете при создании профиля на Сайте.
            </li>
            <li>
              <strong>История взаимодействия:</strong> Вопросы, запросы и история вашего общения с нашим сервисом искусственного интеллекта.
            </li>
            <li>
              <strong>Данные об использовании:</strong> Информация о том, как вы взаимодействуете с нашим Сервисом, включая используемые функции и время, проведенное на платформе.
            </li>
            <li>
              <strong>Информация об устройстве:</strong> Информация о вашем устройстве, типе браузера, IP-адресе и операционной системе.
            </li>
            <li>
              <strong>Файлы cookie и аналогичные технологии:</strong> Мы используем файлы cookie и аналогичные технологии для улучшения вашего опыта и сбора информации об использовании. В частности, наш сайт использует систему веб-аналитики Matomo для анализа трафика и поведения пользователей.
            </li>
          </ul>

          <h2>Как мы используем вашу информацию</h2>
          <p>Мы используем вашу информацию в следующих целях:</p>
          <ul>
            <li>Для предоставления, поддержки и улучшения нашего Сервиса.</li>
            <li>Для создания и управления вашей учетной записью.</li>
            <li>Для понимания того, как пользователи взаимодействуют с нашей платформой.</li>
            <li>Для персонализации и улучшения вашего пользовательского опыта.</li>
            <li>Для мониторинга и анализа тенденций и моделей использования.</li>
            <li>Для обнаружения, предотвращения и решения технических проблем.</li>
            <li>Для информирования вас об изменениях в работе сервиса или настоящей Политики.</li>
          </ul>

          <h2>Передача и раскрытие данных</h2>
          <p>Мы можем передавать вашу информацию в следующих случаях:</p>
          <ul>
            <li>
              <strong>Поставщикам услуг:</strong> Третьим лицам, которые помогают нам управлять, улучшать и анализировать наш Сервис. В частности, мы используем:
            </li>
            <ul>
              <li>
                <strong>Систему веб-аналитики Matomo</strong> для сбора и анализа обезличенных данных об использовании Сайта.
              </li>
              <li>
                <strong>Партнеров по обработке ИИ-запросов</strong> для обработки ваших запросов и предоставления ответов.
              </li>
            </ul>
            <li>
              <strong>Соблюдение законов:</strong> Когда это требуется действующим законодательством, в ответ на законные запросы государственных органов (например, в рамках судебного процесса или расследования).
            </li>
            <li>
              <strong>Передача бизнеса:</strong> В связи со слиянием, поглощением или продажей активов.
            </li>
          </ul>
          <p>
            Мы не продаем ваши персональные данные и не передаем их третьим лицам в маркетинговых целях.
          </p>

          <h2>Безопасность данных</h2>
          <p>
            Мы принимаем необходимые и достаточные правовые, организационные и технические меры для защиты вашей личной информации от несанкционированного доступа, изменения, раскрытия или уничтожения. Однако ни один метод передачи данных через Интернет или электронного хранения не является на 100% безопасным, и мы не можем гарантировать абсолютную безопасность.
          </p>

          <h2>Хранение данных</h2>
          <p>
            Хранение персональных данных граждан Российской Федерации осуществляется с использованием баз данных, находящихся на территории Российской Федерации. Мы храним вашу историю взаимодействия с Сервисом для обеспечения его работы. В соответствии с требованиями законодательства Российской Федерации (в частности, Федерального закона от 06.07.2016 № 374-ФЗ, известного как &ldquo;закон Яровой&rdquo;), мы обязаны хранить информацию о фактах приема и обработки сообщений, а также их содержание, в течение установленных законом сроков. Эта информация сохраняется даже после удаления вашего профиля.
          </p>

          <h2>Ваши права</h2>
          <p>В соответствии с законодательством РФ и GDPR, вы имеете право:</p>
          <ul>
            <li>Получать доступ к своим персональным данным, которые мы храним.</li>
            <li>Требовать исправления или обновления ваших персональных данных.</li>
            <li>Требовать удаления вашей учетной записи и связанных с ней персональных данных. Вы можете сделать это, нажав на кнопку «Удалить профиль» в настройках или написав нам на mail@vega.chat. Обратите внимание, что некоторые данные могут храниться дольше в соответствии с требованиями законодательства (см. раздел &ldquo;Хранение данных&rdquo;).</li>
            <li>Возражать против определенных видов обработки или ограничивать их.</li>
            <li>На переносимость данных (получение ваших данных в машиночитаемом формате).</li>
            <li>Отозвать свое согласие на обработку данных в любое время.</li>
          </ul>

          <h2>Конфиденциальность детей</h2>
          <p>
            Наш Сервис не предназначен для детей младше 16 лет. Мы сознательно не собираем личную информацию от детей младше 16 лет. Если вы являетесь родителем или опекуном и считаете, что ваш ребенок предоставил нам личную информацию, пожалуйста, свяжитесь с нами.
          </p>

          <h2>Изменения в настоящей Политике конфиденциальности</h2>
          <p>
            Мы можем время от времени обновлять нашу Политику конфиденциальности. Мы уведомим вас о любых изменениях, опубликовав новую Политику на этой странице и обновив дату «Последнее обновление».
          </p>

          <h2>Свяжитесь с нами</h2>
          <p>Если у вас есть какие-либо вопросы по поводу настоящей Политики конфиденциальности, пожалуйста, свяжитесь с нами по адресу:</p>
          <p>
            <a href="mailto:mail@vega.chat" className="flex items-center gap-1">
              mail@vega.chat <ExternalLink className="h-4 w-4" />
            </a>
          </p>

          <div className="my-8 border-t pt-8">
            <p className="text-sm text-muted-foreground">
              Используя Vega, вы соглашаетесь с нашей Политикой обработки персональных данных (и конфиденцильаности) и нашими{' '}
              <Link href="/terms" className="underline">
                Условиями сервиса 
              </Link>
              .
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-10 mt-10">
        <div className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        <div className="container max-w-3xl mx-auto px-4 pt-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-background border flex items-center justify-center">
                <SciraLogo className="size-4 opacity-80" />
              </div>
              <div className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} VEGA AI ИП
              </div>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link href="/" className="hover:text-foreground transition-colors">
                Home
              </Link>
              <Link href="/about" className="hover:text-foreground transition-colors">
                About
              </Link>
              <Link href="/terms" className="hover:text-foreground transition-colors">
                Terms
              </Link>
              <Link href="/privacy-policy" className="text-foreground font-medium">
                Privacy
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
