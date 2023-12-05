interface ResourceNewsPageProps {
  selectedPost: newsPost;
  setSelectedPost: (item: undefined) => void;
}


declare const ResourceNewsPage: React.FC<ResourceNewsPageProps>
export = ResourceNewsPage