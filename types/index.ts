export type Note = {
  id: string;
  title: string;
  content: string;
  created_at: string;
  user_id: string;
};

export type User = {
  id: string;
  email: string;
  created_at: string;
  display_name: string;
  image_url: string;
}; 