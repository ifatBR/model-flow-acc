import { Box, FileUpload, Flex, Icon } from "@chakra-ui/react";
import { LuUpload } from "react-icons/lu";
import { HiUpload } from "react-icons/hi";
import { BodyText } from "./Typography";
import { Button } from "./button";

interface UploadFileInputProps {
  uploadFile: (file: File) => void;
}

export function UploadFileInput({ uploadFile }: UploadFileInputProps) {
  const onChange = async (details: {
    acceptedFiles: File[];
    rejectedFiles: FileUpload.FileRejection[];
  }) => {
    const file = details.acceptedFiles?.[0];
    if (!file) return;
    uploadFile(file);
  };

  return (
    <FileUpload.Root
      onFileChange={onChange}
      maxW="xl"
      alignItems="stretch"
      maxFiles={1}
      allowDrop
    >
      <FileUpload.HiddenInput />
      <FileUpload.Trigger asChild>
        <Button variant="secondary" size="sm">
          <HiUpload /> Upload file
        </Button>
      </FileUpload.Trigger>
      <Flex justify="center">
        <BodyText>OR</BodyText>
      </Flex>
      <FileUpload.Dropzone>
        <Icon size="md" color="fg.muted">
          <LuUpload />
        </Icon>
        <FileUpload.DropzoneContent>
          <Box>Drag and drop files here</Box>
          <Box color="fg.muted">.rvt</Box>
        </FileUpload.DropzoneContent>
      </FileUpload.Dropzone>
      <FileUpload.List />
    </FileUpload.Root>
  );
}
