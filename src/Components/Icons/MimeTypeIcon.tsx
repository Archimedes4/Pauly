import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import { Shape, SvgProps } from 'react-native-svg';
import {
  AudioIcon,
  DocumentIcon,
  ExcelIcon,
  FolderIcon,
  ImageIcon,
  OneNoteIcon,
  PDFIcon,
  PowerpointIcon,
  VideoIcon,
  WordIcon,
} from '.';

interface iconProps {
  width: number;
  height: number;
  mimeType: string;
  style?: StyleProp<ViewStyle> | undefined;
  props?: Shape<SvgProps> | undefined;
}

const wordTypes = [
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];
const excelTypes = [
  'application/ms-excel',
  'application/msexcel',
  'application/vnd.ms-excel',
];
export const powerpointTypes = [
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.slideshow',
  'application/vnd.openxmlformats-officedocument.presentationml.template',
];

export default function MimeTypeIcon({
  width,
  height,
  style,
  props,
  mimeType,
}: iconProps) {
  return (
    <>
      {mimeType.split('/')[0] === 'image' ? (
        <ImageIcon width={width} height={height} style={style} props={props} />
      ) : null}
      {mimeType.split('/')[0] === 'application' ? (
        <>
          {wordTypes.includes(mimeType) ? (
            <WordIcon
              width={width}
              height={height}
              style={style}
              props={props}
            />
          ) : null}
          {excelTypes.includes(mimeType) ? (
            <ExcelIcon
              width={width}
              height={height}
              style={style}
              props={props}
            />
          ) : null}
          {mimeType === 'application/pdf' ? (
            <PDFIcon
              width={width}
              height={height}
              style={style}
              props={props}
            />
          ) : null}
          {powerpointTypes.includes(mimeType) ? (
            <PowerpointIcon
              width={width}
              height={height}
              style={style}
              props={props}
            />
          ) : null}
          {wordTypes.includes(mimeType) &&
          excelTypes.includes(mimeType) &&
          mimeType !== 'application/pdf' &&
          mimeType !== 'application/vnd.ms-powerpoint' ? (
            <DocumentIcon
              width={width}
              height={height}
              style={style}
              props={props}
            />
          ) : null}
        </>
      ) : null}
      {mimeType.split('/')[0] === 'audio' ? (
        <AudioIcon width={width} height={height} style={style} props={props} />
      ) : null}
      {mimeType.split('/')[0] === 'video' ? (
        <VideoIcon width={width} height={height} style={style} props={props} />
      ) : null}
      {mimeType === 'folder' ? (
        <FolderIcon width={width} height={height} style={style} props={props} />
      ) : null}
      {mimeType.split('/')[0] !== 'image' &&
      mimeType.split('/')[0] !== 'application' &&
      mimeType.split('/')[0] !== 'audio' &&
      mimeType.split('/')[0] !== 'video' &&
      mimeType !== 'folder' ? (
        <>
          {mimeType === 'PowerPoint' ? (
            <PowerpointIcon
              width={width}
              height={height}
              style={style}
              props={props}
            />
          ) : null}
          {mimeType === 'Word' ? (
            <WordIcon
              width={width}
              height={height}
              style={style}
              props={props}
            />
          ) : null}
          {mimeType === 'Excel' ? (
            <ExcelIcon
              width={width}
              height={height}
              style={style}
              props={props}
            />
          ) : null}
          {mimeType === 'Pdf' ? (
            <PDFIcon
              width={width}
              height={height}
              style={style}
              props={props}
            />
          ) : null}
          {mimeType === 'OneNote' || mimeType === 'OneNotePage' ? (
            <OneNoteIcon
              width={width}
              height={height}
              style={style}
              props={props}
            />
          ) : null}
          {mimeType === 'Audio' ? (
            <AudioIcon
              width={width}
              height={height}
              style={style}
              props={props}
            />
          ) : null}
          {mimeType === 'Video' ? (
            <VideoIcon
              width={width}
              height={height}
              style={style}
              props={props}
            />
          ) : null}
          {mimeType === 'Image' ? (
            <ImageIcon
              width={width}
              height={height}
              style={style}
              props={props}
            />
          ) : null}
          {mimeType === 'Folder' ? (
            <FolderIcon
              width={width}
              height={height}
              style={style}
              props={props}
            />
          ) : null}
          {mimeType !== 'PowerPoint' &&
          mimeType !== 'Word' &&
          mimeType !== 'OneNote' &&
          mimeType !== 'OneNotePage' &&
          mimeType !== 'Audio' &&
          mimeType !== 'Video' &&
          mimeType !== 'Image' &&
          mimeType !== 'Folder' ? (
            <DocumentIcon
              width={width}
              height={height}
              style={style}
              props={props}
            />
          ) : null}
        </>
      ) : null}
    </>
  );
}
