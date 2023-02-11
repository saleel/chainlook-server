type CreateDashboardInput = {
  id: string;
  slug: string;
  cid: string;
  title: string;
  authorId: string;
  authorName: string;
  tags: string[];
  definition: object;
  starred: number;
  createdAt: Date;
  updatedAt: Date;
};

export default class Dashboard {
  id: string;

  slug: string;

  cid: string;

  title: string;

  authorId: string;

  authorName: string;

  tags: string[];

  definition: object;

  starred: number;

  createdAt: Date;

  updatedAt: Date;

  constructor(input: CreateDashboardInput) {
    this.id = input.id;
    this.slug = input.slug;
    this.cid = input.cid;
    this.title = input.title;
    this.tags = input.tags;
    this.authorId = input.authorId;
    this.authorName = input.authorName;
    this.definition = input.definition;
    this.starred = input.starred;
    this.createdAt = input.createdAt;
    this.updatedAt = input.updatedAt;
  }
}
