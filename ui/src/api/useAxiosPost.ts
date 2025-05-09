import { useState, useEffect, useCallback } from "react";
import axios from "axios";

const useAxiosPost = (
  initialUrl,
  initialBody = {},
  reloadOn = [],
  onSuccess,
  onError
) => {
  axios.defaults.withCredentials = true;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [url, setUrl] = useState(initialUrl);
  const [body, setBody] = useState(initialBody);
  const [shouldFetch, setShouldFetch] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(url, body, {
        withCredentials: true,
        headers: {
          "Content-Type": body instanceof FormData
            ? "multipart/form-data"
            : "application/json",
        },
      });
      setData(response.data);
      if (onSuccess) onSuccess(response);
    } catch (err) {
      setError(err);
      if (onError) onError(err);
    } finally {
      setLoading(false);
    }
  }, [url, body, onSuccess, onError]);

  useEffect(() => {
    if (shouldFetch) {
      fetchData();
      setShouldFetch(false);
    }
  }, [fetchData, shouldFetch, ...reloadOn]);

  return {
    data,
    loading,
    error,
    setBody,
    setUrl,
    refetch: () => setShouldFetch(true),
  };
};

export default useAxiosPost;