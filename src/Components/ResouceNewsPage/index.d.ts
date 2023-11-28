interface ResourceNewsPageProps {
  selectedPost: newsPost;
  isHoverPicker: boolean;
  setSelectedPost: (item: undefined) => void;
}


declare const ResourceNewsPage: React.FC<ResourceNewsPageProps>
export = ResourceNewsPage