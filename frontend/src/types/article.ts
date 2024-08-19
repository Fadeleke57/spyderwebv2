export interface Article {
  id: string;
  header: string;
  author: string;
  date_published: string;
  link: string;
  text: string;
  sentiment: number;
  subjectivity: number;
}

export interface ArticleAsNode {
  id: string;
  header: string;
  author: string;
  date_published: string;
  link: string;
  text: string;
  sentiment: number;
  subjectivity: number;
  x: number;
  y: number;
  fx: number;
  fy: number;
}
