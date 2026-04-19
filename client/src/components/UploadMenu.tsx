import { AbsoluteCenter, Box, Flex, Spinner } from "@chakra-ui/react";
import { UploadFileInput } from "./UploadFileInput";
import { COLORS, RADII, SHADOWS, SPACING } from "@/styles/designTokens";
import { FileTypes } from "@/constants/fileTypes";
import { uploadModel } from "@/api/model";

interface UploadMenuProps {
  accessToken: string | null;
  isLoading: boolean;
  setUrn: (value: string) => void;
  setIsLoading: (value: boolean) => void;
}
export function UploadMenu({
  accessToken,
  isLoading,
  setUrn,
  setIsLoading,
}: UploadMenuProps) {
  const uploadFile = async (file: File) => {
    if (!accessToken) {
      throw new Error("No access token");
    }

    setIsLoading(true);

    const formData = new FormData();
    formData.append("file", file);

    const resData = await uploadModel(formData, accessToken);

    const { urn } = resData;
    setUrn(urn);
  };

  return (
    <AbsoluteCenter h="100vh" bg={COLORS.bg.base}>
      {isLoading ? (
        <Flex direction="column" align="center">
          <Spinner size="lg" />
          <Box color={COLORS.text.inverse} mt="40px">
            Loading...
          </Box>
        </Flex>
      ) : (
        <Box
          bg={COLORS.bg.surface}
          boxShadow={SHADOWS.popup}
          borderRadius={RADII.md}
          p={`${SPACING[4]} ${SPACING[5]}`}
        >
          <UploadFileInput
            uploadFile={uploadFile}
            fileTypes={[FileTypes.RVT, FileTypes.IFC]}
          />
        </Box>
      )}
    </AbsoluteCenter>
  );
}
