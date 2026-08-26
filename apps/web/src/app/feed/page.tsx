'use client';

import { Button } from '@luchi/ui';
import { FormEvent, useEffect, useState } from 'react';
import { AppShell } from '../../components/AppShell';
import { api } from '../../lib/api';

type FeedComment = {
  id: string;
  content: string;
  likesCount: number;
  liked: boolean;
  author: { displayName: string };
};

type FeedPost = {
  id: string;
  content: string;
  likesCount: number;
  commentsCount: number;
  liked: boolean;
  createdAt: string;
  author: { displayName: string; username: string };
  comments: FeedComment[];
};

const PREVIEW_COMMENTS = 2;

export default function FeedPage() {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [content, setContent] = useState('');
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function load(): Promise<void> {
    const data = await api<FeedPost[]>('/feed');
    setPosts(data);
  }

  useEffect(() => {
    void load().catch((err: Error) => setError(err.message));
  }, []);

  async function publish(event: FormEvent): Promise<void> {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await api('/posts', { method: 'POST', body: JSON.stringify({ content }) });
      setContent('');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось опубликовать');
    } finally {
      setLoading(false);
    }
  }

  async function like(id: string): Promise<void> {
    await api(`/posts/${id}/like`, { method: 'POST' });
    await load();
  }

  async function likeComment(id: string): Promise<void> {
    await api(`/comments/${id}/like`, { method: 'POST' });
    await load();
  }

  async function sendComment(postId: string): Promise<void> {
    const text = (commentDrafts[postId] ?? '').trim();
    if (!text) {
      return;
    }
    await api(`/posts/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content: text }),
    });
    setCommentDrafts((prev) => ({ ...prev, [postId]: '' }));
    setExpanded((prev) => ({ ...prev, [postId]: true }));
    await load();
  }

  return (
    <AppShell>
      <h1 className="mb-6 text-2xl font-bold">Лента добрых дел</h1>
      <form onSubmit={publish} className="mb-8 rounded-2xl bg-white p-4 shadow-sm">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="mb-3 h-24 w-full rounded-lg border border-gray-100 p-3"
          placeholder="Поделитесь добрым делом..."
          required
        />
        {error && <p className="mb-2 text-sm text-red-500">{error}</p>}
        <Button type="submit" variant="rays" disabled={loading}>
          Опубликовать
        </Button>
      </form>
      <div className="space-y-4">
        {posts.map((post) => {
          const isOpen = expanded[post.id] === true;
          const visibleComments = isOpen ? post.comments : post.comments.slice(0, PREVIEW_COMMENTS);
          return (
            <article key={post.id} className="rounded-2xl bg-white p-5 shadow-sm">
              <p className="text-sm font-semibold">
                {post.author.displayName}{' '}
                <span className="font-normal text-gray-900/50">@{post.author.username}</span>
              </p>
              <p className="mt-2 whitespace-pre-wrap">{post.content}</p>
              <div className="mt-3 flex gap-4 text-sm">
                <button type="button" className="text-sky underline" onClick={() => void like(post.id)}>
                  {post.liked ? '♥' : '♡'} {post.likesCount}
                </button>
                <button
                  type="button"
                  className="text-gray-900/70 underline"
                  onClick={() => setExpanded((prev) => ({ ...prev, [post.id]: !isOpen }))}
                >
                  Комментарии: {post.commentsCount}
                </button>
              </div>
              {visibleComments.length > 0 && (
                <ul className="mt-3 space-y-2 border-t border-gray-100 pt-3 text-sm">
                  {visibleComments.map((comment) => (
                    <li key={comment.id} className="flex items-start justify-between gap-3">
                      <p>
                        <span className="font-medium">{comment.author.displayName}: </span>
                        {comment.content}
                      </p>
                      <button
                        type="button"
                        className="shrink-0 text-sky"
                        onClick={() => void likeComment(comment.id)}
                      >
                        {comment.liked ? '♥' : '♡'} {comment.likesCount}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              {post.comments.length > PREVIEW_COMMENTS && (
                <button
                  type="button"
                  className="mt-2 text-sm text-sky underline"
                  onClick={() => setExpanded((prev) => ({ ...prev, [post.id]: !isOpen }))}
                >
                  {isOpen ? 'Свернуть комментарии' : `Показать все ${post.comments.length}`}
                </button>
              )}
              <form
                className="mt-3 flex gap-2"
                onSubmit={(event) => {
                  event.preventDefault();
                  void sendComment(post.id);
                }}
              >
                <input
                  value={commentDrafts[post.id] ?? ''}
                  onChange={(e) => setCommentDrafts((prev) => ({ ...prev, [post.id]: e.target.value }))}
                  className="flex-1 rounded-lg border border-gray-100 px-3 py-2 text-sm"
                  placeholder="Написать комментарий..."
                  minLength={1}
                  required
                />
                <Button type="submit" size="sm" variant="secondary">
                  Отправить
                </Button>
              </form>
            </article>
          );
        })}
      </div>
    </AppShell>
  );
}
