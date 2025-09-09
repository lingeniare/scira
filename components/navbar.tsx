'use client';

/* eslint-disable @next/next/no-img-element */
import React, { useState, memo, useCallback, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { Plus, GlobeHemisphereWest, Lock, Copy, Check, Share, X } from '@phosphor-icons/react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Crown02Icon } from '@hugeicons/core-free-icons';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { UserProfile } from '@/components/user-profile';
import { ChatHistoryButton } from '@/components/chat-history-dialog';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

import { ClassicLoader } from '@/components/ui/loading';
import { useRouter, usePathname } from 'next/navigation';
import { ComprehensiveUserData } from '@/lib/user-data-server';

type VisibilityType = 'public' | 'private';

interface NavbarProps {
  isDialogOpen: boolean;
  chatId: string | null;
  selectedVisibilityType: VisibilityType;
  onVisibilityChange: (visibility: VisibilityType) => void | Promise<void>;
  status: string;
  user: ComprehensiveUserData | null;
  onHistoryClick: () => void;
  isOwner?: boolean;
  subscriptionData?: any;
  isProUser?: boolean;
  isUltraUser?: boolean;
  isProStatusLoading?: boolean;
  isCustomInstructionsEnabled?: boolean;
  setIsCustomInstructionsEnabled?: (value: boolean | ((val: boolean) => boolean)) => void;
}

const Navbar = memo(
  ({
    isDialogOpen,
    chatId,
    selectedVisibilityType,
    onVisibilityChange,
    status,
    user,
    onHistoryClick,
    isOwner = true,
    subscriptionData,
    isProUser,
    isUltraUser,
    isProStatusLoading,
    isCustomInstructionsEnabled,
    setIsCustomInstructionsEnabled,
  }: NavbarProps) => {
    const [copied, setCopied] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [privateDropdownOpen, setPrivateDropdownOpen] = useState(false);
    const [isChangingVisibility, setIsChangingVisibility] = useState(false);
    const router = useRouter();
    const pathname = usePathname();
    const isSearchWithId = useMemo(() => Boolean(pathname && /^\/search\/[^/]+/.test(pathname)), [pathname]);

    // Use passed Pro status directly
    const hasActiveSubscription = isProUser;
    const showProLoading = isProStatusLoading;

    const handleCopyLink = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (!chatId) return;

      const url = `https://vega.chat/search/${chatId}`;
      navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success('Link copied to clipboard');

      setTimeout(() => setCopied(false), 2000);
    };

    // Generate the share URL
    const shareUrl = chatId ? `https://vega.chat/search/${chatId}` : '';

    // Social media share handlers
    const handleShareVK = (e: React.MouseEvent) => {
      e.preventDefault();
      const vkUrl = `https://vk.com/share.php?url=${encodeURIComponent(shareUrl)}`;
      window.open(vkUrl, '_blank', 'noopener,noreferrer');
    };

    const handleVisibilityChange = async (newVisibility: VisibilityType) => {
      setIsChangingVisibility(true);
      try {
        await onVisibilityChange(newVisibility);
        // If changing from private to public, open the public dropdown immediately
        if (newVisibility === 'public') {
          setDropdownOpen(true);
        }
      } finally {
        setIsChangingVisibility(false);
        setPrivateDropdownOpen(false);
      }
    };

    return (
      <>
        <div
          className={cn(
            'fixed left-0 right-0 z-30 top-0 flex justify-between items-center p-3 transition-colors duration-200',
            isDialogOpen
              ? 'bg-transparent pointer-events-none'
              : status === 'streaming' || status === 'ready'
                ? 'bg-background/95 backdrop-blur-sm supports-backdrop-filter:bg-background/60'
                : 'bg-background',
          )}
        >
          <div className={cn('flex items-center gap-3', isDialogOpen ? 'pointer-events-auto' : '')}>
            <Link href="/new">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="rounded-lg bg-accent hover:bg-accent/80 group transition-all hover:scale-105 pointer-events-auto"
              >
                <Plus size={16} className="group-hover:rotate-90 transition-all" />
                <span className="text-sm ml-1.5 group-hover:block hidden animate-in fade-in duration-300">Новый чат</span>
              </Button>
            </Link>

            {/* Mobile-only Upgrade (avoids overlap with share on small screens) */}
            {user && !hasActiveSubscription && !showProLoading && (
              <Button
                variant="default"
                size="sm"
                className="rounded-md h-7 px-2 text-xs sm:hidden"
                onClick={() => router.push('/pricing')}
              >
                Upgrade
              </Button>
            )}
          </div>

          {/* Centered Upgrade Button */}
          {user && !hasActiveSubscription && !showProLoading && (
            <div
              className={cn(
                'hidden sm:flex items-center justify-center absolute left-1/2 transform -translate-x-1/2',
                isDialogOpen ? 'pointer-events-auto' : '',
              )}
            >
              <div className="flex items-center bg-muted/50 rounded-lg border border-border">
                <span className="px-2 py-1.5 text-sm font-medium text-muted-foreground">Free</span>
                <Button
                  variant="default"
                  size="sm"
                  className="rounded-md mr-1.5 h-6"
                  onClick={() => router.push('/pricing')}
                >
                  Улучшить
                </Button>
              </div>
            </div>
          )}
          <div className={cn('flex items-center gap-2', isDialogOpen ? 'pointer-events-auto' : '')}>
            {/* Visibility indicator or toggle based on authentication and ownership */}
            {chatId && (
              <>
                {user && isOwner ? (
                  /* Authenticated chat owners get toggle and share option */
                  <>
                    {selectedVisibilityType === 'public' ? (
                      /* Public chat - show dropdown for copying link */
                      <DropdownMenu
                        open={dropdownOpen}
                        onOpenChange={!isChangingVisibility ? setDropdownOpen : undefined}
                      >
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="secondary"
                            size="sm"
                            className="pointer-events-auto bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                            disabled={isChangingVisibility}
                          >
                            {isChangingVisibility ? (
                              <>
                                <ClassicLoader size="sm" className="text-blue-600 dark:text-blue-400" />
                                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Сохранено...</span>
                              </>
                            ) : (
                              <>
                                <GlobeHemisphereWest size={16} className="text-blue-600 dark:text-blue-400" />
                                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Ссылка активна</span>
                                <Copy size={14} className="ml-1 text-blue-600 dark:text-blue-400 opacity-70" />
                              </>
                            )}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-64 sm:w-72 p-3 ml-2 sm:m-auto">
                          <div className="space-y-3">
                            <header className="flex justify-between items-center">
                              <h4 className="text-sm font-medium">Поделиться</h4>
                              <div className="flex gap-2">
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  className="h-7 text-xs"
                                  onClick={() => handleVisibilityChange('private')}
                                  disabled={isChangingVisibility}
                                >
                                  <Lock size={12} className="mr-1" />
                                  Убрать ссылку
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="size-7"
                                  onClick={() => setDropdownOpen(false)}
                                  disabled={isChangingVisibility}
                                >
                                  <svg
                                    width="14"
                                    height="14"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  >
                                    <path d="M18 6 6 18" />
                                    <path d="m6 6 12 12" />
                                  </svg>
                                </Button>
                              </div>
                            </header>

                            <div className="flex items-center gap-2 bg-muted/50 rounded-md p-2 border border-border">
                              <div className="truncate flex-1 text-xs text-muted-foreground font-mono">{shareUrl}</div>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="size-7"
                                onClick={handleCopyLink}
                                title="Copy to clipboard"
                              >
                                {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                              </Button>
                            </div>

                            <footer className="flex flex-col space-y-2">
                              <div className="flex justify-center items-center">
                                <p className="text-xs text-muted-foreground">
                                  Страницу увидят все, у кого есть ссылка
                                </p>
                              </div>

                              <div className="flex justify-center gap-2 pt-1">
                                {typeof navigator !== 'undefined' && 'share' in navigator && (
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    className="size-8"
                                    onClick={() => {
                                      navigator
                                        .share({
                                          title: 'Shared Page',
                                          url: shareUrl,
                                        })
                                        .catch(console.error);
                                    }}
                                  >
                                    <Share size={16} />
                                  </Button>
                                )}
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="size-8"
                                  onClick={handleShareVK}
                                  title="Share on VK"
                                >
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M15.684 0H8.316C1.592 0 0 1.592 0 8.316v7.368C0 22.408 1.592 24 8.316 24h7.368C22.408 24 24 22.408 24 15.684V8.316C24 1.592 22.408 0 15.684 0zm3.692 17.123h-1.744c-.66 0-.864-.525-2.05-1.727-1.033-1.01-1.49-.9-1.744-.9-.356 0-.458.102-.458.593v1.575c0 .424-.135.678-1.253.678-1.846 0-3.896-1.118-5.335-3.202C4.624 10.857 4.03 8.57 4.03 8.096c0-.254.102-.491.593-.491h1.744c.441 0 .61.203.78.677.863 2.49 2.303 4.675 2.896 4.675.22 0 .322-.102.322-.66V9.721c-.068-1.186-.695-1.287-.695-1.71 0-.204.169-.407.441-.407h2.744c.373 0 .508.203.508.643v3.473c0 .372.169.508.271.508.22 0 .407-.136.813-.542 1.254-1.406 2.151-3.574 2.151-3.574.119-.254.322-.491.763-.491h1.744c.525 0 .644.271.525.643-.22 1.017-2.354 4.031-2.354 4.031-.186.305-.254.44 0 .78.186.254.796.779 1.203 1.253.745.847 1.32 1.558 1.473 2.05.17.49-.085.744-.576.744z"/>
                                  </svg>
                                </Button>
                              </div>
                            </footer>
                          </div>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ) : (
                      /* Private chat - dropdown prompt to make public */
                      <DropdownMenu
                        open={privateDropdownOpen}
                        onOpenChange={!isChangingVisibility ? setPrivateDropdownOpen : undefined}
                      >
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="secondary"
                            size="sm"
                            className="pointer-events-auto bg-muted/50 border border-border hover:bg-muted/70 transition-colors"
                            disabled={isChangingVisibility}
                          >
                            {isChangingVisibility ? (
                              <>
                                <ClassicLoader size="sm" className="text-muted-foreground" />
                                <span className="text-sm font-medium text-muted-foreground">Saving...</span>
                              </>
                            ) : (
                              <>
                                <Share size={16} className="text-muted-foreground" />
                                <span className="text-sm font-medium text-muted-foreground">Поделиться</span>
                              </>
                            )}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-64 sm:w-72 p-3 ml-2 sm:m-auto">
                          <div className="space-y-3">
                            <header className="flex justify-between items-center">
                              <h4 className="text-sm font-medium">Поделиться</h4>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-7"
                                onClick={() => setPrivateDropdownOpen(false)}
                                disabled={isChangingVisibility}
                              >
                                <svg
                                  width="14"
                                  height="14"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <path d="M18 6 6 18" />
                                  <path d="m6 6 12 12" />
                                </svg>
                              </Button>
                            </header>

                            <div className="space-y-2">
                              <p className="text-sm text-muted-foreground">
                                Сделать страницу доступной для всех, у кого есть ссылка.
                              </p>
                            </div>

                            <footer className="flex justify-end gap-2 pt-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-xs"
                                onClick={() => setPrivateDropdownOpen(false)}
                                disabled={isChangingVisibility}
                              >
                                Отменить
                              </Button>
                              <Button
                                variant="default"
                                size="sm"
                                className="text-xs"
                                onClick={() => handleVisibilityChange('public')}
                                disabled={isChangingVisibility}
                              >
                                <Share size={12} className="mr-1" />
                                Поделитться
                              </Button>
                            </footer>
                          </div>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </>
                ) : (
                  /* Non-owners (authenticated or not) just see indicator */
                  selectedVisibilityType === 'public' && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="secondary"
                          size="sm"
                          className="pointer-events-auto bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 opacity-80 cursor-not-allowed"
                          disabled
                        >
                          <GlobeHemisphereWest size={16} className="text-blue-600 dark:text-blue-400" />
                          <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Shared</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" sideOffset={4}>
                        {user ? "This is someone else's shared page" : 'This is a shared page'}
                      </TooltipContent>
                    </Tooltip>
                  )
                )}
              </>
            )}

            {/* Subscription Status - show loading or Pro status only */}
            {user && isSearchWithId && (
              <>
                {showProLoading ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="rounded-md pointer-events-auto flex items-center gap-1.5 px-3 py-1.5 bg-muted/50 border border-border">
                        <div className="size-4 rounded-full bg-muted animate-pulse" />
                        <div className="w-8 h-3 bg-muted rounded animate-pulse hidden sm:block" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" sideOffset={4}>
                      Loading subscription status...
                    </TooltipContent>
                  </Tooltip>
                ) : isUltraUser ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="pointer-events-auto">
                        <span className="font-baumans! inline-flex items-center gap-1 rounded-lg shadow-sm border-transparent ring-1 ring-ring/35 ring-offset-1 ring-offset-background bg-gradient-to-br from-secondary/25 via-primary/20 to-accent/25 text-foreground px-2.5 pt-0.5 pb-1.25 sm:pt-1 leading-5 dark:bg-gradient-to-br dark:from-primary dark:via-secondary dark:to-primary dark:text-foreground">
                          <span>ultra</span>
                        </span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" sideOffset={4}>
                      Ultra Subscribed - Premium access
                    </TooltipContent>
                  </Tooltip>
                ) : hasActiveSubscription ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="pointer-events-auto">
                        <span className="font-baumans! inline-flex items-center gap-1 rounded-lg shadow-sm border-transparent ring-1 ring-ring/35 ring-offset-1 ring-offset-background bg-gradient-to-br from-secondary/25 via-primary/20 to-accent/25 text-foreground px-2.5 pt-0.5 pb-1.25 sm:pt-1 leading-5 dark:bg-gradient-to-br dark:from-primary dark:via-secondary dark:to-primary dark:text-foreground">
                          <span>pro</span>
                        </span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" sideOffset={4}>
                      Pro Subscribed - Unlimited access
                    </TooltipContent>
                  </Tooltip>
                ) : null}
              </>
            )}

            {/* Chat History Button */}
            <ChatHistoryButton onClickAction={onHistoryClick} />

            {/* Memoized UserProfile component */}
            <UserProfile
              user={user}
              subscriptionData={subscriptionData}
              isProUser={isProUser}
              isProStatusLoading={isProStatusLoading}
              isUltraUser={isUltraUser}
              isCustomInstructionsEnabled={isCustomInstructionsEnabled}
              setIsCustomInstructionsEnabled={setIsCustomInstructionsEnabled}
            />
          </div>
        </div>
      </>
    );
  },
);

Navbar.displayName = 'Navbar';

export { Navbar };
