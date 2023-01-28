type CreateWidgetInput = {
  id: string;
  slug: string;
  cid: string;
  title: string;
  authorId: string;
  authorName: string;
  tags: string[];
  definition: object;
  createdAt: Date;
  updatedAt: Date;
}

export default class Widget {
  id: string;

  slug: string;

  cid: string;

  title: string;

  authorId: string;

  authorName: string;

  tags: string[];

  definition: object;

  createdAt: Date;

  updatedAt: Date;

  constructor(input: CreateWidgetInput) {
    this.id = input.id;
    this.slug = input.slug;
    this.cid = input.cid;
    this.title = input.title;
    this.tags = input.tags;
    this.authorId = input.authorId;
    this.authorName = input.authorName;
    this.definition = input.definition;
    this.createdAt = input.createdAt;
    this.updatedAt = input.updatedAt;
  }
}
