export class Bookmark {
  bookmarkId?: string;
  userId?: string;
  followerId?: string;
  followingId?: string;

  constructor(bookmark?: { id?: string; userId?: string; followerId?: string; followingId?: string }) {
    this.bookmarkId = bookmark?.id;
    this.userId = bookmark?.userId;
    this.followerId = bookmark?.followerId;
    this.followingId = bookmark?.followingId;
  }

  static parse(raw: any) {
    const bookmark = new Bookmark(raw);
    return bookmark;
  }

  toJson() {
    return {
      bookmarkId: this.bookmarkId || null,
      followerId: this.followerId || null,
      followingId: this.followingId || null,
    };
  }
}
