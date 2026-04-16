import { useEffect, useState } from "react";
import { ApsViewer } from "@/components/ApsViewer";
import { Provider } from "@/components/ui/provider";
import { Box } from "@chakra-ui/react";

function App() {
  const [token, setToken] = useState<string>("");
  useEffect(() => {
    const getToken = async () => {
      const tokenRes = await fetch("http://localhost:3000/api/aps/token");
      const tokenData = await tokenRes.json();
      const accessToken = tokenData.access_token;
      setToken(accessToken);
    };
    getToken();
  }, []);

  return (
    <Provider>
      <Box>
        <ApsViewer accessToken={token} />
      </Box>
    </Provider>
  );
}

export default App;
