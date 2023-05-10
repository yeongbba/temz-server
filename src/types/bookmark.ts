export class Bookmark {
  bookmarkId?: string;
  userId?: string;
  userName?: string;
  userImage?: string;
  followerId?: string;
  followerName?: string;
  followerImage?: string;
  followingId?: string;
  followingName?: string;
  followingImage?: string;

  constructor(bookmark?: {
    id?: string;
    userId?: string;
    userName?: string;
    userImage?: string;
    followerId?: string;
    followerName?: string;
    followerImage?: string;
    followingId?: string;
    followingName?: string;
    followingImage?: string;
  }) {
    this.bookmarkId = bookmark?.id;
    this.userId = bookmark?.userId;
    this.userName = bookmark?.userName;
    this.userImage = bookmark?.userImage;
    this.followerId = bookmark?.followerId;
    this.followerName = bookmark?.followerName;
    this.followerImage = bookmark?.followerImage;
    this.followingId = bookmark?.followingId;
    this.followingName = bookmark?.followingName;
    this.followingImage = bookmark?.followingImage;
  }

  static parse(raw: any) {
    const bookmark = new Bookmark(raw);
    return bookmark;
  }

  toJson() {
    return {
      bookmarkId: this.bookmarkId || null,
      followerName: this.followerName || null,
      followerImage: this.followerImage || null,
      followingName: this.followingName || null,
      followingImage: this.followingImage || null,
    };
  }
}
