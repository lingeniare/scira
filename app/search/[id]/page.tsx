import { notFound } from 'next/navigation';
import { ChatInterface } from '@/components/chat-interface';
import { getUser } from '@/lib/auth-utils';
import { getChatById, getMessagesByChatId } from '@/lib/db/queries';
import { type Chat } from '@/lib/db/schema';
import { Metadata } from 'next';
import { convertToUIMessages } from '@/lib/message-utils';

async function sleep(durationMs: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, durationMs));
}

async function fetchChatWithBackoff(id: string): Promise<Chat | undefined> {
  const maximumWaitMs = 15000;
  let delayMs = 500;
  const deadline = Date.now() + maximumWaitMs;

  // First immediate attempt
  let chat = await getChatById({ id });
  if (chat) return chat;

  while (Date.now() < deadline) {
    const remainingMs = deadline - Date.now();
    await sleep(Math.min(delayMs, remainingMs));
    chat = await getChatById({ id });
    if (chat) return chat;
    delayMs = Math.min(delayMs * 2, maximumWaitMs);
  }

  return undefined;
}

// metadata
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const id = (await params).id;
  const chat = await fetchChatWithBackoff(id);
  const user = await getUser();
  // if not chat, return Scira Chat
  if (!chat) {
    return { title: 'Scira Chat' };
  }
  let title;
  // if chat is public, return title
  if (chat.visibility === 'public') {
    title = chat.title;
  }
  // if chat is private, return title
  if (chat.visibility === 'private') {
    if (!user) {
      title = 'Scira Chat';
    }
    if (user!.id !== chat.userId) {
      title = 'Scira Chat';
    }
    title = chat.title;
  }
  return {
    title: title,
    description: 'A search in scira.ai',
    openGraph: {
      title: title,
      url: `https://scira.ai/search/${id}`,
      description: 'A search in scira.ai',
      siteName: 'scira.ai',
      images: [
        {
          url: `https://scira.ai/api/og/chat/${id}`,
          width: 1200,
          height: 630,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: title,
      url: `https://scira.ai/search/${id}`,
      description: 'A search in scira.ai',
      siteName: 'scira.ai',
      creator: '@sciraai',
      images: [
        {
          url: `https://scira.ai/api/og/chat/${id}`,
          width: 1200,
          height: 630,
        },
      ],
    },
    alternates: {
      canonical: `https://scira.ai/search/${id}`,
    },
  } as Metadata;
}



export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { id } = params;
  const chat = await fetchChatWithBackoff(id);

  if (!chat) {
    notFound();
  }

  console.log('Chat: ', chat);

  const user = await getUser();

  if (chat.visibility === 'private') {
    if (!user) {
      return notFound();
    }

    if (user.id !== chat.userId) {
      return notFound();
    }
  }

  // Fetch only the initial 20 messages for faster loading
  const messagesFromDb = await getMessagesByChatId({
    id,
    offset: 0,
  });

  console.log('Messages from DB: ', messagesFromDb);

  const initialMessages = convertToUIMessages(messagesFromDb);

  // Determine if the current user owns this chat
  const isOwner = user ? user.id === chat.userId : false;

  return (
    <ChatInterface
      initialChatId={id}
      initialMessages={initialMessages}
      initialVisibility={chat.visibility as 'public' | 'private'}
      isOwner={isOwner}
    />
  );
}
