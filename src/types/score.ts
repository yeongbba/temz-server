export class Score {
  scoreId?: string;
  userId?: string;
  course?: string;
  date?: string;
  firstHalfScore?: string;
  secondHalfScore?: string;
  image?: string;

  constructor(score?: {
    id?: string;
    userId?: string;
    course?: string;
    date?: string;
    firstHalfScore?: string;
    secondHalfScore?: string;
    image?: string;
  }) {
    this.scoreId = score?.id;
    this.userId = score?.userId;
    this.course = score?.course;
    this.date = score?.date;
    this.firstHalfScore = score?.firstHalfScore;
    this.secondHalfScore = score?.secondHalfScore;
    this.image = score?.image;
  }

  static parse(raw: any) {
    const score = new Score(raw);
    return score;
  }

  toJson() {
    return {
      scoreId: this.scoreId || null,
      course: this.course || null,
      date: this.date || null,
      firstHalfScore: this.firstHalfScore || null,
      secondHalfScore: this.secondHalfScore || null,
      image: this.image || null,
    };
  }
}
