export const uploadModel = async (
  formData: FormData,
): Promise<{ urn: string }> => {
  const res = await fetch("/api/deriviative/models/upload", {
    method: "POST",
    body: formData,
  });
  const resData = await res.json();
  return resData;
};
