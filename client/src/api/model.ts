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

export const deleteModel = async (urn: string): Promise<void> => {
  //! Todo: fix it, this is buckets only route
  await fetch(`/api/aps/objects/${urn}`, { method: "DELETE" });
};
