export interface EmailComponent {
  id: string;
  type: 'text' | 'title' | 'image' | 'video' | 'button' | 'divider' | 'spacer' | 'content-card' | 'two-columns-card' | 'banner' | 'footer';
  props: {
    content?: string;
    src?: string;
    alt?: string;
    href?: string;
    fontSize?: number;
    fontWeight?: 'normal' | 'bold';
    color?: string;
    backgroundColor?: string;
    padding?: string;
    margin?: string;
    textAlign?: 'left' | 'center' | 'right';
    borderRadius?: string;
    width?: string;
    height?: string;
    buttonSize?: 'small' | 'medium' | 'large';
    buttonPosition?: 'left' | 'center' | 'right';
    headingLevel?: 'h1' | 'h2' | 'h3';
    title?: string;
    leftColumnTitle?: string;
    leftColumnContent?: string;
    leftColumnSrc?: string;
    leftColumnAlt?: string;
    rightColumnTitle?: string;
    rightColumnContent?: string;
    rightColumnSrc?: string;
    rightColumnAlt?: string;
    fontFamily?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
  };
  children?: EmailComponent[];
  leftChildren?: EmailComponent[];
  rightChildren?: EmailComponent[];
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  components: EmailComponent[];
  globalStyles: {
    backgroundColor: string;
    fontFamily: string;
    fontSize: number;
    color: string;
  };
}

export interface DragItem {
  type: string;
  component?: EmailComponent;
  id?: string;
}

export interface UploadedImage {
  id: string;
  name: string;
  url: string;
  size: number;
  type: 'image' | 'video';
  fileType?: string;
}