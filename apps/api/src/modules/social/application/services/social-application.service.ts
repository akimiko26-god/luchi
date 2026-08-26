import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../shared/infrastructure/database/prisma.service';
import { CreateCommentDto, CreatePostDto } from '../dto/social.dto';

const FEED_LIMIT = 30;

type AuthorMap = Map<string, { displayName: string; username: string }>;

@Injectable()
export class SocialApplicationService {
  constructor(private readonly prisma: PrismaService) {}

  async getFeed(userId: string) {
    const posts = await this.prisma.post.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { createdAt: 'desc' },
      take: FEED_LIMIT,
      include: {
        comments: {
          where: { status: 'ACTIVE' },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    const authorIds = new Set<string>();
    const commentIds: string[] = [];
    posts.forEach((post) => {
      authorIds.add(post.authorId);
      post.comments.forEach((comment) => {
        authorIds.add(comment.authorId);
        commentIds.push(comment.id);
      });
    });
    const authors = await this.loadAuthors([...authorIds]);

    const [likedPosts, likedComments] = await Promise.all([
      this.prisma.reaction.findMany({
        where: {
          userId,
          targetType: 'POST',
          targetId: { in: posts.map((post) => post.id) },
        },
      }),
      commentIds.length === 0
        ? Promise.resolve([])
        : this.prisma.reaction.findMany({
            where: {
              userId,
              targetType: 'COMMENT',
              targetId: { in: commentIds },
            },
          }),
    ]);
    const likedPostIds = new Set(likedPosts.map((row) => row.targetId));
    const likedCommentIds = new Set(likedComments.map((row) => row.targetId));

    return posts.map((post) => ({
      id: post.id,
      content: post.content,
      likesCount: post.likesCount,
      commentsCount: post.commentsCount,
      liked: likedPostIds.has(post.id),
      createdAt: post.createdAt.toISOString(),
      author: authors.get(post.authorId) ?? { displayName: 'Участник', username: 'user' },
      comments: post.comments.map((comment) => ({
        id: comment.id,
        content: comment.content,
        likesCount: comment.likesCount,
        liked: likedCommentIds.has(comment.id),
        createdAt: comment.createdAt.toISOString(),
        author: authors.get(comment.authorId) ?? { displayName: 'Участник', username: 'user' },
      })),
    }));
  }

  async createPost(userId: string, dto: CreatePostDto) {
    const post = await this.prisma.post.create({
      data: { authorId: userId, content: dto.content.trim() },
    });
    return { id: post.id };
  }

  async toggleLike(userId: string, postId: string) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post || post.status !== 'ACTIVE') {
      throw new NotFoundException('Post not found');
    }

    const existing = await this.prisma.reaction.findUnique({
      where: {
        userId_targetType_targetId: { userId, targetType: 'POST', targetId: postId },
      },
    });

    if (existing) {
      await this.prisma.$transaction([
        this.prisma.reaction.delete({ where: { id: existing.id } }),
        this.prisma.post.update({
          where: { id: postId },
          data: { likesCount: { decrement: 1 } },
        }),
      ]);
      return { liked: false };
    }

    await this.prisma.$transaction([
      this.prisma.reaction.create({
        data: { userId, targetType: 'POST', targetId: postId, reactionType: 'LIKE' },
      }),
      this.prisma.post.update({
        where: { id: postId },
        data: { likesCount: { increment: 1 } },
      }),
    ]);
    return { liked: true };
  }

  async toggleCommentLike(userId: string, commentId: string) {
    const comment = await this.prisma.comment.findUnique({ where: { id: commentId } });
    if (!comment || comment.status !== 'ACTIVE') {
      throw new NotFoundException('Comment not found');
    }

    const existing = await this.prisma.reaction.findUnique({
      where: {
        userId_targetType_targetId: { userId, targetType: 'COMMENT', targetId: commentId },
      },
    });

    if (existing) {
      await this.prisma.$transaction([
        this.prisma.reaction.delete({ where: { id: existing.id } }),
        this.prisma.comment.update({
          where: { id: commentId },
          data: { likesCount: { decrement: 1 } },
        }),
      ]);
      return { liked: false };
    }

    await this.prisma.$transaction([
      this.prisma.reaction.create({
        data: { userId, targetType: 'COMMENT', targetId: commentId, reactionType: 'LIKE' },
      }),
      this.prisma.comment.update({
        where: { id: commentId },
        data: { likesCount: { increment: 1 } },
      }),
    ]);
    return { liked: true };
  }

  async addComment(userId: string, postId: string, dto: CreateCommentDto) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post || post.status !== 'ACTIVE') {
      throw new NotFoundException('Post not found');
    }

    const comment = await this.prisma.$transaction(async (tx) => {
      const created = await tx.comment.create({
        data: { postId, authorId: userId, content: dto.content.trim() },
      });
      await tx.post.update({
        where: { id: postId },
        data: { commentsCount: { increment: 1 } },
      });
      return created;
    });

    return { id: comment.id };
  }

  private async loadAuthors(ids: string[]): Promise<AuthorMap> {
    if (ids.length === 0) {
      return new Map();
    }
    const users = await this.prisma.user.findMany({
      where: { id: { in: ids } },
      select: { id: true, displayName: true, username: true },
    });
    return new Map(users.map((user) => [user.id, { displayName: user.displayName, username: user.username }]));
  }
}
