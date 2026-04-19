export const uploadModel = async (
  formData: FormData,
  accessToken: string,
): Promise<{ urn: string }> => {
  const res = await fetch(
    "http://localhost:3000/api/deriviative/models/upload",
    {
      method: "POST",
      headers: { accessToken: accessToken },
      body: formData,
    },
  );
  const resData = await res.json();
  return resData;
};
