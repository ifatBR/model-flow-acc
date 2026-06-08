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

export async function saveComparisonReport(
  itemId: string,
  earlierVersion: number,
  laterVersion: number,
  modelName: string,
  data: { id: string; diff: string }[],
): Promise<void> {
  await fetch(
    `/api/models/${encodeURIComponent(itemId)}/comparisons/${earlierVersion}/${laterVersion}/report`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ modelName, data }),
    },
  );
}
