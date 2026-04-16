export const getAccessToken = async (): Promise<string> => {
  const res = await fetch("http://localhost:3000/api/aps/token");
  const tokenData = await res.json();
  return tokenData.access_token;
};
