export const getAccessToken = async (): Promise<string> => {
  const res = await fetch("/api/auth/token");
  const tokenData = await res.json();
  return tokenData.access_token;
};
